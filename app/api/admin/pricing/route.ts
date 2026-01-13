/**
 * Admin Pricing Management API
 *
 * Provides endpoints for:
 * - GET: View current pricing and sync status
 * - POST: Manually trigger pricing sync
 * - PATCH: Update individual model pricing
 *
 * Story: billing-6-1-implement-provider-pricing-api
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import {
  syncAllPricing,
  syncProviderPricing,
  getPricingVerificationStatus,
  getVerificationReminderMessage,
  updateModelPricing,
  addNewModelPricing,
  KNOWN_PRICING,
} from '@/lib/services/pricing-sync'

// ============================================================================
// Types
// ============================================================================

interface ModelPricingRow {
  id: string
  provider: string
  model_id: string
  display_name: string | null
  input_rate_per_million: string
  output_rate_per_million: string
  effective_date: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// ============================================================================
// Auth Helper
// ============================================================================

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized', status: 401 }
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('user_type')
    .eq('id', user.id)
    .single()

  if (profile?.user_type !== 'admin') {
    return { error: 'Forbidden', status: 403 }
  }

  return { user, profile }
}

// ============================================================================
// GET - View pricing and status
// ============================================================================

export async function GET(request: NextRequest) {
  const auth = await verifyAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    // Get current pricing from database
    const { data, error } = await supabaseAdmin
      .from('model_pricing')
      .select('*')
      .eq('is_active', true)
      .order('provider', { ascending: true })
      .order('model_id', { ascending: true })

    const currentPricing = data as ModelPricingRow[] | null

    if (error) {
      throw new Error(`Failed to fetch pricing: ${error.message}`)
    }

    // Get verification status
    const verificationStatus = getPricingVerificationStatus()
    const reminderMessage = getVerificationReminderMessage()

    // Compare with known pricing
    const comparison = currentPricing?.map(current => {
      const known = KNOWN_PRICING.find(k => k.modelId === current.model_id)
      return {
        ...current,
        knownPricing: known ? {
          inputRatePerMillion: known.inputRatePerMillion,
          outputRatePerMillion: known.outputRatePerMillion,
          lastVerified: known.lastVerified,
          source: known.source,
        } : null,
        hasDiscrepancy: known ? (
          Math.abs(parseFloat(current.input_rate_per_million) - known.inputRatePerMillion) > 0.01 ||
          Math.abs(parseFloat(current.output_rate_per_million) - known.outputRatePerMillion) > 0.01
        ) : false,
      }
    })

    // Find models in known pricing but not in database
    const missingModels = KNOWN_PRICING.filter(
      known => !currentPricing?.find(c => c.model_id === known.modelId)
    )

    return NextResponse.json({
      currentPricing: comparison,
      missingModels,
      verificationStatus,
      reminderMessage,
      lastSyncCheck: new Date().toISOString(),
    })

  } catch (error) {
    console.error('[AdminPricing] GET error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST - Trigger manual sync
// ============================================================================

export async function POST(request: NextRequest) {
  const auth = await verifyAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const { provider, action } = body

    if (action === 'sync') {
      // Run sync for specific provider or all
      const results = provider
        ? [await syncProviderPricing(provider)]
        : await syncAllPricing()

      return NextResponse.json({
        success: true,
        action: 'sync',
        results,
        timestamp: new Date().toISOString(),
      })
    }

    if (action === 'add_missing') {
      // Add all missing models to database
      const { data: pricingData } = await supabaseAdmin
        .from('model_pricing')
        .select('model_id')
        .eq('is_active', true)

      const currentPricing = pricingData as { model_id: string }[] | null

      const existingIds = new Set(currentPricing?.map(p => p.model_id) || [])
      const missingModels = KNOWN_PRICING.filter(k => !existingIds.has(k.modelId))

      const added: string[] = []
      const failed: string[] = []

      for (const known of missingModels) {
        const success = await addNewModelPricing(known)
        if (success) {
          added.push(known.modelId)
        } else {
          failed.push(known.modelId)
        }
      }

      return NextResponse.json({
        success: failed.length === 0,
        action: 'add_missing',
        added,
        failed,
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "sync" or "add_missing"' },
      { status: 400 }
    )

  } catch (error) {
    console.error('[AdminPricing] POST error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PATCH - Update individual model pricing
// ============================================================================

export async function PATCH(request: NextRequest) {
  const auth = await verifyAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await request.json()
    const { modelId, inputRate, outputRate } = body

    if (!modelId || typeof inputRate !== 'number' || typeof outputRate !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields: modelId, inputRate, outputRate' },
        { status: 400 }
      )
    }

    if (inputRate <= 0 || outputRate <= 0) {
      return NextResponse.json(
        { error: 'Rates must be positive numbers' },
        { status: 400 }
      )
    }

    const success = await updateModelPricing(modelId, inputRate, outputRate)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update pricing' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      modelId,
      newRates: { inputRate, outputRate },
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('[AdminPricing] PATCH error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    )
  }
}
