# ElevenLabs Custom LLM Integration Issue

**Date:** January 5, 2026
**Project:** FlowForge (innovaasflowforge.vercel.app)
**Issue:** Custom LLM conversations disconnect after first agent message

---

## Summary

We are experiencing a consistent issue where ElevenLabs Conversational AI agents configured with Custom LLM disconnect immediately after the user speaks. The first LLM call (initial greeting) works correctly, but the second LLM call (responding to user input) fails with "custom_llm generation failed" error.

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

## Questions for ElevenLabs Support

1. Is ElevenLabs actually calling our Custom LLM endpoint for the second turn? The conversation shows 787 input tokens but 0 output, suggesting a connection or parsing issue.

2. Are there any specific requirements for Custom LLM endpoints hosted on Vercel that we should be aware of?

3. Is there a way to see detailed logs of what ElevenLabs sends to our Custom LLM and what response it receives?

4. Are there timeout requirements for the first byte of the response that might differ from standard HTTP timeouts?

5. Does ElevenLabs use any specific HTTP client or have any requirements around chunked transfer encoding for SSE responses?

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
