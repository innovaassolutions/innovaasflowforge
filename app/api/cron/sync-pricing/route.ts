/**
 * Pricing Sync Cron Job
 *
 * Scheduled endpoint that checks for pricing discrepancies
 * and notifies admins when updates are needed.
 *
 * Vercel Cron Schedule: Daily at 6 AM UTC
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/sync-pricing",
 *     "schedule": "0 6 * * *"
 *   }]
 * }
 *
 * Story: billing-6-1-implement-provider-pricing-api
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { render } from '@react-email/components'
import { getResendClient } from '@/lib/resend'
import {
  syncAllPricing,
  getPricingVerificationStatus,
  getVerificationReminderMessage,
  logPriceChange,
  KNOWN_PRICING,
  type SyncResult,
  type PriceChangeLogEntry,
} from '@/lib/services/pricing-sync'
import { PricingChangeAlertEmail } from '@/lib/email/templates/pricing-change-alert'

// ============================================================================
// Types
// ============================================================================

interface CronResponse {
  success: boolean
  timestamp: string
  results: SyncResult[]
  summary: {
    totalModelsChecked: number
    totalDiscrepancies: number
    totalNewModels: number
    totalErrors: number
    verificationStatus: {
      daysSinceVerification: number
      staleModels: string[]
    }
  }
  notificationSent: boolean
  emailSent: boolean
  changesLogged: number
  reminderMessage: string | null
}

// ============================================================================
// Database Client
// ============================================================================

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ============================================================================
// Notification Functions
// ============================================================================

/**
 * Send notification to platform admins about pricing issues
 */
async function notifyAdmins(
  discrepancies: SyncResult[],
  reminderMessage: string | null
): Promise<boolean> {
  const supabase = getServiceClient()

  // Get all admin users
  const { data: admins, error } = await supabase
    .from('user_profiles')
    .select('id, email, full_name')
    .eq('user_type', 'admin')

  if (error || !admins || admins.length === 0) {
    console.log('[PricingSync] No admins found to notify')
    return false
  }

  // Build notification content
  const totalDiscrepancies = discrepancies.reduce((sum, r) => sum + r.discrepancies.length, 0)
  const totalNewModels = discrepancies.reduce((sum, r) => sum + r.newModels.length, 0)

  if (totalDiscrepancies === 0 && totalNewModels === 0 && !reminderMessage) {
    console.log('[PricingSync] No issues to report, skipping notification')
    return false
  }

  // Create notification for each admin
  const notifications = admins.map(admin => ({
    user_id: admin.id,
    notification_type: 'pricing_sync_alert',
    title: 'AI Model Pricing Review Required',
    message: buildNotificationMessage(discrepancies, reminderMessage, totalDiscrepancies, totalNewModels),
    metadata: {
      totalDiscrepancies,
      totalNewModels,
      providers: discrepancies.map(r => r.provider),
      timestamp: new Date().toISOString(),
    },
    is_read: false,
    created_at: new Date().toISOString(),
  }))

  // Check if usage_notifications table exists - if not, just log
  const { error: insertError } = await supabase
    .from('usage_notifications')
    .insert(notifications)

  if (insertError) {
    console.log('[PricingSync] Could not insert notification (table may not exist):', insertError.message)
    // Log to console as fallback
    console.log('[PricingSync] ADMIN NOTIFICATION:', notifications[0]?.message)
    return false
  }

  console.log(`[PricingSync] Sent notifications to ${admins.length} admin(s)`)
  return true
}

/**
 * Send email alerts to platform admins
 */
async function sendEmailAlerts(
  results: SyncResult[],
  timestamp: string
): Promise<boolean> {
  const supabase = getServiceClient()

  // Get admin users with email
  const { data: admins, error } = await supabase
    .from('user_profiles')
    .select('id, email, full_name')
    .eq('user_type', 'admin')

  if (error || !admins || admins.length === 0) {
    console.log('[PricingSync] No admins found for email alert')
    return false
  }

  // Build changes array for email
  const changes: Array<{
    modelId: string
    displayName: string
    provider: string
    oldInputRate: number | null
    oldOutputRate: number | null
    newInputRate: number
    newOutputRate: number
    inputChangePercent: number | null
    outputChangePercent: number | null
    changeType: 'update' | 'new_model' | 'manual'
  }> = []

  for (const result of results) {
    // Add discrepancies as potential updates
    for (const d of result.discrepancies) {
      const known = KNOWN_PRICING.find(k => k.modelId === d.modelId)
      if (known) {
        // Check if we already have this model in changes
        const existing = changes.find(c => c.modelId === d.modelId)
        if (existing) {
          // Update the existing entry
          if (d.field === 'input') {
            existing.inputChangePercent = d.differencePercent
          } else {
            existing.outputChangePercent = d.differencePercent
          }
        } else {
          changes.push({
            modelId: d.modelId,
            displayName: d.displayName,
            provider: d.provider,
            oldInputRate: d.field === 'input' ? d.currentRate : null,
            oldOutputRate: d.field === 'output' ? d.currentRate : null,
            newInputRate: known.inputRatePerMillion,
            newOutputRate: known.outputRatePerMillion,
            inputChangePercent: d.field === 'input' ? d.differencePercent : null,
            outputChangePercent: d.field === 'output' ? d.differencePercent : null,
            changeType: 'update',
          })
        }
      }
    }

    // Add new models
    for (const modelId of result.newModels) {
      const known = KNOWN_PRICING.find(k => k.modelId === modelId)
      if (known) {
        changes.push({
          modelId: known.modelId,
          displayName: known.displayName,
          provider: known.provider,
          oldInputRate: null,
          oldOutputRate: null,
          newInputRate: known.inputRatePerMillion,
          newOutputRate: known.outputRatePerMillion,
          inputChangePercent: null,
          outputChangePercent: null,
          changeType: 'new_model',
        })
      }
    }
  }

  if (changes.length === 0) {
    console.log('[PricingSync] No changes to email about')
    return false
  }

  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://flowforge.innovaas.co'}/dashboard/admin/billing`

  // Send email to each admin
  try {
    const resend = getResendClient()

    for (const admin of admins) {
      if (!admin.email) continue

      const emailHtml = await render(
        PricingChangeAlertEmail({
          adminName: admin.full_name || 'Admin',
          changes,
          dashboardUrl,
          syncedAt: timestamp,
        })
      )

      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'FlowForge <noreply@flowforge.innovaas.co>',
        to: admin.email,
        subject: `FlowForge: AI Pricing Changes Detected (${changes.length} model${changes.length > 1 ? 's' : ''})`,
        html: emailHtml,
      })

      console.log(`[PricingSync] Email sent to ${admin.email}`)
    }

    return true
  } catch (error) {
    console.error('[PricingSync] Failed to send email:', error)
    return false
  }
}

/**
 * Log all pricing changes to the database
 */
async function logAllChanges(results: SyncResult[]): Promise<number> {
  let logged = 0

  for (const result of results) {
    // Log discrepancies
    for (const d of result.discrepancies) {
      const known = KNOWN_PRICING.find(k => k.modelId === d.modelId)
      if (known) {
        await logPriceChange({
          modelId: d.modelId,
          provider: d.provider,
          displayName: d.displayName,
          oldInputRate: d.field === 'input' ? d.currentRate : null,
          oldOutputRate: d.field === 'output' ? d.currentRate : null,
          newInputRate: known.inputRatePerMillion,
          newOutputRate: known.outputRatePerMillion,
          inputChangePercent: d.field === 'input' ? d.differencePercent : null,
          outputChangePercent: d.field === 'output' ? d.differencePercent : null,
          changeType: 'update',
        })
        logged++
      }
    }

    // Log new models
    for (const modelId of result.newModels) {
      const known = KNOWN_PRICING.find(k => k.modelId === modelId)
      if (known) {
        await logPriceChange({
          modelId: known.modelId,
          provider: known.provider,
          displayName: known.displayName,
          oldInputRate: null,
          oldOutputRate: null,
          newInputRate: known.inputRatePerMillion,
          newOutputRate: known.outputRatePerMillion,
          inputChangePercent: null,
          outputChangePercent: null,
          changeType: 'new_model',
        })
        logged++
      }
    }
  }

  return logged
}

/**
 * Build notification message for admins
 */
function buildNotificationMessage(
  results: SyncResult[],
  reminderMessage: string | null,
  totalDiscrepancies: number,
  totalNewModels: number
): string {
  const lines: string[] = []

  if (totalDiscrepancies > 0) {
    lines.push(`Found ${totalDiscrepancies} pricing discrepancy(ies) between known rates and database:`)

    for (const result of results) {
      for (const d of result.discrepancies) {
        lines.push(`  - ${d.displayName}: ${d.field} rate differs by ${d.differencePercent.toFixed(1)}%`)
        lines.push(`    Current: $${d.currentRate}/1M, Known: $${d.knownRate}/1M`)
      }
    }
  }

  if (totalNewModels > 0) {
    lines.push('')
    lines.push(`Found ${totalNewModels} new model(s) not in database:`)
    for (const result of results) {
      for (const model of result.newModels) {
        lines.push(`  - ${model}`)
      }
    }
  }

  if (reminderMessage) {
    lines.push('')
    lines.push(reminderMessage)
  }

  lines.push('')
  lines.push('Please review pricing at /dashboard/admin/billing and update if needed.')

  return lines.join('\n')
}

// ============================================================================
// Cron Handler
// ============================================================================

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel adds this header for cron jobs)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // In production, require authorization
  if (process.env.NODE_ENV === 'production' && cronSecret) {
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.log('[PricingSync] Unauthorized cron request')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  console.log('[PricingSync] Starting scheduled pricing sync...')

  const response: CronResponse = {
    success: true,
    timestamp: new Date().toISOString(),
    results: [],
    summary: {
      totalModelsChecked: 0,
      totalDiscrepancies: 0,
      totalNewModels: 0,
      totalErrors: 0,
      verificationStatus: {
        daysSinceVerification: 0,
        staleModels: [],
      },
    },
    notificationSent: false,
    emailSent: false,
    changesLogged: 0,
    reminderMessage: null,
  }

  try {
    // Run pricing sync for all providers
    response.results = await syncAllPricing()

    // Calculate summary
    for (const result of response.results) {
      response.summary.totalModelsChecked += result.modelsChecked
      response.summary.totalDiscrepancies += result.discrepancies.length
      response.summary.totalNewModels += result.newModels.length
      response.summary.totalErrors += result.errors.length
    }

    // Get verification status
    const verificationStatus = getPricingVerificationStatus()
    response.summary.verificationStatus = {
      daysSinceVerification: verificationStatus.daysSinceVerification,
      staleModels: verificationStatus.staleModels,
    }

    // Get reminder message if pricing is stale
    response.reminderMessage = getVerificationReminderMessage()

    // Log changes to database and send alerts if there are issues
    if (response.summary.totalDiscrepancies > 0 || response.summary.totalNewModels > 0) {
      // Log all changes to the pricing_change_log table
      response.changesLogged = await logAllChanges(response.results)

      // Send email alerts to admins
      response.emailSent = await sendEmailAlerts(response.results, response.timestamp)

      // Send in-app notification
      response.notificationSent = await notifyAdmins(response.results, response.reminderMessage)
    } else if (response.reminderMessage) {
      // Just send reminder notification (no changes, but stale data)
      response.notificationSent = await notifyAdmins(response.results, response.reminderMessage)
    }

    // Mark as failed if there were errors
    if (response.summary.totalErrors > 0) {
      response.success = false
    }

    console.log('[PricingSync] Sync completed:', {
      modelsChecked: response.summary.totalModelsChecked,
      discrepancies: response.summary.totalDiscrepancies,
      newModels: response.summary.totalNewModels,
      errors: response.summary.totalErrors,
    })

  } catch (error) {
    console.error('[PricingSync] Sync failed:', error)
    response.success = false
    response.results.push({
      syncedAt: new Date().toISOString(),
      provider: 'all',
      modelsChecked: 0,
      discrepancies: [],
      newModels: [],
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      status: 'failed',
    })
  }

  return NextResponse.json(response)
}
