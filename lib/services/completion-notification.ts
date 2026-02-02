/**
 * Session Completion Notification Service
 *
 * Sends email notifications to coaches, consultants, and school admins
 * when a participant completes an interview or assessment.
 *
 * Works across all verticals: coaching, consulting, and education.
 */

import { createClient } from '@supabase/supabase-js'
import { resend, buildFromAddress } from '@/lib/resend'
import { SessionCompletedNotification } from '@/lib/email/templates/session-completed-notification'

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

  await sendNotification({
    recipientEmail,
    senderName,
    participantName: params.participantName,
    assessmentType: params.assessmentType,
    dashboardPath: params.dashboardPath,
    brandConfig,
    emailConfig,
  })
}

/**
 * Notify a consultant/facilitator when a campaign interview completes.
 * Looks up the facilitator email from the campaigns table.
 */
export async function notifyCampaignOwner(
  params: CampaignNotificationParams,
  supabase?: SupabaseClient
): Promise<void> {
  const client = supabase || getServiceClient()

  const { data: campaign } = await (client
    .from('campaigns') as any)
    .select('facilitator_name, facilitator_email, created_by')
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

  await sendNotification({
    recipientEmail,
    senderName: campaign.facilitator_name || 'FlowForge',
    participantName: params.participantName,
    assessmentType: params.assessmentType,
    dashboardPath: params.dashboardPath,
    brandConfig: {},
    emailConfig: {},
  })
}

/**
 * Notify a school admin when an education interview completes.
 * Looks up the admin from the campaign's created_by user.
 */
export async function notifyEducationAdmin(
  params: CampaignNotificationParams,
  supabase?: SupabaseClient
): Promise<void> {
  const client = supabase || getServiceClient()

  const { data: campaign } = await (client
    .from('campaigns') as any)
    .select('created_by, name, facilitator_name, facilitator_email')
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

  await sendNotification({
    recipientEmail,
    senderName: campaign.facilitator_name || 'FlowForge',
    participantName: params.participantName,
    assessmentType: params.assessmentType,
    dashboardPath: params.dashboardPath,
    brandConfig: {},
    emailConfig: {},
  })
}

// ============================================================================
// Internal
// ============================================================================

interface SendNotificationParams {
  recipientEmail: string
  senderName: string
  participantName: string
  assessmentType: string
  dashboardPath: string
  brandConfig: {
    logo?: { url: string; alt?: string }
    colors?: {
      primary?: string
      background?: string
      text?: string
      textMuted?: string
    }
    tagline?: string
  }
  emailConfig: {
    senderName?: string
    emailFooter?: string
  }
}

async function sendNotification(params: SendNotificationParams): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const dashboardUrl = `${baseUrl}${params.dashboardPath}`
  const completedAt = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const fromAddress = buildFromAddress(params.senderName)

  const result = await resend.emails.send({
    from: fromAddress,
    to: params.recipientEmail,
    subject: `Session Completed: ${params.participantName}`,
    react: SessionCompletedNotification({
      clientName: params.participantName,
      assessmentType: params.assessmentType,
      completedAt,
      dashboardUrl,
      brandConfig: {
        logo: params.brandConfig.logo,
        colors: {
          primary: params.brandConfig.colors?.primary,
          background: params.brandConfig.colors?.background,
          text: params.brandConfig.colors?.text,
          textMuted: params.brandConfig.colors?.textMuted,
        },
        tagline: params.brandConfig.tagline,
      },
      emailConfig: {
        senderName: params.emailConfig.senderName,
        emailFooter: params.emailConfig.emailFooter,
      },
    }),
  })

  if (result.error) {
    console.error('[CompletionNotification] Email send error:', result.error)
  } else {
    console.log(`[CompletionNotification] Sent to ${params.recipientEmail} (email ID: ${result.data?.id})`)
  }
}
