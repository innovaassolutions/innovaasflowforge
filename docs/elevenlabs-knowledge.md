# ElevenLabs Conversational AI - Technical Knowledge Base

> Comprehensive reference for ElevenLabs integration with FlowForge
> Last Updated: 2026-01-02
> Sources: Official ElevenLabs Documentation

## Architecture Overview

ElevenLabs Conversational AI coordinates four components:

1. **Speech Recognition**: Fine-tuned ASR model for speech-to-text
2. **Language Processing**: Selected LLM or Custom LLM
3. **Voice Output**: Low-latency TTS across 5k+ voices and 31 languages
4. **Conversation Management**: Proprietary turn-taking model

## Custom LLM Integration

### What It Does

Custom LLM allows you to connect conversations to your own LLM via an external endpoint. The endpoint must comply with OpenAI's chat completion API structure.

### When Custom LLM Is Called

The Custom LLM is invoked for **every conversation turn** where the agent needs to generate responses:
- When a user sends a message requiring agent response
- When system tools trigger agent decision-making
- When the agent needs to determine function calls

**IMPORTANT**: The Custom LLM does NOT generate the first message. The first message is handled separately via the `firstMessage` setting or override.

### Endpoint Requirements

Your Custom LLM server must:

1. Implement `/v1/chat/completions` endpoint (or custom path)
2. Accept OpenAI-style requests with:
   - `messages` (array of role/content objects)
   - `model` (string)
   - `temperature` (optional)
   - `max_tokens` (optional)
   - `stream` (boolean - usually true)
   - `tools` (when system tools are configured)
3. Return Server-Sent Events (SSE) formatted responses

### Request Format (from ElevenLabs)

```json
{
  "messages": [
    {"role": "system", "content": "Your system prompt with {{dynamic_variables}}"},
    {"role": "user", "content": "User's spoken/typed message"}
  ],
  "model": "your-model-name",
  "stream": true,
  "temperature": 0.7
}
```

### Response Format (SSE Stream)

```
data: {"choices":[{"delta":{"content":"Hello"}}]}

data: {"choices":[{"delta":{"content":" there!"}}]}

data: [DONE]
```

### Configuration in ElevenLabs Dashboard

1. Go to Agent > Advanced > Custom LLM
2. Enable the Custom LLM toggle
3. Set **Server URL**: Full URL including path (e.g., `https://example.com/api/voice/chat/completions`)
4. Set **Authorization**: Header with `Authorization: Bearer YOUR_SECRET`
5. Enable **"Custom LLM extra body"** to receive additional parameters
6. Set **"Limit token usage"** if needed

### Performance Optimization: Buffer Words

For slow-processing LLMs, implement buffer words:
- Return initial response ending with `"... "` (ellipsis + space)
- Continue generating full response
- Maintains natural speech flow during processing

## Overrides System

### Critical Security Requirement

**Overrides are DISABLED by default.** You must enable each override type in the agent's Security settings before using them.

### How to Enable Overrides

1. Navigate to your agent in ElevenLabs dashboard
2. Go to **Security** tab
3. Enable specific overrides:
   - First message
   - System prompt
   - Language
   - LLM model
   - Voice ID
   - etc.

### Available Override Parameters

When enabled, you can override:

**Agent Settings:**
- `prompt.prompt` - System prompt text
- `firstMessage` - Initial greeting message
- `language` - Agent language
- `llm` - LLM model identifier

**TTS Settings:**
- `voiceId` - Voice selection
- `stability` - Voice stability (0.0-1.0)
- `speed` - Speech rate (0.7-1.2)
- `similarityBoost` - Voice similarity (0.0-1.0)

**Conversation Settings:**
- `textOnly` - Text-only mode (no audio)

### Passing Overrides via React SDK

```typescript
await conversation.startSession({
  signedUrl: urlData.signedUrl,
  overrides: {
    agent: {
      firstMessage: "Hi, I'm Jippity! How are you today?",
      prompt: {
        prompt: "Custom system prompt here"
      },
      language: "en"
    },
    tts: {
      voiceId: "custom-voice-id"
    }
  }
});
```

### Passing Overrides via Widget

```html
<elevenlabs-convai
  agent-id="your-agent-id"
  override-first-message="Hi! How can I help you today?"
></elevenlabs-convai>
```

## React SDK (@elevenlabs/react)

### Package Information

- Current package: `@elevenlabs/react`
- Deprecated package: `@11labs/react` (do not use)
- Latest version as of Dec 2025: `0.12.2`

### useConversation Hook

```typescript
import { useConversation } from '@elevenlabs/react';

const conversation = useConversation({
  onConnect: () => console.log('Connected'),
  onDisconnect: () => console.log('Disconnected'),
  onError: (error) => console.error(error),
  onModeChange: ({ mode }) => console.log('Mode:', mode) // 'speaking' | 'listening'
});
```

### startSession Parameters

Required (one of):
- `agentId` - For public agents
- `signedUrl` - For WebSocket with authorization
- `conversationToken` - For WebRTC with authorization

Optional:
- `connectionType` - "webrtc" or "websocket"
- `userId` - Your end user identifier
- `dynamicVariables` - Variables for template substitution
- `overrides` - Runtime configuration overrides

### Session Methods

```typescript
// Start session
const conversationId = await conversation.startSession({ ... });

// End session
await conversation.endSession();

// Send text message (as if user spoke it)
await conversation.sendUserMessage("Hello");

// Control volume
conversation.setVolume({ volume: 0.5 }); // 0.0 to 1.0

// Check status
conversation.status; // 'connected' | 'disconnected'
conversation.isSpeaking; // boolean
```

## Dynamic Variables

Dynamic variables allow injecting runtime values into system prompts.

### Setting Up in Dashboard

In your system prompt, use double curly braces:
```
You are conducting an interview for {{company_name}}.
The participant is a {{participant_type}}.
Session token: {{session_token}}
```

### Passing at Runtime

```typescript
await conversation.startSession({
  signedUrl: urlData.signedUrl,
  dynamicVariables: {
    company_name: "FlowForge",
    participant_type: "student",
    session_token: "ff_edu_xxxxx"
  }
});
```

## First Message Behavior

### How First Message Works

1. **Dashboard Setting**: Set a static first message in agent settings
2. **Override**: Pass dynamic `firstMessage` via SDK (requires Security enablement)
3. **Empty**: Leave empty if Custom LLM should generate the first response

### Important: First Message vs Custom LLM

- `firstMessage` is spoken immediately when session starts
- It does NOT go through the Custom LLM
- Custom LLM is only called after user responds to the first message
- If `firstMessage` is empty AND Custom LLM is configured, behavior may vary

## Troubleshooting

### Voice Session Connects Then Immediately Disconnects

**Most Common Cause**: Custom LLM configuration issue

Checklist:
1. Custom LLM toggle is ON
2. Server URL is exactly correct (include full path)
3. Authorization header is correct (`Bearer YOUR_SECRET`)
4. Secret value matches your server's expected value
5. First Message override is ENABLED in Security tab (if using override)
6. Your endpoint returns valid SSE stream
7. Check Vercel/server logs for incoming requests

### First Message Not Working

1. Ensure `First message` override is ENABLED in Security tab
2. Pass `overrides.agent.firstMessage` in startSession
3. Check browser console for SDK errors

### Custom LLM Not Being Called

1. Verify Custom LLM toggle is ON in dashboard
2. Check server logs - if no requests, configuration is wrong
3. Test endpoint directly with curl
4. Ensure endpoint returns proper SSE format

### Testing Custom LLM Endpoint

```bash
curl -X POST https://your-server.com/api/voice/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SECRET" \
  -d '{"messages":[{"role":"system","content":"test"}],"stream":true}'
```

Expected responses:
- `401` = Auth working but secret mismatch
- `200` with SSE stream = Working correctly
- Connection refused = URL wrong or server down

## FlowForge-Specific Configuration

### Required ElevenLabs Agent Settings

1. **Voice**: Choose interviewer voice
2. **Model**: `flash_v2.5` (recommended for low latency)
3. **First Message**: Leave EMPTY (we use override)

### Custom LLM Settings

- **Server URL**: `https://innovaas.co/flowforge/api/voice/chat/completions`
- **Authorization**: `Bearer {ELEVENLABS_LLM_SECRET from Vercel env}`
- **Custom LLM extra body**: Enabled

### Security Tab Settings

Enable these overrides:
- [x] First message
- [x] System prompt (if needed)

### System Prompt Template

```
You are conducting a voice interview for FlowForge.

Session Context:
- session_token: {{session_token}}
- module_id: {{module_id}}
- vertical_key: {{vertical_key}}
- stakeholder_name: {{stakeholder_name}}

Follow the interview structure provided by the LLM endpoint.
```

## References

- [Custom LLM Documentation](https://elevenlabs.io/docs/agents-platform/customization/llm/custom-llm)
- [Overrides Documentation](https://elevenlabs.io/docs/agents-platform/customization/personalization/overrides)
- [React SDK Documentation](https://elevenlabs.io/docs/agents-platform/libraries/react)
- [Agent Authentication](https://elevenlabs.io/docs/agents-platform/customization/authentication)
- [@elevenlabs/react on npm](https://www.npmjs.com/package/@elevenlabs/react)
