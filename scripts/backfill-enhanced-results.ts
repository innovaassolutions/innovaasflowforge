/**
 * Backfill Enhanced Results
 *
 * Runs the enhancement synthesis on existing sessions that have:
 * - reflection_status = 'completed'
 * - reflection_messages populated
 * - enhanced_results = NULL
 *
 * Usage: npx tsx scripts/backfill-enhanced-results.ts
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import { processEnhancement } from '../lib/agents/enhancement-agent'
import type { Archetype } from '../lib/agents/archetype-constitution'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface ArchetypeResultsData {
  default_archetype: Archetype
  authentic_archetype: Archetype
  is_aligned: boolean
  scores: {
    default: Record<Archetype, number>
    authentic: Record<Archetype, number>
    friction: Record<Archetype, number>
  }
}

interface ReflectionMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

async function backfillEnhancedResults() {
  console.log('🔄 Starting backfill of enhanced results...\n')

  // Find sessions that need backfilling
  const { data: sessions, error: fetchError } = await supabase
    .from('coaching_sessions')
    .select(`
      id,
      client_name,
      reflection_status,
      reflection_messages,
      enhanced_results,
      metadata,
      tenant_id,
      tenant_profiles!inner(display_name, brand_config)
    `)
    .eq('reflection_status', 'completed')
    .is('enhanced_results', null)
    .not('reflection_messages', 'is', null)

  if (fetchError) {
    console.error('❌ Error fetching sessions:', fetchError)
    process.exit(1)
  }

  if (!sessions || sessions.length === 0) {
    console.log('✅ No sessions need backfilling. All completed reflections already have enhanced results.')
    process.exit(0)
  }

  console.log(`📋 Found ${sessions.length} session(s) to backfill:\n`)

  let successCount = 0
  let errorCount = 0

  for (const session of sessions) {
    console.log(`Processing: ${session.client_name} (${session.id})`)

    // Extract archetype results from metadata
    const metadata = session.metadata as { archetype_results?: ArchetypeResultsData } | null
    const archetypeResults = metadata?.archetype_results

    if (!archetypeResults) {
      console.log(`  ⚠️ Skipping - no archetype results in metadata`)
      errorCount++
      continue
    }

    const reflectionMessages = session.reflection_messages as ReflectionMessage[]
    if (!reflectionMessages || reflectionMessages.length === 0) {
      console.log(`  ⚠️ Skipping - no reflection messages`)
      errorCount++
      continue
    }

    // Get tenant info
    const tenant = session.tenant_profiles as unknown as { display_name: string; brand_config: Record<string, unknown> }

    try {
      // Run enhancement synthesis
      const enhancementResponse = await processEnhancement({
        originalResults: archetypeResults,
        reflectionMessages,
        participantName: session.client_name,
        tenant: {
          display_name: tenant.display_name,
          brand_config: tenant.brand_config as { welcomeMessage?: string; completionMessage?: string },
        },
      })

      if (enhancementResponse.success && enhancementResponse.enhanced) {
        // Update session with enhanced results
        const { error: updateError } = await supabase
          .from('coaching_sessions')
          .update({ enhanced_results: enhancementResponse.enhanced })
          .eq('id', session.id)

        if (updateError) {
          console.log(`  ❌ Failed to save: ${updateError.message}`)
          errorCount++
        } else {
          console.log(`  ✅ Enhanced successfully`)
          successCount++
        }
      } else {
        console.log(`  ❌ Enhancement failed: ${enhancementResponse.error}`)
        errorCount++
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      errorCount++
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log(`\n📊 Backfill complete:`)
  console.log(`   ✅ Success: ${successCount}`)
  console.log(`   ❌ Errors: ${errorCount}`)
}

// Run the backfill
backfillEnhancedResults().catch(console.error)
