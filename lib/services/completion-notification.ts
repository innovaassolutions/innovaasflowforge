/**
 * Session Completion Notification Service
 *
 * Sends multi-channel notifications to coaches, consultants, and school admins
 * when a participant completes an interview or assessment.
 *
 * Works across all verticals: coaching, consulting, and education.
 * Dispatches to all enabled channels (email, Slack, Telegram, WhatsApp)
 * based on tenant notification preferences.
 */

import { createClient } from '@supabase/supabase-js'
import { dispatchNotification, dispatchEmailOnly } from './notification-dispatcher'
import type { NotificationPayload } from './notification-channels'

// ============================================================================
// Types
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any

interface CompletionNotificationParams {
  participantName: string
  assessmentType: string
  dashboardPath: string
}

interface TenantNotificationParams extends CompletionNotificationParams {
  tenantId: string
}

interface CampaignNotificationParams extends CompletionNotificationParams {
  campaignId: string
}

// ============================================================================
// Supabase Client
// ============================================================================

function getServiceClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Notify a coach when a coaching session completes.
 * Looks up the coach email via tenant_profiles -> auth.users.
 * Dispatches to all enabled notification channels.
 */
export async function notifyTenantOwner(
  params: TenantNotificationParams,
  supabase?: SupabaseClient
): Promise<void> {
  const client = supabase || getServiceClient()

  const { data: tenantProfile } = await (client
    .from('tenant_profiles') as any)
    .select('user_id, display_name, brand_config, email_config')
    .eq('id', params.tenantId)
    .single()

  if (!tenantProfile?.user_id) {
    console.error('[CompletionNotification] No user_id found for tenant', params.tenantId)
    return
  }

  // Get coach email from auth.users
  const { data: userData } = await client.auth.admin.getUserById(tenantProfile.user_id)
  const recipientEmail = userData?.user?.email
  if (!recipientEmail) {
    console.error('[CompletionNotification] No email found for user', tenantProfile.user_id)
    return
  }

  const brandConfig = (tenantProfile.brand_config || {}) as {
    logo?: { url: string; alt?: string }
    colors?: {
      primary?: string
      background?: string
      text?: string
      textMuted?: string
    }
    tagline?: string
  }

  const emailConfig = (tenantProfile.email_config || {}) as {
    senderName?: string
    emailFooter?: string
  }

  const senderName = emailConfig.senderName || tenantProfile.display_name || 'FlowForge'
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const payload: NotificationPayload = {
    eventType: 'session_completed',
    tenantId: params.tenantId,
    participantName: params.participantName,
    assessmentType: params.assessmentType,
    dashboardUrl: `${baseUrl}${params.dashboardPath}`,
    completedAt: new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
  }

  const results = await dispatchNotification(params.tenantId, recipientEmail, payload, {
    brandConfig,
    emailConfig,
    senderName,
    supabase: client,
  })

  for (const r of results) {
    if (r.status === 'failed') {
      console.error(`[CompletionNotification] ${r.channel} failed:`, r.error)
    } else {
      console.log(`[CompletionNotification] ${r.channel} sent to ${r.recipient}`)
    }
  }
}

/**
 * Notify a consultant/facilitator when a campaign interview completes.
 * If the campaign has a tenant_id, dispatches to all enabled channels.
 * Otherwise, falls back to email-only (legacy behavior).
 */
export async function notifyCampaignOwner(
  params: CampaignNotificationParams,
  supabase?: SupabaseClient
): Promise<void> {
  const client = supabase || getServiceClient()

  const { data: campaign } = await (client
    .from('campaigns') as any)
    .select('facilitator_name, facilitator_email, created_by, tenant_id')
    .eq('id', params.campaignId)
    .single()

  if (!campaign) {
    console.error('[CompletionNotification] Campaign not found', params.campaignId)
    return
  }

  const recipientEmail = campaign.facilitator_email
  if (!recipientEmail) {
    console.error('[CompletionNotification] No facilitator email for campaign', params.campaignId)
    return
  }

  const senderName = campaign.facilitator_name || 'FlowForge'
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const payload: NotificationPayload = {
    eventType: 'session_completed',
    tenantId: campaign.tenant_id || '',
    participantName: params.participantName,
    assessmentType: params.assessmentType,
    dashboardUrl: `${baseUrl}${params.dashboardPath}`,
    completedAt: new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
    metadata: { campaign_id: params.campaignId },
  }

  if (campaign.tenant_id) {
    const results = await dispatchNotification(campaign.tenant_id, recipientEmail, payload, {
      senderName,
      supabase: client,
    })

    for (const r of results) {
      if (r.status === 'failed') {
        console.error(`[CompletionNotification] ${r.channel} failed:`, r.error)
      } else {
        console.log(`[CompletionNotification] ${r.channel} sent to ${r.recipient}`)
      }
    }
  } else {
    // Fallback: email-only for campaigns without tenant_id
    const result = await dispatchEmailOnly(recipientEmail, payload, {
      senderName,
      supabase: client,
    })

    if (result.status === 'failed') {
      console.error('[CompletionNotification] Email send error:', result.error)
    } else {
      console.log(`[CompletionNotification] Sent to ${result.recipient} (email only)`)
    }
  }
}

/**
 * Notify a school admin when an education interview completes.
 * If the campaign has a tenant_id, dispatches to all enabled channels.
 * Otherwise, falls back to email-only (legacy behavior).
 */
export async function notifyEducationAdmin(
  params: CampaignNotificationParams,
  supabase?: SupabaseClient
): Promise<void> {
  const client = supabase || getServiceClient()

  const { data: campaign } = await (client
    .from('campaigns') as any)
    .select('created_by, name, facilitator_name, facilitator_email, tenant_id')
    .eq('id', params.campaignId)
    .single()

  if (!campaign) {
    console.error('[CompletionNotification] Campaign not found', params.campaignId)
    return
  }

  // Use facilitator email if available, otherwise look up from auth.users
  let recipientEmail = campaign.facilitator_email
  if (!recipientEmail && campaign.created_by) {
    const { data: userData } = await client.auth.admin.getUserById(campaign.created_by)
    recipientEmail = userData?.user?.email
  }

  if (!recipientEmail) {
    console.error('[CompletionNotification] No admin email found for campaign', params.campaignId)
    return
  }

  const senderName = campaign.facilitator_name || 'FlowForge'
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const payload: NotificationPayload = {
    eventType: 'session_completed',
    tenantId: campaign.tenant_id || '',
    participantName: params.participantName,
    assessmentType: params.assessmentType,
    dashboardUrl: `${baseUrl}${params.dashboardPath}`,
    completedAt: new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
    metadata: { campaign_id: params.campaignId },
  }

  if (campaign.tenant_id) {
    const results = await dispatchNotification(campaign.tenant_id, recipientEmail, payload, {
      senderName,
      supabase: client,
    })

    for (const r of results) {
      if (r.status === 'failed') {
        console.error(`[CompletionNotification] ${r.channel} failed:`, r.error)
      } else {
        console.log(`[CompletionNotification] ${r.channel} sent to ${r.recipient}`)
      }
    }
  } else {
    const result = await dispatchEmailOnly(recipientEmail, payload, {
      senderName,
      supabase: client,
    })

    if (result.status === 'failed') {
      console.error('[CompletionNotification] Email send error:', result.error)
    } else {
      console.log(`[CompletionNotification] Sent to ${result.recipient} (email only)`)
    }
  }
}
