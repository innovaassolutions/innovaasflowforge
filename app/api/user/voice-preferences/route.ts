import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type {
  UserVoicePreferencesRow,
  UpdateVoicePreferencesRequest,
} from '@/lib/types/voice'
import { DEFAULT_USER_VOICE_PREFERENCES } from '@/lib/types/voice'

/**
 * GET /api/user/voice-preferences
 * Get the current user's voice preferences
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: prefs, error } = await supabase
      .from('user_voice_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error || !prefs) {
      // Return defaults if not found
      return NextResponse.json({
        voiceEnabled: DEFAULT_USER_VOICE_PREFERENCES.voiceEnabled,
        defaultMode: DEFAULT_USER_VOICE_PREFERENCES.defaultMode,
        autoStartVoice: DEFAULT_USER_VOICE_PREFERENCES.autoStartVoice,
        preferredVoiceId: DEFAULT_USER_VOICE_PREFERENCES.preferredVoiceId,
      })
    }

    const typedPrefs = prefs as UserVoicePreferencesRow

    return NextResponse.json({
      voiceEnabled: typedPrefs.voice_enabled,
      defaultMode: typedPrefs.default_mode,
      autoStartVoice: typedPrefs.auto_start_voice,
      preferredVoiceId: typedPrefs.preferred_voice_id,
    })
  } catch (error) {
    console.error('Get voice preferences error:', error)
    return NextResponse.json(
      { error: 'Failed to get voice preferences' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/user/voice-preferences
 * Update the current user's voice preferences
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updates: UpdateVoicePreferencesRequest = await request.json()

    // Validate and convert to snake_case
    const allowedFields = [
      'voice_enabled',
      'default_mode',
      'auto_start_voice',
      'preferred_voice_id',
    ]
    const sanitizedUpdates: Record<string, unknown> = {}

    // Map camelCase to snake_case
    const fieldMapping: Record<string, string> = {
      voiceEnabled: 'voice_enabled',
      defaultMode: 'default_mode',
      autoStartVoice: 'auto_start_voice',
      preferredVoiceId: 'preferred_voice_id',
    }

    for (const [key, value] of Object.entries(updates)) {
      const snakeKey = fieldMapping[key] || key
      if (allowedFields.includes(snakeKey)) {
        sanitizedUpdates[snakeKey] = value
      }
    }

    // Validate default_mode if provided
    if (
      sanitizedUpdates.default_mode &&
      !['text', 'voice'].includes(sanitizedUpdates.default_mode as string)
    ) {
      return NextResponse.json(
        { error: 'Invalid default mode. Must be "text" or "voice"' },
        { status: 400 }
      )
    }

    // Upsert preferences
    const { data, error } = await supabase
      .from('user_voice_preferences')
      .upsert(
        {
          user_id: user.id,
          ...sanitizedUpdates,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single()

    if (error) {
      console.error('Update voice preferences error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const typedData = data as UserVoicePreferencesRow

    return NextResponse.json({
      voiceEnabled: typedData.voice_enabled,
      defaultMode: typedData.default_mode,
      autoStartVoice: typedData.auto_start_voice,
      preferredVoiceId: typedData.preferred_voice_id,
    })
  } catch (error) {
    console.error('Update voice preferences error:', error)
    return NextResponse.json(
      { error: 'Failed to update voice preferences' },
      { status: 500 }
    )
  }
}
