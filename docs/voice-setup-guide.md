# Voice Integration Setup Guide

> ElevenLabs Conversational AI Integration for FlowForge
> Last Updated: 2026-01-01

## Overview

FlowForge supports real-time voice interviews using ElevenLabs Conversational AI. This guide covers the setup and configuration required to enable voice mode.

## Architecture

The voice integration uses a **Hybrid Pattern**:
- **ElevenLabs** handles: WebSocket connection, voice-to-text (STT), text-to-speech (TTS), audio streaming
- **FlowForge** handles: Interview logic via Custom LLM endpoint, session management, safeguarding, personalized greeting generation

**How it works:**
1. FlowForge generates a personalized greeting based on participant type (student/teacher/parent/leadership)
2. Greeting is passed to ElevenLabs via `firstMessage` override when starting the session
3. ElevenLabs speaks the greeting
4. User responds, triggering the Custom LLM endpoint for subsequent conversation turns

```
┌─────────────┐     WebSocket      ┌───────────────────┐
│   Browser   │◄──────────────────►│   ElevenLabs     │
│  (React)    │   Audio + Text     │   Conversational │
└─────────────┘                    │   AI Platform    │
                                   └────────┬─────────┘
                                            │ HTTP/SSE
                                            ▼
                                   ┌───────────────────┐
                                   │  FlowForge API   │
                                   │  /api/voice/     │
                                   │  chat/completions│
                                   └────────┬─────────┘
                                            │
                                            ▼
                                   ┌───────────────────┐
                                   │  Education Agent │
                                   │  (Claude-based)  │
                                   └───────────────────┘
```

## Prerequisites

1. **ElevenLabs Account** with Conversational AI access
2. **Environment Variables** configured (see below)
3. **Database Migration** applied (voice system tables)

## Environment Variables

Add these to your `.env.local`:

```bash
# ElevenLabs Voice Integration
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_AGENT_ID=your_elevenlabs_agent_id
ELEVENLABS_LLM_SECRET=your_secure_random_secret
```

### Getting Your Keys

1. **API Key**: Go to [ElevenLabs Settings](https://elevenlabs.io/app/settings/api-keys)
2. **Agent ID**: Create an agent at [Conversational AI](https://elevenlabs.io/app/conversational-ai)
3. **LLM Secret**: Generate a secure random string:
   ```bash
   openssl rand -hex 32
   ```

## ElevenLabs Agent Configuration

### 1. Create a New Agent

1. Go to [ElevenLabs Conversational AI](https://elevenlabs.io/app/conversational-ai)
2. Click "Create Agent"
3. Choose "Blank Template"

### 2. Configure Voice Settings

- **Voice**: Choose an appropriate interviewer voice
- **Model**: `flash_v2.5` (recommended for low latency)
- **First Message**: Leave EMPTY (FlowForge sends personalized greeting via override)

### 3. Configure Custom LLM

Under "Advanced" > "Custom LLM":

1. **Enable Custom LLM**: Toggle ON
2. **Server URL**: `https://flowforge.innovaas.co/api/voice/chat/completions`
   - IMPORTANT: Include `/chat/completions` suffix!
   - For local dev: `http://localhost:3000/api/voice/chat/completions`
3. **API Key / Authorization**: Add header `Authorization: Bearer your_ELEVENLABS_LLM_SECRET`
   - This must match the `ELEVENLABS_LLM_SECRET` in your Vercel environment variables
4. **Model**: Leave as default (handled by our endpoint)

### 4. System Prompt Template

Add dynamic variables to your system prompt:

```
You are conducting a voice interview for FlowForge.

Session Context:
- session_token: {{session_token}}
- module_id: {{module_id}}
- vertical_key: {{vertical_key}}
- stakeholder_name: {{stakeholder_name}}

Follow the interview structure provided by the LLM endpoint.
```

### 5. Privacy & Data Settings

- **Audio Recording**: Disable if not needed
- **Transcript Saving**: Disable (we save transcripts ourselves)

## Database Configuration

### Three-Level Voice Activation

Voice is controlled at three levels:

1. **System Level** (`vertical_voice_config`): Which verticals support voice
2. **Organization Level** (`organization_voice_settings`): Org-specific enablement and quotas
3. **User Level** (`user_voice_preferences`): Individual user preferences

### Enable Voice for a Vertical

```sql
UPDATE vertical_voice_config
SET voice_enabled = true
WHERE vertical_key = 'education';
```

### Enable Voice for an Organization

```sql
INSERT INTO organization_voice_settings (
  organization_id,
  voice_enabled,
  voice_included_in_plan,
  allowed_verticals,
  monthly_voice_minutes_limit
) VALUES (
  'org-uuid-here',
  true,
  true,
  ARRAY['education', 'assessment'],
  500
);
```

## API Endpoints

### GET /api/voice/availability
Check if voice is available for a session.

**Query Parameters:**
- `sessionToken`: The session token

**Response:**
```json
{
  "available": true,
  "config": {
    "verticalKey": "education",
    "displayName": "Education Assessment"
  }
}
```

### POST /api/voice/signed-url
Get a conversation token for connecting to ElevenLabs via WebRTC.

**Body:**
```json
{
  "sessionToken": "ff_edu_xxxxx",
  "moduleId": "student_wellbeing"
}
```

**Response:**
```json
{
  "conversationToken": "eyJ...",
  "firstMessage": "Hi there! Thanks for taking the time to chat...",
  "dynamicVariables": {
    "session_token": "ff_edu_xxxxx",
    "module_id": "student_wellbeing",
    "vertical_key": "education"
  }
}
```

> **Note:** This endpoint returns a `conversationToken` for WebRTC connections
> (not a `signedUrl` for WebSocket). WebRTC provides better stability and
> includes built-in echo cancellation.

### POST /api/voice/chat/completions
Custom LLM endpoint for ElevenLabs (OpenAI-compatible).

**Headers:**
- `Authorization: Bearer ELEVENLABS_LLM_SECRET`

**Body:** OpenAI chat completion format

**Response:** SSE stream with `data:` prefix

**Note:** This endpoint generates the initial greeting when first called (no user message),
and handles all subsequent conversation turns through the education interview agent.

### POST /api/voice/usage
Track voice usage after a session ends.

**Body:**
```json
{
  "sessionToken": "ff_edu_xxxxx",
  "durationSeconds": 180
}
```

## Usage in Components

```tsx
import { VoiceSession } from '@/components/voice/VoiceSession'

function InterviewPage({ sessionToken, moduleId }) {
  return (
    <VoiceSession
      sessionToken={sessionToken}
      moduleId={moduleId}
      onSessionEnd={(completed) => console.log('Session ended, completed:', completed)}
      onError={(error) => console.error(error)}
    />
  )
}
```

### Hybrid Voice + Text Input

The VoiceSession component supports simultaneous voice and text input:

- **Voice**: Speak naturally into your microphone at any time
- **Text**: A text input field is always visible during the session
  - Type your message and press Enter or click Send
  - Messages are sent to the agent as if you had spoken them
  - Useful for complex names, technical terms, or in noisy environments

Both input methods are available simultaneously - users can speak or type interchangeably without switching modes. The text input uses ElevenLabs' `sendUserMessage` API, which treats typed messages the same as spoken input.

## Troubleshooting

### Voice session connects then immediately disconnects
This usually means ElevenLabs is NOT calling your Custom LLM. Follow this checklist:

#### Step-by-Step Verification Checklist

**1. Verify Custom LLM is ENABLED:**
- Go to ElevenLabs Agent > Advanced > Custom LLM
- The toggle must be ON (enabled)

**2. Verify Server URL is EXACTLY correct:**
```
https://flowforge.innovaas.co/api/voice/chat/completions
```
- MUST include `/chat/completions` suffix (not just `/api/voice`)
- No trailing slash

**3. Verify Authorization is configured:**
- Type: `Authorization` header
- Value: `Bearer YOUR_SECRET_VALUE`
- The secret value MUST match the `ELEVENLABS_LLM_SECRET` in Vercel environment variables
- If using ElevenLabs Workspace Secrets, the secret value (not the name) must match

**4. Verify First Message is COMPLETELY EMPTY:**
- Delete ALL text from the "First Message" field
- FlowForge sends a personalized greeting via `firstMessage` override
- If you have text in the dashboard, it will conflict with the override
- The field should be blank/empty

**5. Verify System Prompt includes dynamic variables:**
```
You are conducting a voice interview for FlowForge.

Session Context:
- session_token: {{session_token}}
- module_id: {{module_id}}
- vertical_key: {{vertical_key}}
- stakeholder_name: {{stakeholder_name}}

Follow the interview structure provided by the LLM endpoint.
```

**6. Save the agent after making changes**

#### Testing if ElevenLabs is calling your endpoint

Check Vercel Runtime Logs for entries containing `[voice/chat/completions]`:
- If you see these logs, ElevenLabs IS calling your endpoint
- If you DON'T see these logs, ElevenLabs is NOT calling your endpoint (check steps 1-6 above)

You can also test the endpoint directly with curl:
```bash
curl -X POST https://flowforge.innovaas.co/api/voice/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ELEVENLABS_LLM_SECRET" \
  -d '{"messages":[{"role":"system","content":"session_token: ff_edu_test123\nmodule_id: student_wellbeing\nvertical_key: education"}],"stream":true}'
```
- 401 = Auth working but secret doesn't match
- 200 with SSE stream = Endpoint working correctly

### "Voice is not available for this interview type"
- Check `vertical_voice_config` table has `voice_enabled = true`

### "Voice settings not configured for organization"
- Add record to `organization_voice_settings` for the organization

### "Failed to get voice session URL"
- Verify `ELEVENLABS_API_KEY` is valid
- Check `ELEVENLABS_AGENT_ID` matches your agent

### "Unauthorized" from LLM endpoint
- Verify `ELEVENLABS_LLM_SECRET` matches in both `.env.local` and ElevenLabs dashboard

### No audio in browser
- Check microphone permissions
- Ensure HTTPS in production (required for WebRTC)

## Security Considerations

1. **LLM Secret**: Never expose `ELEVENLABS_LLM_SECRET` to the client
2. **Signed URLs**: Expire after 15 minutes
3. **Session Validation**: All requests validate the session token
4. **Safeguarding**: Voice transcripts are monitored for safeguarding concerns

## Cost Management

Voice usage is tracked per session and organization:
- `agent_sessions.voice_minutes_used`: Per-session usage
- `organization_voice_settings.monthly_voice_minutes_used`: Monthly org total
- Monthly limits can be set via `monthly_voice_minutes_limit`

## References

- [ElevenLabs Conversational AI Docs](https://elevenlabs.io/docs/conversational-ai)
- [Technical Research Document](./research-technical-2025-12-31.md)
- [@elevenlabs/react SDK](https://www.npmjs.com/package/@elevenlabs/react)
