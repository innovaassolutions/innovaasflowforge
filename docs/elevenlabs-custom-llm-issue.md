# ElevenLabs Custom LLM Integration Issue

**Date:** January 5, 2026
**Project:** FlowForge (innovaasflowforge.vercel.app)
**Issue:** Custom LLM conversations disconnect after first agent message

---

## Summary

We are experiencing a consistent issue where ElevenLabs Conversational AI agents configured with Custom LLM disconnect immediately after the user speaks. The first LLM call (initial greeting) works correctly, but the second LLM call (responding to user input) fails with "custom_llm generation failed" error.

---

## What We're Building & Why Custom LLM is Required

### Product Overview

**FlowForge** is an enterprise platform for conducting **AI-facilitated stakeholder interviews** across industries. Our first use case is **Digital Transformation Readiness Assessments** in education, where we conduct voice interviews with students, teachers, parents, and school leadership.

### Why We Need Custom LLM (Not Hosted LLM)

We require Custom LLM integration because our interview system has **stateful, adaptive conversation logic** that cannot be replicated with a static hosted LLM prompt:

#### 1. Real-Time Safeguarding Detection (Critical for Student Safety)

```typescript
// We intercept EVERY user message to detect safety concerns
const SAFEGUARDING_PATTERNS = [
  { pattern: /\b(hurt(ing)? myself|harm(ing)? myself)\b/i, type: 'self_harm' },
  { pattern: /\b(suicid|kill myself)\b/i, type: 'self_harm' },
  { pattern: /\b(hit(s)? me|beat(s)? me|abuse)\b/i, type: 'abuse_disclosure' },
  // ... 15+ patterns for student safety
]

// If detected, we immediately:
// - Flag the conversation in our database
// - Modify the AI response to provide support resources
// - Alert school safeguarding officers
```

**This cannot run on a hosted LLM** - we need to intercept and process each message server-side before generating a response.

#### 2. Stateful Conversation Tracking

Our interviews track **domain exploration** across multiple assessment areas:

```typescript
interface ConversationState {
  phase: 'opening' | 'rapport' | 'core_exploration' | 'closing'
  domains_explored: {
    domain_id: string
    explored: boolean
    depth: 0 | 1 | 2 | 3  // 0=not touched, 3=deep-dived
  }[]
  domain_coverage_percent: number  // Must reach 70%+ before closing
  safeguarding_flags: SafeguardingFlag[]
}
```

Each turn, we:
1. Update domain coverage in our database
2. Determine which areas still need exploration
3. Generate a **dynamic system prompt** based on current state
4. Guide the conversation toward unexplored domains

#### 3. Dynamic Prompt Generation

The system prompt changes **every turn** based on conversation state:

```typescript
// Simplified example - actual prompt is 2000+ tokens
function generatePrompt(state: ConversationState, participant: Participant) {
  const unexploredDomains = getUnexploredDomains(state)
  const currentPhase = state.phase

  return `
    You are interviewing ${participant.name}, a ${participant.type}.

    CURRENT PHASE: ${currentPhase}
    DOMAINS TO EXPLORE: ${unexploredDomains.map(d => d.name).join(', ')}
    COVERAGE: ${state.domain_coverage_percent}% (target: 70%)

    ${currentPhase === 'core_exploration' ?
      `Focus on: ${unexploredDomains[0].name}` :
      `Transition to closing soon.`
    }
  `
}
```

#### 4. Database Integration Per Turn

Every conversation turn triggers database operations:

```typescript
// On each user message:
await supabase.from('interview_sessions').update({
  conversation_state: newState,
  domains_explored: updatedDomains,
  last_interaction: new Date(),
  safeguarding_flags: detectedFlags
}).eq('token', sessionToken)

// On conversation end:
await supabase.from('interview_transcripts').insert({
  session_id: sessionId,
  messages: conversationHistory,
  final_coverage: coveragePercent
})
```

### Why Hosted LLM Cannot Meet These Requirements

| Requirement | Custom LLM | Hosted LLM |
|-------------|------------|------------|
| Intercept messages for safeguarding | ✅ Process before LLM | ❌ No server-side hook |
| Update database per turn | ✅ Full DB access | ❌ Stateless |
| Dynamic prompts based on state | ✅ Regenerate each turn | ❌ Fixed prompt |
| Track domain exploration | ✅ Persistent state | ❌ No state access |
| Alert on safety concerns | ✅ Real-time webhooks | ❌ Post-hoc only |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FlowForge Platform                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   Frontend   │───▶│  ElevenLabs  │───▶│ Custom LLM   │       │
│  │  (Next.js)   │    │   WebRTC     │    │  Endpoint    │       │
│  └──────────────┘    └──────────────┘    └──────┬───────┘       │
│                                                  │               │
│                                                  ▼               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   Custom LLM Handler                      │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐  │   │
│  │  │ Safeguard  │  │   State    │  │  Dynamic Prompt    │  │   │
│  │  │ Detection  │  │  Manager   │  │    Generator       │  │   │
│  │  └─────┬──────┘  └─────┬──────┘  └─────────┬──────────┘  │   │
│  │        │               │                    │             │   │
│  │        ▼               ▼                    ▼             │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │              Supabase (PostgreSQL)                  │ │   │
│  │  │  - Session state    - Transcripts    - Alerts       │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Business Impact

This Custom LLM integration is **critical** to our product. Without it:
- We cannot conduct voice interviews (core product functionality)
- We cannot ensure student safety (legal/ethical requirement)
- We cannot provide adaptive, high-quality assessments

We have invested significant development effort into this integration and need it to work reliably.

---

## Environment

- **Hosting:** Vercel (Next.js 15)
- **Custom LLM URL:** `https://innovaasflowforge.vercel.app/flowforge/api/voice/edge-llm`
- **API Type:** `chat_completions`
- **ElevenLabs SDK:** `@elevenlabs/react` (latest)
- **Connection Type:** WebRTC

---

## Issue Details

### What Works
1. ✅ Agent connects successfully via WebRTC
2. ✅ First Custom LLM call succeeds (initial greeting is spoken)
3. ✅ Agent speaks the greeting from our Custom LLM
4. ✅ Mode changes to "listening" correctly
5. ✅ Microphone input is detected (volume levels show input)
6. ✅ Our endpoint works perfectly when tested via curl

### What Fails
1. ❌ After user speaks (~5-8 seconds of listening), connection disconnects
2. ❌ Second Custom LLM call fails - ElevenLabs reports "custom_llm generation failed"
3. ❌ Conversation logs show: `input_tokens_used: 787, output_tokens_used: 0`
4. ❌ User's transcribed message never appears in conversation transcript

---

## Test Results

### Agent IDs Tested
| Agent ID | Runtime | Custom LLM URL | Result |
|----------|---------|----------------|--------|
| `agent_9001ke3b1hvmes4bm44m086t1p7r` | Vercel Edge | `/api/voice/edge-llm` | Failed |
| `agent_0101ke3mvmqfehmtzzsxr78v7rs7` | Node.js Serverless | `/api/voice/node-llm` | Failed |

### Conversation Log Example
```
Conversation ID: conv_0501ke5ysczzer9t6bwr1m3yt16p
Status: failed
Duration: 11 seconds
Messages: 1 (only the initial greeting)
Termination Reason: custom_llm generation failed
Input Tokens: 787
Output Tokens: 0
```

### Client-Side Debug Log (Typical Failure Pattern)
```
[02:11:47.764] ✅ CONNECTED
[02:11:48.487] Message: "Hello from Node.js! This endpoint runs on Vercel serverless..."
[02:11:48.614] Mode changed: speaking
[02:11:53.473] Mode changed: listening
[02:11:54.764] 📊 Vol[7] in: 0.042  (user speaking)
[02:11:55.765] 📊 Vol[8] in: 0.043
[02:11:56.765] 📊 Vol[9] in: 0.038
[02:11:57.765] 📊 Vol[10] in: 0.034
[02:11:58.765] 📊 Vol[11] in: 0.031
[02:11:59.048] Status change: disconnecting
[02:11:59.051] ❌ DISCONNECTED
```

---

## Custom LLM Endpoint Details

### Endpoint Response Format (Verified Working via curl)
```
POST /flowforge/api/voice/edge-llm
Content-Type: application/json

Request:
{
  "messages": [
    {"role": "system", "content": "You are a test assistant..."},
    {"role": "assistant", "content": "Hello from Node.js!..."},
    {"role": "user", "content": "Hi there, how are you?"}
  ],
  "model": "edge-llm",
  "stream": true
}

Response (SSE format):
data: {"id":"chatcmpl-xxx","object":"chat.completion.chunk","created":1767501274,"model":"edge-llm","system_fingerprint":"fp_xxx","choices":[{"index":0,"delta":{"role":"assistant","content":""},"logprobs":null,"finish_reason":null}]}

data: {"id":"chatcmpl-xxx","object":"chat.completion.chunk","created":1767501274,"model":"edge-llm","system_fingerprint":"fp_xxx","choices":[{"index":0,"delta":{"content":"I heard you! This response is coming from the Edge Runtime endpoint."},"logprobs":null,"finish_reason":null}]}

data: {"id":"chatcmpl-xxx","object":"chat.completion.chunk","created":1767501274,"model":"edge-llm","system_fingerprint":"fp_xxx","choices":[{"index":0,"delta":{},"logprobs":null,"finish_reason":"stop"}]}

data: [DONE]
```

### Response Headers
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
Access-Control-Allow-Origin: *
```

### curl Test Result (WORKS)
```bash
curl -s "https://innovaasflowforge.vercel.app/flowforge/api/voice/edge-llm" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"hello"}],"stream":true}'

# Returns valid SSE response - HTTP 200
```

---

## Agent Configuration

```json
{
  "name": "FlowForge Node.js LLM Test",
  "conversation_config": {
    "agent": {
      "first_message": "Hello from Node.js! This endpoint runs on Vercel serverless.",
      "language": "en",
      "prompt": {
        "prompt": "You are a test assistant.\n\nCONTEXT:\nsession_token: {{session_token}}",
        "llm": "custom-llm",
        "temperature": 0.7,
        "max_tokens": 1024,
        "custom_llm": {
          "url": "https://innovaasflowforge.vercel.app/flowforge/api/voice/node-llm",
          "model_id": "node-llm",
          "api_type": "chat_completions"
        }
      }
    },
    "tts": {
      "voice_id": "l4Coq6695JDX9xtLqXDE",
      "model_id": "eleven_turbo_v2"
    },
    "asr": {
      "quality": "high",
      "provider": "elevenlabs"
    },
    "turn": {
      "turn_timeout": 30
    }
  }
}
```

---

## Debugging Attempts

1. **Tested Edge Runtime vs Node.js Runtime** - Both fail identically
2. **Simplified SSE format** - Matched OpenAI format exactly
3. **Removed streaming delays** - No improvement
4. **Added system_fingerprint field** - No improvement
5. **Tested with conversation history in curl** - Works perfectly
6. **Verified CORS headers** - All permissive (`*`)
7. **Checked response timing** - Response generated in <50ms

---

## Key Observations

1. **First call works, second fails** - The exact same endpoint works for the initial greeting but fails when responding to user input.

2. **787 input tokens, 0 output tokens** - ElevenLabs is sending the request (787 tokens indicates conversation history), but receiving 0 output tokens.

3. **curl works perfectly** - Direct HTTP requests to our endpoint return valid responses. The issue only occurs when ElevenLabs calls our endpoint.

4. **No error in our logs** - We don't see any errors or even requests in our server logs for the second call (suggesting the request may not be reaching us, or is failing before our handler runs).

---

## CRITICAL FINDING: ElevenLabs Never Reaches Our Endpoint

We deployed a debug endpoint that logs ALL incoming requests to a Supabase database table. This provides definitive proof of the issue:

### Debug Test Results (Jan 5, 2026 at 02:56 AM UTC)

| Test | Time | User Agent | Logged to Supabase |
|------|------|------------|-------------------|
| curl test | 02:54:51 | `curl/8.7.1` | ✅ YES |
| ElevenLabs conversation | 02:56:44-02:56:58 | Expected: ElevenLabs | ❌ NO |

### What This Proves

**ElevenLabs is NOT successfully connecting to our endpoint.** The request fails at the network level before reaching our server code.

- Our endpoint logs every request to Supabase BEFORE processing
- The curl test at 02:54:51 logged successfully
- The ElevenLabs conversation at 02:56:44 produced ZERO log entries
- The ElevenLabs dashboard shows "custom_llm generation failed" with 0 output tokens

### Debug Endpoint Details

- **Agent ID:** `agent_8401ke60x5j4f3av281her96xtn4`
- **URL:** `https://innovaasflowforge.vercel.app/flowforge/api/voice/debug-llm`
- **Logging:** Supabase `debug_logs` table (timestamps, headers, body preview)

### Conclusion

This is a **connectivity issue between ElevenLabs infrastructure and Vercel**, not a response format issue. Our endpoint:
1. Is publicly accessible (curl works)
2. Returns valid SSE responses
3. Logs all requests to database
4. Never receives requests from ElevenLabs during Custom LLM calls

---

## Questions for ElevenLabs Support

1. **Why is ElevenLabs not reaching our endpoint?** Our Supabase logs prove that requests from ElevenLabs never arrive at our server, while curl requests from the same region work fine.

2. **Is there a network/firewall issue between ElevenLabs infrastructure and Vercel?** Our endpoint is publicly accessible and returns valid responses to direct HTTP requests.

3. **Can you provide detailed request logs?** We need to see what ElevenLabs is actually sending and what error occurs. The "787 input tokens, 0 output tokens" suggests a connection failure, not a response parsing issue.

4. **Are there specific requirements for Vercel-hosted endpoints?** Other hosting providers? IP allowlisting? Specific TLS requirements?

5. **Can you test our endpoint from your infrastructure?** URL: `https://innovaasflowforge.vercel.app/flowforge/api/voice/debug-llm`

---

## Reproduction Steps

1. Create a Custom LLM agent with URL pointing to our endpoint
2. Start a conversation via WebRTC
3. Wait for the agent to speak the initial greeting (works)
4. Speak a response to the agent
5. Observe: Connection disconnects ~5-8 seconds after user starts speaking

---

## Contact

Project: FlowForge
URL: https://innovaasflowforge.vercel.app
Test Page: https://innovaasflowforge.vercel.app/flowforge/voice-test
