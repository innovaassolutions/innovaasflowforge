# Technical Research Report: ElevenLabs Voice Agent Integration for FlowForge

**Date:** 2025-12-31
**Prepared by:** Todd
**Project Context:** Adding real-time voice conversation capabilities to the FlowForge education interview system

---

## Executive Summary

This technical research evaluates integration patterns for adding ElevenLabs voice capabilities to FlowForge's education interview system. Three options were analyzed: fully managed ElevenLabs agent, hybrid integration with custom LLM endpoint, and direct WebSocket implementation.

### Key Recommendation

**Primary Choice:** Hybrid Integration with Custom LLM Endpoint (Option B)

**Rationale:** This approach preserves FlowForge's sophisticated interview logic (safeguarding, constitution-based prompts, domain coverage) as a single source of truth while leveraging ElevenLabs for all voice I/O, turn-taking, and audio quality. ElevenLabs calls your custom endpoint, which wraps the existing Claude-based interview agent.

**Key Benefits:**

- Existing interview agent code remains unchanged
- Text and voice modes share identical logic (no drift)
- All transcripts flow through your Supabase storage
- Clear path to React Native mobile app
- ElevenLabs handles audio complexity (~75ms TTS, ~150ms STT)

---

## 1. Research Objectives

### Technical Question

How to integrate ElevenLabs Conversational AI voice capabilities into the FlowForge education interview system, enabling stakeholders to speak with the AI agent instead of typing, while preserving the existing Claude-based interview logic and Supabase data persistence?

### Project Context

- **Project Type:** Brownfield (existing Next.js 15 application)
- **Current State:** Text-based interview system with Claude AI agent
- **Existing Stack:** Next.js 15, TypeScript, Supabase, Anthropic Claude API
- **Target:** Add optional voice mode alongside existing text mode
- **ElevenLabs Account:** Active and ready for integration

### Requirements and Constraints

#### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Voice Input: Real-time speech capture and transcription | Must Have |
| FR-2 | Voice Output: Natural TTS for agent responses | Must Have |
| FR-3 | Preserve existing Claude interview logic (safeguarding, constitution, domain coverage) | Must Have |
| FR-4 | Transcript synchronization to Supabase | Must Have |
| FR-5 | Mode selection at session start (text or voice) | Must Have |
| FR-6 | Session continuity and resume capability | Must Have |
| FR-7 | Mobile app support (React Native) | Future |

#### Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-1 | Response latency | Real-time (<1 second end-to-end) |
| NFR-2 | Audio quality | Natural, clear speech |
| NFR-3 | Browser compatibility | Modern browsers with WebRTC/WebSocket |
| NFR-4 | Mobile readiness | Architecture should support React Native later |
| NFR-5 | Reliability | Graceful fallback if voice fails |

#### Technical Constraints

| Constraint | Value |
|------------|-------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | Supabase (PostgreSQL) |
| Current AI | Anthropic Claude API |
| Voice Provider | ElevenLabs (account active) |
| Interview Logic | Must use existing education-interview-agent |

---

## 2. Technology Options Evaluated

Based on ElevenLabs 2025 capabilities and FlowForge requirements, three integration patterns were evaluated:

### Option A: ElevenLabs Managed Agent with Native Claude

**Architecture:** ElevenLabs hosts the complete voice agent, using their native Claude integration.

```
User (Voice) → ElevenLabs Platform → Native Claude (hosted) → ElevenLabs TTS → User
```

**How it works:**
- Create an agent in ElevenLabs dashboard
- Select Claude Sonnet 4 or Claude Haiku as the LLM
- Configure system prompt with interview logic
- ElevenLabs handles all voice I/O, turn-taking, and LLM calls

**Sources:** [ElevenLabs Models](https://elevenlabs.io/docs/agents-platform/customization/llm), [Claude 3.7 Sonnet Integration](https://elevenlabs.io/blog/introducing-claude-37-sonnet-in-elevenlabs-conversational-ai)

---

### Option B: Hybrid Integration with Custom LLM Endpoint (RECOMMENDED)

**Architecture:** ElevenLabs handles voice I/O; FlowForge provides custom LLM endpoint wrapping existing Claude agent.

```
User (Voice) → ElevenLabs (STT/TTS/Turn-taking)
                    ↓
            FlowForge API Endpoint (/v1/chat/completions)
                    ↓
            Existing Claude Interview Agent
                    ↓
            Supabase (transcript storage)
```

**How it works:**
- Create Next.js API route implementing OpenAI-compatible `/v1/chat/completions` format
- Route wraps existing `processEducationMessage()` function
- ElevenLabs calls your endpoint for each conversation turn
- You control all interview logic, safeguarding, and data persistence

**Sources:** [Custom LLM Integration](https://elevenlabs.io/docs/agents-platform/customization/llm/custom-llm), [Integrating External Agents](https://elevenlabs.io/blog/integrating-complex-external-agents)

---

### Option C: Direct WebSocket Integration

**Architecture:** Build custom voice pipeline using ElevenLabs WebSocket APIs directly.

```
User (Voice) → Browser Microphone → ElevenLabs STT WebSocket
                                            ↓
                                    Your Application Logic
                                            ↓
                                    Claude API (Anthropic)
                                            ↓
                                    ElevenLabs TTS WebSocket → Audio Playback
```

**How it works:**
- Use `@elevenlabs/react` SDK's `useConversation` hook
- Implement custom audio capture and playback
- Full control over every aspect of the voice pipeline
- Requires more development effort

**Sources:** [React SDK](https://elevenlabs.io/docs/agents-platform/libraries/react), [WebSocket API](https://elevenlabs.io/docs/agents-platform/libraries/web-sockets)

---

## 3. Detailed Technology Profiles

### Option A: ElevenLabs Managed Agent

#### Overview
ElevenLabs provides a fully managed conversational AI platform where you create agents directly in their dashboard. The platform handles STT, LLM orchestration, TTS, and turn-taking.

#### Technical Characteristics

| Aspect | Details |
|--------|---------|
| **Latency** | ~75ms TTS (Flash v2.5), sub-150ms STT (Scribe v2) [Verified 2025] |
| **LLM Options** | Claude Sonnet 4, Claude Haiku, GPT-4o, Gemini Flash 1.5 |
| **Turn-Taking** | Proprietary model analyzing "um", "ah", conversational cues |
| **Languages** | 32 languages with automatic detection |
| **Voices** | 5,000+ voices, custom voice cloning available |

#### Pros
- Fastest time to implementation (hours, not days)
- No infrastructure to manage
- Built-in turn-taking, interruption handling
- Automatic language detection
- Post-call webhooks for data sync

#### Cons
- **Interview logic must be duplicated** in ElevenLabs system prompt
- **No access to existing Claude agent** - would need to recreate logic
- Less control over conversation flow
- Data lives in ElevenLabs platform first
- Harder to maintain parity with text mode

#### Fit for FlowForge: **LOW**
Requires duplicating sophisticated interview logic (safeguarding detection, constitution-based prompts, domain coverage tracking) in a separate system. Creates maintenance burden and potential drift between text/voice modes.

**Sources:** [ElevenLabs Platform](https://elevenlabs.io/conversational-ai), [Latency Optimization](https://elevenlabs.io/blog/how-do-you-optimize-latency-for-conversational-ai)

---

### Option B: Hybrid Integration with Custom LLM Endpoint (RECOMMENDED)

#### Overview
ElevenLabs Agents Platform supports "Custom LLM" configuration where you provide an endpoint that implements the OpenAI Chat Completions API format. ElevenLabs handles all voice I/O while your server handles the LLM logic.

#### Technical Characteristics

| Aspect | Details |
|--------|---------|
| **API Format** | OpenAI-compatible `/v1/chat/completions` endpoint |
| **Streaming** | Server-Sent Events (SSE) with `data:` prefix |
| **Authentication** | API key stored in ElevenLabs secrets |
| **Latency Handling** | "Buffer words" technique for slower LLMs |
| **Function Calling** | Supported for system tools |

#### Implementation Requirements

1. **Create Next.js API Route:**
```typescript
// app/api/voice/llm/route.ts
export async function POST(request: Request) {
  const { messages, stream } = await request.json()

  // Extract user message and call existing interview agent
  const response = await processEducationMessage(...)

  // Return OpenAI-compatible streaming response
  return new Response(streamResponse(response), {
    headers: { 'Content-Type': 'text/event-stream' }
  })
}
```

2. **Configure ElevenLabs Agent:**
   - Set LLM to "Custom LLM"
   - Provide your endpoint URL
   - Store authentication secret

3. **Sync Transcripts:**
   - Use post-call webhook to sync to Supabase
   - Or sync within your LLM endpoint on each turn

#### Pros
- **Single source of truth** for interview logic
- Existing Claude agent fully preserved
- All data flows through your infrastructure
- Text and voice modes share identical logic
- Full control over safeguarding, progress tracking
- React Native support via ElevenLabs SDK

#### Cons
- Additional latency from extra network hop (~100-200ms)
- More complex initial setup
- Need to handle streaming response format
- Must expose endpoint publicly (or use ngrok for dev)

#### Latency Analysis
- ElevenLabs STT: ~150ms
- Network to your endpoint: ~50-100ms
- Claude API (Haiku): ~350ms, (Sonnet): ~700-1000ms
- Network back: ~50-100ms
- ElevenLabs TTS: ~75ms
- **Total estimated: 700-1500ms** (acceptable for conversation)

#### Fit for FlowForge: **HIGH**
Perfect alignment with requirements. Preserves existing interview logic, enables gradual rollout, and provides clear path to mobile.

**Sources:** [Custom LLM Docs](https://elevenlabs.io/docs/agents-platform/customization/llm/custom-llm), [Buffer Words Technique](https://elevenlabs.io/blog/how-do-you-optimize-latency-for-conversational-ai)

---

### Option C: Direct WebSocket Integration

#### Overview
Build a completely custom voice pipeline using ElevenLabs APIs directly, managing audio capture, WebSocket connections, and playback yourself.

#### Technical Characteristics

| Aspect | Details |
|--------|---------|
| **SDK** | `@elevenlabs/react` with `useConversation` hook |
| **Connection** | WebSocket to `wss://api.elevenlabs.io/v1/convai/conversation` |
| **Audio** | Base64-encoded chunks via `user_audio_chunk` messages |
| **Events** | `user_transcript`, `agent_response`, `audio`, `interruption` |
| **Auth** | Signed URLs for private agents |

#### Implementation Requirements

1. **Install SDK:**
```bash
npm install @elevenlabs/react
```

2. **Create Voice Component:**
```typescript
import { useConversation } from '@elevenlabs/react'

function VoiceSession({ signedUrl }) {
  const { status, isSpeaking, startConversation, endConversation } =
    useConversation({
      onMessage: (msg) => { /* handle transcripts */ },
      onError: (err) => { /* handle errors */ }
    })

  return (/* voice UI */)
}
```

3. **Generate Signed URLs Server-Side:**
```typescript
// app/api/voice/signed-url/route.ts
export async function GET() {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${AGENT_ID}`,
    { headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY } }
  )
  return Response.json(await response.json())
}
```

#### Pros
- Maximum flexibility and control
- Can implement custom turn-taking logic
- Direct access to all audio events
- Can integrate with any backend architecture

#### Cons
- Significantly more development effort
- Must handle audio buffering, jitter, playback
- No built-in turn-taking (must implement or use agent)
- More code to maintain
- Higher risk of audio quality issues

#### Fit for FlowForge: **MEDIUM**
Overkill for current requirements. The Hybrid approach (Option B) provides sufficient control with less development effort.

**Sources:** [React SDK](https://www.npmjs.com/package/@elevenlabs/react), [WebSocket Docs](https://elevenlabs.io/docs/agents-platform/libraries/web-sockets)

---

## 4. Comparative Analysis

### Comparison Matrix

| Dimension | Option A (Managed) | Option B (Hybrid) | Option C (Custom) |
|-----------|-------------------|-------------------|-------------------|
| **Preserves Interview Logic** | Low | **High** | High |
| **Development Effort** | **Low** | Medium | High |
| **Time to POC** | **Hours** | Days | Weeks |
| **Latency** | **Best (~500ms)** | Good (~1000ms) | Variable |
| **Control over Logic** | Low | **High** | **High** |
| **Data Ownership** | Medium | **High** | **High** |
| **Maintenance Burden** | Low (but duplicate logic) | **Low** | High |
| **Mobile Readiness** | **High** | **High** | Medium |
| **Scalability** | **High** | **High** | Medium |
| **Cost Predictability** | Medium | **High** | High |

### Weighted Analysis

**Decision Priorities (from requirements):**

1. **Preserve existing interview logic** - Critical (Weight: 5)
2. **Real-time latency** - High (Weight: 4)
3. **Single source of truth** - High (Weight: 4)
4. **Mobile readiness** - Medium (Weight: 3)
5. **Development effort** - Medium (Weight: 3)

**Weighted Scores:**

| Option | Logic (5) | Latency (4) | Truth (4) | Mobile (3) | Effort (3) | **Total** |
|--------|-----------|-------------|-----------|------------|------------|-----------|
| A (Managed) | 1 | 5 | 2 | 5 | 5 | **56** |
| B (Hybrid) | 5 | 4 | 5 | 5 | 3 | **81** |
| C (Custom) | 5 | 3 | 5 | 3 | 1 | **66** |

**Winner: Option B (Hybrid Integration)** with score of 81/95

---

## 5. Trade-offs and Decision Factors

### Use Case Fit Analysis

**FlowForge-Specific Requirements:**

| Requirement | Option A | Option B | Option C |
|-------------|----------|----------|----------|
| Safeguarding detection | Must recreate | **Native** | **Native** |
| Constitution-based prompts | Must recreate | **Native** | **Native** |
| Domain coverage tracking | Must recreate | **Native** | **Native** |
| Progress state management | Separate sync | **Inline** | **Inline** |
| Supabase transcript storage | Webhook | **Direct** | **Direct** |
| Mode switching (text/voice) | Complex | **Simple** | Simple |

### Key Trade-offs

**Option A vs Option B:**
- **Gain with A:** Faster initial setup, lower latency
- **Sacrifice with A:** Duplicate logic, maintenance burden, potential drift
- **Choose A when:** Building a new product without existing agent logic

**Option B vs Option C:**
- **Gain with B:** Faster development, ElevenLabs handles audio complexity
- **Sacrifice with B:** Slightly less control over audio pipeline
- **Choose C when:** Need custom turn-taking or audio processing

### Argument for Mixed Mode (Text + Voice in Same Session)

Todd asked about mixing text and voice in the same session. Here's the case **for** mixed mode:

1. **Accessibility:** Users with temporary audio issues can fall back to text
2. **Privacy moments:** User might need to type sensitive info quietly
3. **Clarification:** Typing a name or number is often clearer than speaking
4. **Progressive disclosure:** Start with text, offer voice upgrade

**Implementation with Option B:**
- Store `session_mode` in agent_sessions table
- Allow mode toggle via UI button
- Both modes hit same underlying interview agent
- Transcripts merge seamlessly in message history

**Recommendation:** Start with single mode per session (simpler), add mixed mode as enhancement after v1.

---

## 6. Real-World Evidence

### Production Experiences

**ElevenLabs Custom LLM Integrations:**

From community and documentation research:

1. **Latency Benchmarks (GitHub: bidirectional_streaming_ai_voice):**
   - User speech → Transcription → Claude → First token: ~3.5 seconds
   - Token accumulation for TTS chunk: ~1.25 seconds
   - TTS generation and return: ~1.25 seconds
   - **Total round-trip: ~6 seconds** (without optimization)

   [Source: [GitHub - bidirectional_streaming_ai_voice](https://github.com/ccappetta/bidirectional_streaming_ai_voice)]

2. **Buffer Words Technique:**
   Production users report using "..." (ellipsis + space) at end of initial response to maintain speech prosody while LLM processes complex reasoning.

   [Source: [ElevenLabs Latency Optimization](https://elevenlabs.io/blog/how-do-you-optimize-latency-for-conversational-ai)]

3. **Enterprise Deployments:**
   - HIPAA-compliant deployments available
   - EU data residency option for GDPR compliance
   - 400+ pre-built integrations (Salesforce, Twilio, etc.)

   [Source: [ElevenLabs Conversational AI 2.0](https://elevenlabs.io/blog/conversational-ai-2-0)]

### Known Gotchas

1. **Microphone Permissions:** Browser may block microphone by default. Must request permission before initiating conversation.

2. **Signed URL Expiry:** URLs expire after short period. Implement refresh logic for long sessions.

3. **API Key Security:** Never expose ElevenLabs API key client-side. Always use server-side signed URLs.

4. **Streaming Format:** Response must follow exact SSE format with `data: ` prefix and `data: [DONE]\n\n` terminator.

5. **Cold Start:** First request to custom LLM endpoint may have additional latency if using serverless functions.

---

## 7. Architecture Pattern Analysis

### Hybrid Voice Integration Pattern

**Pattern Overview:**

The Hybrid Voice Integration pattern separates concerns:
- **Voice I/O Layer:** ElevenLabs handles STT, TTS, turn-taking, audio quality
- **Intelligence Layer:** Your application handles LLM orchestration, business logic, data persistence
- **Bridge:** OpenAI-compatible API endpoint connects the two layers

**Architecture Diagram:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER DEVICE                                    │
│  ┌─────────────┐                              ┌─────────────────────┐   │
│  │  Microphone │◀─────────────────────────────│  Speaker/Headphones │   │
│  └──────┬──────┘                              └──────────▲──────────┘   │
│         │                                                │              │
│         ▼                                                │              │
│  ┌──────────────────────────────────────────────────────┴──────────┐   │
│  │                    ELEVENLABS REACT SDK                          │   │
│  │              useConversation() hook manages:                     │   │
│  │              - WebSocket connection                              │   │
│  │              - Audio capture/playback                            │   │
│  │              - Connection state                                  │   │
│  └──────────────────────────────┬───────────────────────────────────┘   │
└─────────────────────────────────┼───────────────────────────────────────┘
                                  │ WebSocket
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      ELEVENLABS PLATFORM                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│  │  Scribe v2  │    │ Turn-Taking │    │ Flash v2.5  │                 │
│  │    (STT)    │───▶│   Model     │───▶│    (TTS)    │                 │
│  │   ~150ms    │    │             │    │    ~75ms    │                 │
│  └─────────────┘    └──────┬──────┘    └─────────────┘                 │
│                            │                                            │
│                            │ Custom LLM API Call                        │
│                            ▼                                            │
└────────────────────────────┼────────────────────────────────────────────┘
                             │ HTTPS POST /v1/chat/completions
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       FLOWFORGE (VERCEL)                                 │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                 /api/voice/llm/route.ts                           │  │
│  │                                                                   │  │
│  │  1. Parse OpenAI-format request                                   │  │
│  │  2. Extract session context from messages                         │  │
│  │  3. Call processEducationMessage()                                │  │
│  │  4. Stream response in OpenAI SSE format                          │  │
│  │  5. Save transcript to Supabase                                   │  │
│  └──────────────────────────────┬───────────────────────────────────┘  │
│                                 │                                       │
│                                 ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │              education-interview-agent.ts                         │  │
│  │                                                                   │  │
│  │  - Constitution-based interview logic                             │  │
│  │  - Safeguarding detection                                         │  │
│  │  - Domain coverage tracking                                       │  │
│  │  - Progress state management                                      │  │
│  └──────────────────────────────┬───────────────────────────────────┘  │
│                                 │                                       │
│                                 ▼                                       │
│  ┌─────────────────┐    ┌─────────────────┐                            │
│  │  Anthropic API  │    │    Supabase     │                            │
│  │  (Claude)       │    │  (PostgreSQL)   │                            │
│  └─────────────────┘    └─────────────────┘                            │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key Implementation Considerations

1. **Session Context Passing:**
   - ElevenLabs sends conversation history in `messages` array
   - Map to FlowForge session context (token, module, state)
   - Options: encode in system message, or use `user_id` field

2. **Streaming Response Format:**
   ```
   data: {"choices":[{"delta":{"content":"Hello"}}]}

   data: {"choices":[{"delta":{"content":" there"}}]}

   data: {"choices":[{"delta":{"content":"!"}}]}

   data: [DONE]
   ```

3. **Error Handling:**
   - Return valid SSE even on error
   - Log errors server-side
   - Graceful degradation message to user

4. **Latency Optimization:**
   - Use Claude Haiku for faster responses
   - Implement buffer words for complex reasoning
   - Consider edge deployment (Vercel Edge Functions)

---

## 8. Recommendations

### Primary Recommendation: Option B - Hybrid Integration

**Rationale:**

Option B (Hybrid Integration with Custom LLM Endpoint) is recommended because it:

1. **Preserves existing interview logic** - No duplication of sophisticated safeguarding, constitution-based prompts, and domain coverage tracking
2. **Maintains single source of truth** - All interview logic stays in FlowForge codebase
3. **Enables gradual rollout** - Can add voice as optional feature without disrupting text mode
4. **Supports mobile future** - ElevenLabs React Native SDK uses same pattern
5. **Provides full data control** - All transcripts flow through your infrastructure

### Implementation Roadmap

#### Phase 1: Proof of Concept (1-2 days)

**Objectives:**
- Validate Custom LLM integration works with ElevenLabs
- Test latency with real interview agent
- Confirm streaming response format

**Steps:**
1. Create ElevenLabs agent with Custom LLM configuration
2. Build minimal `/api/voice/llm` endpoint wrapping existing agent
3. Test with simple conversation flow
4. Measure end-to-end latency

**Success Criteria:**
- Voice conversation completes with existing interview logic
- Latency < 2 seconds per turn
- Transcripts correctly saved to Supabase

#### Phase 2: Integration (3-5 days)

**Steps:**
1. Add voice mode toggle to session page
2. Implement ElevenLabs React SDK integration
3. Create signed URL endpoint for private agent
4. Handle session context passing
5. Add audio permission flow

#### Phase 3: Polish & Testing (2-3 days)

**Steps:**
1. UI/UX refinement for voice mode
2. Error handling and fallback flows
3. Cross-browser testing
4. Mobile browser testing
5. Load testing

#### Phase 4: Mobile (Future)

**Steps:**
1. React Native app setup
2. ElevenLabs React Native SDK integration
3. Native audio permissions handling
4. App store deployment

### Key Implementation Decisions

1. **LLM Model Selection:**
   - **Claude Haiku** for faster responses (~350ms)
   - **Claude Sonnet** if reasoning quality degrades

2. **Session Context Strategy:**
   - Encode session token in system message
   - Or use ElevenLabs `user_id` field

3. **Voice Selection:**
   - Use ElevenLabs default voices (fastest)
   - Consider custom voice for brand consistency

4. **Mode Switching:**
   - Single mode per session initially
   - Mixed mode as future enhancement

### Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Latency too high | Medium | High | Use Claude Haiku, implement buffer words, edge deployment |
| Audio quality issues | Low | Medium | Use default voices, test across devices |
| Session context loss | Medium | High | Robust context encoding, error recovery |
| Cost overruns | Low | Medium | Monitor usage, set budget alerts in ElevenLabs |
| Browser compatibility | Low | Medium | Test major browsers, graceful degradation |
| Mobile audio permissions | Medium | Medium | Clear permission flow, fallback to text |

---

## 9. Architecture Decision Record (ADR)

```markdown
# ADR-001: Voice Integration Architecture for FlowForge Interviews

## Status

Proposed

## Context

FlowForge provides AI-facilitated stakeholder interviews for education assessments. Currently, interviews are text-based. To improve accessibility and user experience, we want to add voice conversation capability using ElevenLabs, allowing stakeholders to speak with the AI agent instead of typing.

Key constraints:
- Must preserve existing Claude-based interview logic (safeguarding, constitution-based prompts, domain coverage)
- Must support real-time conversation (<2 second latency per turn)
- Must sync transcripts to existing Supabase storage
- Must support future mobile app development

## Decision Drivers

1. **Interview logic preservation** - Critical requirement to maintain sophisticated interview behavior
2. **Single source of truth** - Avoid maintaining duplicate logic in multiple systems
3. **Real-time latency** - Voice conversations must feel natural
4. **Data ownership** - All interview data must flow through FlowForge infrastructure
5. **Mobile readiness** - Architecture should support React Native in future

## Considered Options

1. **Option A: ElevenLabs Managed Agent** - Let ElevenLabs host complete voice agent with native Claude
2. **Option B: Hybrid Integration** - ElevenLabs for voice I/O, FlowForge custom endpoint for LLM logic
3. **Option C: Direct WebSocket** - Build custom voice pipeline using ElevenLabs APIs directly

## Decision

**Option B: Hybrid Integration with Custom LLM Endpoint**

## Rationale

Option B scores highest (81/95) in weighted analysis because it:
- Fully preserves existing interview logic (score: 5/5)
- Provides acceptable latency (~1000ms) with optimization potential (score: 4/5)
- Maintains single source of truth for all interview behavior (score: 5/5)
- Supports both web and mobile via ElevenLabs SDKs (score: 5/5)
- Requires moderate development effort with clear implementation path (score: 3/5)

Option A was rejected because it requires duplicating sophisticated interview logic in ElevenLabs system prompts, creating maintenance burden and risk of behavior drift between text/voice modes.

Option C was rejected as overkill - the Hybrid approach provides sufficient control with significantly less development effort.

## Consequences

**Positive:**
- Existing interview agent code remains unchanged
- Text and voice modes share identical interview logic
- All transcripts flow through existing Supabase storage
- Clear path to mobile app development
- ElevenLabs handles audio complexity (STT, TTS, turn-taking)

**Negative:**
- Additional network hop adds ~100-200ms latency
- Must implement OpenAI-compatible streaming response format
- Endpoint must be publicly accessible (or use ngrok for development)

**Neutral:**
- ElevenLabs subscription costs based on conversation minutes
- Need to monitor and optimize latency over time

## Implementation Notes

1. Create `/api/voice/llm` endpoint implementing OpenAI Chat Completions format
2. Configure ElevenLabs agent with Custom LLM pointing to endpoint
3. Use ElevenLabs React SDK for browser integration
4. Implement signed URL generation for private agent authentication
5. Consider Claude Haiku for faster responses if Sonnet latency is too high

## References

- [ElevenLabs Custom LLM Documentation](https://elevenlabs.io/docs/agents-platform/customization/llm/custom-llm)
- [ElevenLabs React SDK](https://www.npmjs.com/package/@elevenlabs/react)
- [ElevenLabs Latency Optimization](https://elevenlabs.io/blog/how-do-you-optimize-latency-for-conversational-ai)
- [FlowForge Interview Agent](app/lib/agents/education-interview-agent.ts)
```

---

## 10. References and Resources

### Official Documentation

- [ElevenLabs Agents Platform Overview](https://elevenlabs.io/docs/agents-platform/overview)
- [ElevenLabs Custom LLM Integration](https://elevenlabs.io/docs/agents-platform/customization/llm/custom-llm)
- [ElevenLabs React SDK](https://elevenlabs.io/docs/agents-platform/libraries/react)
- [ElevenLabs WebSocket API](https://elevenlabs.io/docs/agents-platform/libraries/web-sockets)
- [ElevenLabs React Native SDK](https://elevenlabs.io/docs/agents-platform/libraries/react-native)
- [ElevenLabs Latency Optimization](https://elevenlabs.io/docs/best-practices/latency-optimization)

### Blog Posts & Announcements

- [Conversational AI 2.0 Announcement](https://elevenlabs.io/blog/conversational-ai-2-0)
- [Claude 3.7 Sonnet in ElevenLabs](https://elevenlabs.io/blog/introducing-claude-37-sonnet-in-elevenlabs-conversational-ai)
- [Integrating Complex External Agents](https://elevenlabs.io/blog/integrating-complex-external-agents)
- [Optimizing Latency for Conversational AI](https://elevenlabs.io/blog/how-do-you-optimize-latency-for-conversational-ai)

### Code Examples & Tutorials

- [Next.js Quick Start Guide](https://elevenlabs.io/docs/conversational-ai/guides/quickstarts/next-js)
- [GitHub: elevenlabs-nextjs-conversational-ai](https://github.com/leonvanzyl/elevenlabs-nextjs-conversational-ai)
- [GitHub: bidirectional_streaming_ai_voice](https://github.com/ccappetta/bidirectional_streaming_ai_voice)
- [Neon Guide: Real-Time AI Voice Assistant](https://neon.com/guides/pulse)

### NPM Packages

- [@elevenlabs/react](https://www.npmjs.com/package/@elevenlabs/react) - React SDK for Conversational AI
- [@11labs/react](https://www.npmjs.com/package/@11labs/react) - Alternative package name

### FlowForge Internal References

- [Education Interview Agent](lib/agents/education-interview-agent.ts)
- [Session Messages API](app/api/education/session/[token]/messages/route.ts)
- [Education Session Page](app/education/session/[token]/page.tsx)

---

## Document Information

**Workflow:** BMad Research Workflow - Technical Research v2.0
**Generated:** 2025-12-31
**Research Type:** Technical/Architecture Research

---

## Appendix A: Implementation Guide

This comprehensive implementation guide provides detailed code examples and step-by-step instructions for integrating ElevenLabs voice capabilities into FlowForge using the recommended Hybrid Integration pattern (Option B).

---

### A.1 Custom LLM Endpoint Implementation

The Custom LLM endpoint is the bridge between ElevenLabs and your existing interview logic. It must implement the OpenAI Chat Completions API format with Server-Sent Events (SSE) streaming.

#### A.1.1 API Route Structure

Create the endpoint at `app/api/voice/llm/route.ts`:

```typescript
// app/api/voice/llm/route.ts
import { NextRequest } from 'next/server'
import { processEducationMessage } from '@/lib/agents/education-interview-agent'
import { createClient } from '@/lib/supabase/server'

interface OpenAIChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenAIChatRequest {
  messages: OpenAIChatMessage[]
  stream?: boolean
  model?: string
  user?: string  // Can contain session context
}

export async function POST(request: NextRequest) {
  try {
    // Verify API key from ElevenLabs
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 })
    }

    const apiKey = authHeader.replace('Bearer ', '')
    if (apiKey !== process.env.ELEVENLABS_LLM_SECRET) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body: OpenAIChatRequest = await request.json()
    const { messages, stream = true, user } = body

    // Extract session context from user field or system message
    const sessionContext = parseSessionContext(messages, user)

    if (!sessionContext.sessionToken) {
      return streamError('Session token not found')
    }

    // Get the last user message
    const userMessage = messages
      .filter(m => m.role === 'user')
      .pop()?.content

    if (!userMessage) {
      return streamError('No user message found')
    }

    // Call existing interview logic
    const supabase = await createClient()
    const response = await processEducationMessage({
      supabase,
      sessionToken: sessionContext.sessionToken,
      userMessage,
      moduleId: sessionContext.moduleId
    })

    // Stream response in OpenAI format
    if (stream) {
      return streamResponse(response.content)
    } else {
      return Response.json({
        id: `chatcmpl-${Date.now()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: 'flowforge-interview-agent',
        choices: [{
          index: 0,
          message: { role: 'assistant', content: response.content },
          finish_reason: 'stop'
        }]
      })
    }

  } catch (error) {
    console.error('Voice LLM Error:', error)
    return streamError('An error occurred processing your request')
  }
}

function parseSessionContext(
  messages: OpenAIChatMessage[],
  user?: string
): { sessionToken?: string; moduleId?: string } {
  // Strategy 1: Parse from user field (JSON encoded)
  if (user) {
    try {
      const parsed = JSON.parse(user)
      if (parsed.sessionToken) {
        return {
          sessionToken: parsed.sessionToken,
          moduleId: parsed.moduleId
        }
      }
    } catch {
      // Not JSON, might be session token directly
      if (user.startsWith('session_')) {
        return { sessionToken: user }
      }
    }
  }

  // Strategy 2: Parse from system message
  const systemMessage = messages.find(m => m.role === 'system')
  if (systemMessage?.content) {
    const tokenMatch = systemMessage.content.match(/SESSION_TOKEN:([a-zA-Z0-9_-]+)/)
    const moduleMatch = systemMessage.content.match(/MODULE_ID:([a-zA-Z0-9_-]+)/)
    if (tokenMatch) {
      return {
        sessionToken: tokenMatch[1],
        moduleId: moduleMatch?.[1]
      }
    }
  }

  return {}
}

function streamResponse(content: string): Response {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      // Split content into chunks for streaming effect
      const words = content.split(' ')
      let index = 0

      const sendChunk = () => {
        if (index < words.length) {
          const chunk = words.slice(index, index + 3).join(' ')
          const data = JSON.stringify({
            id: `chatcmpl-${Date.now()}`,
            object: 'chat.completion.chunk',
            created: Math.floor(Date.now() / 1000),
            model: 'flowforge-interview-agent',
            choices: [{
              index: 0,
              delta: { content: (index > 0 ? ' ' : '') + chunk },
              finish_reason: null
            }]
          })
          controller.enqueue(encoder.encode(`data: ${data}\n\n`))
          index += 3
          setTimeout(sendChunk, 50) // Small delay between chunks
        } else {
          // Send done signal
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        }
      }

      sendChunk()
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}

function streamError(message: string): Response {
  const encoder = new TextEncoder()
  const errorData = JSON.stringify({
    id: `chatcmpl-${Date.now()}`,
    object: 'chat.completion.chunk',
    choices: [{
      index: 0,
      delta: { content: message },
      finish_reason: 'stop'
    }]
  })

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache'
    }
  })
}
```

#### A.1.2 SSE Response Format Requirements

ElevenLabs expects responses in this exact format:

```
data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"gpt-4o-mini","choices":[{"index":0,"delta":{"content":"Hello"},"logprobs":null,"finish_reason":null}]}

data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"gpt-4o-mini","choices":[{"index":0,"delta":{"content":" there"},"logprobs":null,"finish_reason":null}]}

data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"gpt-4o-mini","choices":[{"index":0,"delta":{},"logprobs":null,"finish_reason":"stop"}]}

data: [DONE]
```

**Critical Requirements:**
- Each line must start with `data: ` (note the space)
- Each event ends with `\n\n` (double newline)
- The stream must terminate with `data: [DONE]\n\n`
- Content-Type must be `text/event-stream`

**Sources:** [OpenAI Streaming API](https://platform.openai.com/docs/api-reference/chat-streaming), [SSE Streaming for LLMs](https://upstash.com/blog/sse-streaming-llm-responses)

---

### A.2 Session Context Strategy

Since ElevenLabs initiates the conversation, you need a strategy to pass FlowForge session context to the LLM endpoint.

#### A.2.1 Recommended Approach: Dynamic Variables

ElevenLabs supports **dynamic variables** that can be passed when starting a conversation and injected into the system prompt.

**Step 1: Configure Agent with Dynamic Variables**

In ElevenLabs dashboard, set your system prompt to include:

```
You are an education assessment interviewer.
SESSION_TOKEN:{{session_token}}
MODULE_ID:{{module_id}}
STAKEHOLDER_NAME:{{stakeholder_name}}
```

**Step 2: Pass Variables When Starting Conversation**

```typescript
// In your React component
const startVoiceSession = async () => {
  const signedUrl = await fetchSignedUrl(sessionToken)

  await startConversation({
    signedUrl,
    dynamicVariables: {
      session_token: sessionToken,
      module_id: currentModuleId,
      stakeholder_name: stakeholderName
    }
  })
}
```

**Step 3: Parse in LLM Endpoint**

The system message will contain the interpolated values:
```
SESSION_TOKEN:abc123xyz
MODULE_ID:mod_456
```

#### A.2.2 Alternative: User ID Field

The `user` field in OpenAI-format requests can carry context:

```typescript
// ElevenLabs configuration
{
  "llm": {
    "user_id": "{{session_token}}"  // Dynamic variable
  }
}

// Or JSON-encoded context
{
  "llm": {
    "user_id": "{\"sessionToken\":\"{{session_token}}\",\"moduleId\":\"{{module_id}}\"}"
  }
}
```

#### A.2.3 Context Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    SESSION START (Browser)                       │
│                                                                  │
│  1. User clicks "Start Voice Interview"                         │
│  2. Frontend fetches signed URL with session context            │
│  3. startConversation() called with dynamicVariables            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ELEVENLABS PLATFORM                           │
│                                                                  │
│  4. Variables interpolated into system prompt                   │
│  5. User speaks, speech transcribed                             │
│  6. Messages array built with system prompt + user message      │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FLOWFORGE LLM ENDPOINT                        │
│                                                                  │
│  7. Parse SESSION_TOKEN from system message                     │
│  8. Load session state from Supabase                            │
│  9. Call processEducationMessage() with context                 │
│  10. Stream response back                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

### A.3 ElevenLabs Agent Setup (Dashboard Configuration)

Step-by-step guide to configure your ElevenLabs agent for Custom LLM integration.

#### A.3.1 Create New Agent

1. Navigate to [ElevenLabs Dashboard](https://elevenlabs.io/app/conversational-ai)
2. Click **Create an AI Agent**
3. Choose **Blank Template** (we'll configure everything)

#### A.3.2 Configure Voice Settings

**Voice Tab:**
- **Voice:** Select from library (recommended: "Rachel" or "Adam" for professional tone)
- **Model:** Flash v2.5 (lowest latency, ~75ms)
- **Stability:** 0.5 (balanced)
- **Similarity Boost:** 0.75
- **Speaker Boost:** Enabled

#### A.3.3 Configure LLM Settings

**LLM Tab:**

1. **LLM Selection:** Choose **Custom LLM**

2. **Server URL:**
   ```
   https://your-domain.vercel.app/api/voice/llm
   ```
   (For development: use ngrok or Vercel preview URL)

3. **Headers:**
   ```json
   {
     "Authorization": "Bearer {{ELEVENLABS_LLM_SECRET}}",
     "Content-Type": "application/json"
   }
   ```

4. **Add Secret:**
   - Click "Add Secret"
   - Name: `ELEVENLABS_LLM_SECRET`
   - Value: Generate a secure random string (32+ characters)
   - Store this same value in your Vercel environment variables

5. **System Prompt:**
   ```
   You are facilitating an education assessment interview.

   SESSION_TOKEN:{{session_token}}
   MODULE_ID:{{module_id}}

   The actual interview logic is handled by the backend.
   Simply relay the user's speech accurately.
   ```

6. **Dynamic Variables:**
   - Click "Add Variable"
   - `session_token` - type: string
   - `module_id` - type: string
   - `stakeholder_name` - type: string (optional)

#### A.3.4 Configure Agent Settings

**Agent Tab:**

1. **First Message:**
   ```
   Hello! I'm ready to begin your education assessment interview.
   Please speak naturally - I'll be listening and responding to guide our conversation.
   ```
   (Or leave empty if you want first message from backend)

2. **Language:** English (or enable auto-detect)

3. **Turn-Taking:**
   - **Mode:** Auto (recommended)
   - **Endpointing Threshold:** 400ms (adjust based on testing)

#### A.3.5 Configure Security

**Security Tab:**

1. **Enable Authentication:** Toggle ON
2. **Allowlisted Origins:**
   ```
   https://your-domain.vercel.app
   https://*.vercel.app  (for preview deployments)
   http://localhost:3000  (for development)
   ```

#### A.3.6 Save and Get Agent ID

1. Click **Save** to create the agent
2. Copy the **Agent ID** from the URL or settings
3. Add to your environment variables:
   ```
   ELEVENLABS_AGENT_ID=agent_xxxxxxxx
   ```

**Sources:** [ElevenLabs Agent Authentication](https://elevenlabs.io/docs/agents-platform/customization/authentication), [Custom LLM Configuration](https://elevenlabs.io/docs/agents-platform/customization/llm/custom-llm)

---

### A.4 React SDK Integration

Integrate ElevenLabs into your Next.js application using the `@elevenlabs/react` SDK.

#### A.4.1 Installation

```bash
npm install @elevenlabs/react
```

#### A.4.2 Signed URL Endpoint

Create server-side endpoint for generating signed URLs:

```typescript
// app/api/voice/signed-url/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Verify user is authenticated and has access to session
  const { sessionToken, moduleId } = await request.json()

  // Validate session access (implement your auth logic)
  const { data: session, error } = await supabase
    .from('agent_sessions')
    .select('id, stakeholder_name')
    .eq('session_token', sessionToken)
    .single()

  if (error || !session) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 403 })
  }

  // Request signed URL from ElevenLabs
  const response = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${process.env.ELEVENLABS_AGENT_ID}`,
    {
      method: 'GET',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY!
      }
    }
  )

  if (!response.ok) {
    const error = await response.text()
    console.error('ElevenLabs signed URL error:', error)
    return NextResponse.json({ error: 'Failed to get signed URL' }, { status: 500 })
  }

  const { signed_url } = await response.json()

  return NextResponse.json({
    signedUrl: signed_url,
    // Include dynamic variables for the frontend
    dynamicVariables: {
      session_token: sessionToken,
      module_id: moduleId,
      stakeholder_name: session.stakeholder_name
    }
  })
}
```

#### A.4.3 Voice Session Component

```typescript
// components/voice-session.tsx
'use client'

import { useConversation } from '@elevenlabs/react'
import { useState, useCallback, useEffect } from 'react'
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface VoiceSessionProps {
  sessionToken: string
  moduleId: string
  onTranscriptUpdate?: (transcript: TranscriptEntry[]) => void
}

interface TranscriptEntry {
  role: 'user' | 'agent'
  content: string
  timestamp: Date
}

export function VoiceSession({
  sessionToken,
  moduleId,
  onTranscriptUpdate
}: VoiceSessionProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt')

  // Check microphone permission
  useEffect(() => {
    navigator.permissions?.query({ name: 'microphone' as PermissionName })
      .then(result => {
        setMicPermission(result.state as 'granted' | 'denied' | 'prompt')
        result.onchange = () => setMicPermission(result.state as 'granted' | 'denied' | 'prompt')
      })
      .catch(() => setMicPermission('prompt'))
  }, [])

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs')
      setIsConnecting(false)
      setError(null)
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs')
    },
    onMessage: (message) => {
      // Handle different message types
      if (message.type === 'user_transcript' && message.message) {
        const entry: TranscriptEntry = {
          role: 'user',
          content: message.message,
          timestamp: new Date()
        }
        setTranscript(prev => {
          const updated = [...prev, entry]
          onTranscriptUpdate?.(updated)
          return updated
        })
      }

      if (message.type === 'agent_response' && message.message) {
        const entry: TranscriptEntry = {
          role: 'agent',
          content: message.message,
          timestamp: new Date()
        }
        setTranscript(prev => {
          const updated = [...prev, entry]
          onTranscriptUpdate?.(updated)
          return updated
        })
      }
    },
    onError: (err) => {
      console.error('Conversation error:', err)
      setError(err.message || 'Connection error')
      setIsConnecting(false)
    }
  })

  const startSession = useCallback(async () => {
    try {
      setIsConnecting(true)
      setError(null)

      // Request microphone permission if needed
      if (micPermission !== 'granted') {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true })
          setMicPermission('granted')
        } catch {
          setError('Microphone access is required for voice interviews')
          setIsConnecting(false)
          return
        }
      }

      // Get signed URL from backend
      const response = await fetch('/api/voice/signed-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, moduleId })
      })

      if (!response.ok) {
        throw new Error('Failed to initialize voice session')
      }

      const { signedUrl, dynamicVariables } = await response.json()

      // Start conversation with ElevenLabs
      await conversation.startSession({
        signedUrl,
        dynamicVariables
      })

    } catch (err) {
      console.error('Failed to start voice session:', err)
      setError(err instanceof Error ? err.message : 'Failed to start voice session')
      setIsConnecting(false)
    }
  }, [sessionToken, moduleId, micPermission, conversation])

  const endSession = useCallback(async () => {
    await conversation.endSession()
  }, [conversation])

  const isConnected = conversation.status === 'connected'
  const isSpeaking = conversation.isSpeaking

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      {/* Connection Status */}
      <div className="flex items-center space-x-2">
        <div
          className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
        <span className="text-sm text-muted-foreground">
          {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
        </span>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-2 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Speaking Indicator */}
      {isConnected && (
        <div className="flex items-center space-x-2">
          {isSpeaking ? (
            <>
              <div className="animate-pulse">
                <Mic className="w-6 h-6 text-accent" />
              </div>
              <span className="text-sm">Agent is speaking...</span>
            </>
          ) : (
            <>
              <MicOff className="w-6 h-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Listening...</span>
            </>
          )}
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex space-x-4">
        {!isConnected ? (
          <Button
            onClick={startSession}
            disabled={isConnecting}
            className="flex items-center space-x-2"
          >
            <Phone className="w-4 h-4" />
            <span>{isConnecting ? 'Connecting...' : 'Start Voice Interview'}</span>
          </Button>
        ) : (
          <Button
            onClick={endSession}
            variant="destructive"
            className="flex items-center space-x-2"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Session</span>
          </Button>
        )}
      </div>

      {/* Live Transcript */}
      {transcript.length > 0 && (
        <div className="w-full max-w-2xl border rounded-lg p-4 max-h-96 overflow-y-auto">
          <h3 className="font-medium mb-3">Live Transcript</h3>
          <div className="space-y-3">
            {transcript.map((entry, i) => (
              <div
                key={i}
                className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    entry.role === 'user'
                      ? 'bg-accent text-white'
                      : 'bg-bg-muted'
                  }`}
                >
                  <p className="text-sm">{entry.content}</p>
                  <span className="text-xs opacity-70">
                    {entry.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Microphone Permission Warning */}
      {micPermission === 'denied' && (
        <div className="bg-yellow-50 text-yellow-800 px-4 py-3 rounded-md text-sm max-w-md">
          <strong>Microphone access denied.</strong> Please enable microphone
          access in your browser settings to use voice interviews.
        </div>
      )}
    </div>
  )
}
```

#### A.4.4 Integration with Session Page

Add voice mode toggle to the existing session page:

```typescript
// In app/education/session/[token]/page.tsx

import { VoiceSession } from '@/components/voice-session'
import { useState } from 'react'
import { MessageSquare, Mic } from 'lucide-react'

// Add to component state
const [mode, setMode] = useState<'text' | 'voice'>('text')

// Add mode toggle UI
<div className="flex space-x-2 mb-4">
  <Button
    variant={mode === 'text' ? 'default' : 'outline'}
    onClick={() => setMode('text')}
    className="flex items-center space-x-2"
  >
    <MessageSquare className="w-4 h-4" />
    <span>Text</span>
  </Button>
  <Button
    variant={mode === 'voice' ? 'default' : 'outline'}
    onClick={() => setMode('voice')}
    className="flex items-center space-x-2"
  >
    <Mic className="w-4 h-4" />
    <span>Voice</span>
  </Button>
</div>

// Conditional rendering
{mode === 'text' ? (
  // Existing text chat interface
  <TextChat ... />
) : (
  <VoiceSession
    sessionToken={token}
    moduleId={currentModuleId}
    onTranscriptUpdate={handleTranscriptUpdate}
  />
)}
```

**Sources:** [ElevenLabs React SDK](https://elevenlabs.io/docs/conversational-ai/libraries/react), [useConversation Hook](https://www.npmjs.com/package/@elevenlabs/react)

---

### A.5 Latency Optimization

Techniques to minimize response time and create natural conversation flow.

#### A.5.1 Model Selection

| Model | Latency | Use Case |
|-------|---------|----------|
| Claude Haiku | ~350ms | Primary choice for voice |
| Claude Sonnet | ~700-1000ms | Complex reasoning fallback |
| Flash v2.5 (TTS) | ~75ms | ElevenLabs default |
| Scribe v2 (STT) | ~150ms | ElevenLabs default |

**Recommendation:** Start with Claude Haiku. Only upgrade to Sonnet if interview quality degrades.

```typescript
// In processEducationMessage()
const model = isVoiceMode
  ? 'claude-3-haiku-20240307'  // Faster for voice
  : 'claude-sonnet-4-20250514' // Full quality for text
```

#### A.5.2 Buffer Words Technique

When using slower models, ElevenLabs recommends "buffer words" - short filler phrases that maintain natural speech rhythm while the LLM processes.

**Implementation:**

```typescript
function streamResponse(content: string): Response {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      // Send buffer words immediately
      const bufferPhrase = "Let me think about that... "
      const bufferData = JSON.stringify({
        choices: [{ delta: { content: bufferPhrase } }]
      })
      controller.enqueue(encoder.encode(`data: ${bufferData}\n\n`))

      // Then stream actual content
      const words = content.split(' ')
      for (let i = 0; i < words.length; i += 3) {
        const chunk = words.slice(i, i + 3).join(' ')
        const data = JSON.stringify({
          choices: [{ delta: { content: (i > 0 ? ' ' : '') + chunk } }]
        })
        controller.enqueue(encoder.encode(`data: ${data}\n\n`))
        await new Promise(r => setTimeout(r, 30))
      }

      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    }
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' }
  })
}
```

**Buffer phrase options:**
- "Let me think about that..."
- "That's a great point..."
- "I understand..."
- "Mm-hmm..." (shortest)

#### A.5.3 Edge Deployment

Deploy the LLM endpoint to edge for reduced latency:

```typescript
// app/api/voice/llm/route.ts
export const runtime = 'edge'  // Deploy to Vercel Edge

// Note: Edge runtime has limitations:
// - No Node.js APIs (fs, path, etc.)
// - Limited execution time (30 seconds for Vercel Pro)
// - Must use Web APIs and fetch
```

**Edge Latency Benefits:**
- ~30-50ms reduction in network round-trip
- Requests processed closer to user
- Better cold start performance

#### A.5.4 Response Chunking Strategy

Optimize chunk size for natural speech:

```typescript
// Optimal: 200-500 characters per chunk
const CHUNK_SIZE = 300

function createChunks(text: string): string[] {
  const chunks: string[] = []
  let current = ''

  // Split on sentence boundaries when possible
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]

  for (const sentence of sentences) {
    if ((current + sentence).length > CHUNK_SIZE) {
      if (current) chunks.push(current.trim())
      current = sentence
    } else {
      current += sentence
    }
  }
  if (current) chunks.push(current.trim())

  return chunks
}
```

**Sources:** [ElevenLabs Latency Optimization](https://elevenlabs.io/blog/how-do-you-optimize-latency-for-conversational-ai), [Efficient TTS Pipelines](https://elevenlabs.io/blog/enhancing-conversational-ai-latency-with-efficient-tts-pipelines)

---

### A.6 Security & Authentication

Protecting your voice integration from unauthorized access.

#### A.6.1 Signed URL Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
│                                                                  │
│  1. User clicks "Start Voice Interview"                         │
│  2. Frontend calls /api/voice/signed-url with session token     │
└───────────────────────────┬─────────────────────────────────────┘
                            │ POST /api/voice/signed-url
                            │ (with auth cookie)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FLOWFORGE SERVER                             │
│                                                                  │
│  3. Verify user is authenticated                                │
│  4. Verify user has access to this session                      │
│  5. Request signed URL from ElevenLabs (using API key)          │
│  6. Return signed URL to client                                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │ Returns: { signedUrl, dynamicVariables }
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
│                                                                  │
│  7. startConversation({ signedUrl, dynamicVariables })          │
│  8. WebSocket connects to ElevenLabs with signed URL            │
│  9. Signed URL expires after 15 minutes                         │
│     (but active sessions continue working)                      │
└─────────────────────────────────────────────────────────────────┘
```

#### A.6.2 API Key Protection

**Never expose these client-side:**
- `ELEVENLABS_API_KEY` - Your ElevenLabs account API key
- `ELEVENLABS_LLM_SECRET` - Secret for Custom LLM authentication

**Environment Variables Setup:**

```bash
# .env.local (never commit)
ELEVENLABS_API_KEY=xi_xxxxxxxxxxxxxxxxxxxxxxxx
ELEVENLABS_AGENT_ID=agent_xxxxxxxxxxxxxxxx
ELEVENLABS_LLM_SECRET=your-secure-random-string-32-chars

# For development only (tunneling)
NGROK_URL=https://xxxx.ngrok.io
```

**Vercel Environment Variables:**
1. Go to Project Settings > Environment Variables
2. Add each variable with appropriate visibility:
   - `ELEVENLABS_API_KEY` - Production, Preview
   - `ELEVENLABS_AGENT_ID` - Production, Preview
   - `ELEVENLABS_LLM_SECRET` - Production, Preview

#### A.6.3 Custom LLM Authentication

The LLM endpoint must verify requests are from ElevenLabs:

```typescript
// app/api/voice/llm/route.ts
export async function POST(request: NextRequest) {
  // Verify API key
  const authHeader = request.headers.get('authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return new Response('Missing authorization header', { status: 401 })
  }

  const token = authHeader.replace('Bearer ', '')

  if (token !== process.env.ELEVENLABS_LLM_SECRET) {
    // Log failed auth attempts for monitoring
    console.warn('Invalid LLM auth attempt:', {
      ip: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent')
    })
    return new Response('Invalid credentials', { status: 401 })
  }

  // Proceed with request...
}
```

#### A.6.4 Domain Allowlist (Defense in Depth)

Configure ElevenLabs to only accept requests from your domains:

**Dashboard Configuration:**
1. Go to Agent Settings > Security
2. Add allowed origins:
   ```
   https://flowforge.app
   https://your-app.vercel.app
   https://*.vercel.app
   ```

**Benefits:**
- Even if signed URL is stolen, it won't work from other domains
- Extra layer of protection against abuse
- Rate limiting per origin

#### A.6.5 Session Validation

Always validate session access before generating signed URLs:

```typescript
// app/api/voice/signed-url/route.ts
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { sessionToken } = await request.json()

  // 1. Verify user authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Verify session exists and user has access
  const { data: session, error } = await supabase
    .from('agent_sessions')
    .select(`
      id,
      stakeholder_name,
      education_campaigns!inner(
        created_by
      )
    `)
    .eq('session_token', sessionToken)
    .single()

  if (error || !session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  // 3. Optional: Verify user owns the campaign
  // (depending on your access control model)

  // 4. Generate signed URL...
}
```

#### A.6.6 Rate Limiting

Protect against abuse with rate limiting:

```typescript
// Using Vercel KV or Upstash Redis
import { Ratelimit } from '@upstash/ratelimit'
import { kv } from '@vercel/kv'

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
})

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  const { success, limit, reset, remaining } = await ratelimit.limit(ip)

  if (!success) {
    return new Response('Rate limit exceeded', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
      }
    })
  }

  // Continue with request...
}
```

**Sources:** [ElevenLabs Agent Authentication](https://elevenlabs.io/docs/agents-platform/customization/authentication), [Get Signed URL API](https://elevenlabs.io/docs/conversational-ai/api-reference/conversations/get-signed-url)

---

### A.7 Testing & Development Workflow

#### A.7.1 Local Development with ngrok

ElevenLabs needs to reach your Custom LLM endpoint, which requires a public URL during development:

```bash
# Install ngrok
brew install ngrok

# Authenticate (one-time)
ngrok config add-authtoken YOUR_NGROK_TOKEN

# Start tunnel to your Next.js dev server
ngrok http 3000
```

**Update ElevenLabs agent:**
1. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
2. Update Custom LLM server URL in ElevenLabs dashboard
3. Test conversation

**Note:** ngrok URLs change each session unless you have a paid plan.

#### A.7.2 Testing Checklist

**Before Production:**
- [ ] Voice session connects successfully
- [ ] User speech is transcribed accurately
- [ ] Agent responses play back clearly
- [ ] Session context passes correctly
- [ ] Transcripts save to Supabase
- [ ] Graceful handling of network interruptions
- [ ] Microphone permission denied scenario
- [ ] Mobile browser testing (iOS Safari, Chrome Android)
- [ ] Latency acceptable (<2 seconds per turn)

#### A.7.3 Debugging Tools

**ElevenLabs Dashboard:**
- Monitor conversation history
- View debug logs
- Check LLM request/response logs

**Browser DevTools:**
- Network tab: Monitor WebSocket connection
- Console: Check for SDK errors
- Performance: Measure audio latency

**Server Logs:**
- Log incoming LLM requests
- Track response times
- Monitor error rates

---

---

## Appendix B: Multi-Vertical & User-Level Voice Activation Architecture

This appendix defines the architecture for enabling voice capabilities across multiple verticals (education, assessment, future agents) and at the user level, ensuring flexible activation and configuration.

---

### B.1 Architecture Overview

The voice activation system operates at three levels:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CONFIGURATION HIERARCHY                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                    SYSTEM LEVEL (Admin)                             │ │
│  │                                                                     │ │
│  │  • Which verticals have voice capability built/deployed             │ │
│  │  • Master feature flag for voice globally                          │ │
│  │  • ElevenLabs agent configuration per vertical                     │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                               │                                          │
│                               ▼                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                  ORGANIZATION LEVEL (Subscription)                  │ │
│  │                                                                     │ │
│  │  • Voice feature included in subscription tier?                    │ │
│  │  • Organization-level voice on/off toggle                          │ │
│  │  • Per-vertical voice enablement for the org                       │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                               │                                          │
│                               ▼                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                    USER LEVEL (Preference)                          │ │
│  │                                                                     │ │
│  │  • User's personal voice mode preference (on/off)                  │ │
│  │  • Per-session mode selection (text/voice)                         │ │
│  │  • Default mode preference                                         │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Voice is available when ALL levels permit:**
- System: Vertical has voice capability deployed
- Organization: Voice enabled for org + included in subscription
- User: User has voice mode enabled in preferences

---

### B.2 Database Schema

#### B.2.1 Vertical Configuration Table

```sql
-- Migration: create_vertical_voice_config

CREATE TABLE vertical_voice_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vertical_key TEXT UNIQUE NOT NULL,  -- 'education', 'assessment', etc.
  display_name TEXT NOT NULL,
  voice_enabled BOOLEAN DEFAULT false,  -- Master switch for this vertical
  elevenlabs_agent_id TEXT,  -- Separate agent per vertical (optional)
  voice_model TEXT DEFAULT 'flash_v2.5',  -- TTS model preference
  llm_endpoint_path TEXT NOT NULL,  -- e.g., '/api/voice/education/llm'
  system_prompt_template TEXT,  -- Base system prompt for voice mode
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Initial verticals
INSERT INTO vertical_voice_config (vertical_key, display_name, llm_endpoint_path) VALUES
  ('education', 'Education Assessment', '/api/voice/education/llm'),
  ('assessment', 'Digital Transformation Assessment', '/api/voice/assessment/llm');

-- Index for quick lookups
CREATE INDEX idx_vertical_voice_config_key ON vertical_voice_config(vertical_key);
```

#### B.2.2 Organization Voice Settings

```sql
-- Migration: add_organization_voice_settings

-- Add to existing organizations table or create separate settings table
CREATE TABLE organization_voice_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  voice_enabled BOOLEAN DEFAULT false,  -- Org-level master switch
  voice_included_in_plan BOOLEAN DEFAULT false,  -- Subscription feature flag
  allowed_verticals TEXT[] DEFAULT '{}',  -- Which verticals org can use voice for
  monthly_voice_minutes_limit INTEGER DEFAULT 100,  -- Usage quota
  monthly_voice_minutes_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id)
);

-- RLS Policy: Org admins can manage
ALTER TABLE organization_voice_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY org_voice_settings_policy ON organization_voice_settings
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );
```

#### B.2.3 User Voice Preferences

```sql
-- Migration: add_user_voice_preferences

CREATE TABLE user_voice_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  voice_enabled BOOLEAN DEFAULT true,  -- User wants voice mode available
  default_mode TEXT DEFAULT 'text' CHECK (default_mode IN ('text', 'voice')),
  auto_start_voice BOOLEAN DEFAULT false,  -- Auto-start voice when available
  preferred_voice_id TEXT,  -- Future: user's preferred ElevenLabs voice
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- RLS Policy: Users manage their own preferences
ALTER TABLE user_voice_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_voice_prefs_policy ON user_voice_preferences
  FOR ALL USING (user_id = auth.uid());

-- Auto-create preferences for new users
CREATE OR REPLACE FUNCTION create_default_voice_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_voice_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_created_voice_prefs
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_voice_preferences();
```

#### B.2.4 Session Voice Mode Tracking

```sql
-- Migration: add_session_voice_tracking

ALTER TABLE agent_sessions ADD COLUMN IF NOT EXISTS
  session_mode TEXT DEFAULT 'text' CHECK (session_mode IN ('text', 'voice', 'mixed'));

ALTER TABLE agent_sessions ADD COLUMN IF NOT EXISTS
  voice_minutes_used NUMERIC(10,2) DEFAULT 0;
```

---

### B.3 TypeScript Types

```typescript
// lib/types/voice.ts

export interface VerticalVoiceConfig {
  id: string
  verticalKey: 'education' | 'assessment' | string
  displayName: string
  voiceEnabled: boolean
  elevenlabsAgentId: string | null
  voiceModel: string
  llmEndpointPath: string
  systemPromptTemplate: string | null
}

export interface OrganizationVoiceSettings {
  id: string
  organizationId: string
  voiceEnabled: boolean
  voiceIncludedInPlan: boolean
  allowedVerticals: string[]
  monthlyVoiceMinutesLimit: number
  monthlyVoiceMinutesUsed: number
}

export interface UserVoicePreferences {
  id: string
  userId: string
  voiceEnabled: boolean
  defaultMode: 'text' | 'voice'
  autoStartVoice: boolean
  preferredVoiceId: string | null
}

export interface VoiceAvailability {
  available: boolean
  reason?: string
  config?: VerticalVoiceConfig
}

export type SessionMode = 'text' | 'voice' | 'mixed'
```

---

### B.4 Voice Availability Check Service

```typescript
// lib/services/voice-availability.ts

import { createClient } from '@/lib/supabase/server'
import type { VoiceAvailability, VerticalVoiceConfig } from '@/lib/types/voice'

interface CheckVoiceAvailabilityParams {
  userId: string
  organizationId: string
  verticalKey: string
}

export async function checkVoiceAvailability({
  userId,
  organizationId,
  verticalKey
}: CheckVoiceAvailabilityParams): Promise<VoiceAvailability> {
  const supabase = await createClient()

  // 1. Check system-level: Is voice deployed for this vertical?
  const { data: verticalConfig, error: verticalError } = await supabase
    .from('vertical_voice_config')
    .select('*')
    .eq('vertical_key', verticalKey)
    .eq('voice_enabled', true)
    .single()

  if (verticalError || !verticalConfig) {
    return {
      available: false,
      reason: 'Voice is not available for this interview type'
    }
  }

  // 2. Check organization-level: Is voice enabled + included in plan?
  const { data: orgSettings, error: orgError } = await supabase
    .from('organization_voice_settings')
    .select('*')
    .eq('organization_id', organizationId)
    .single()

  if (orgError || !orgSettings) {
    return {
      available: false,
      reason: 'Voice settings not configured for your organization'
    }
  }

  if (!orgSettings.voice_included_in_plan) {
    return {
      available: false,
      reason: 'Voice feature requires a premium subscription'
    }
  }

  if (!orgSettings.voice_enabled) {
    return {
      available: false,
      reason: 'Voice has been disabled for your organization'
    }
  }

  if (!orgSettings.allowed_verticals.includes(verticalKey)) {
    return {
      available: false,
      reason: `Voice is not enabled for ${verticalConfig.display_name}`
    }
  }

  // Check usage quota
  if (orgSettings.monthly_voice_minutes_used >= orgSettings.monthly_voice_minutes_limit) {
    return {
      available: false,
      reason: 'Monthly voice minutes quota exceeded'
    }
  }

  // 3. Check user-level: Does user want voice?
  const { data: userPrefs, error: userError } = await supabase
    .from('user_voice_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (userError || !userPrefs?.voice_enabled) {
    return {
      available: false,
      reason: 'Voice mode is disabled in your preferences'
    }
  }

  // All checks passed!
  return {
    available: true,
    config: {
      id: verticalConfig.id,
      verticalKey: verticalConfig.vertical_key,
      displayName: verticalConfig.display_name,
      voiceEnabled: verticalConfig.voice_enabled,
      elevenlabsAgentId: verticalConfig.elevenlabs_agent_id,
      voiceModel: verticalConfig.voice_model,
      llmEndpointPath: verticalConfig.llm_endpoint_path,
      systemPromptTemplate: verticalConfig.system_prompt_template
    }
  }
}

// Convenience function for API routes
export async function getVoiceConfigForSession(
  sessionToken: string
): Promise<VoiceAvailability> {
  const supabase = await createClient()

  // Get session details including vertical and org
  const { data: session, error } = await supabase
    .from('agent_sessions')
    .select(`
      id,
      user_id,
      education_campaigns!inner(
        organization_id,
        campaign_type
      )
    `)
    .eq('session_token', sessionToken)
    .single()

  if (error || !session) {
    return { available: false, reason: 'Session not found' }
  }

  // Determine vertical key from campaign type
  const verticalKey = session.education_campaigns.campaign_type || 'education'

  return checkVoiceAvailability({
    userId: session.user_id,
    organizationId: session.education_campaigns.organization_id,
    verticalKey
  })
}
```

---

### B.5 API Endpoints

#### B.5.1 Check Voice Availability Endpoint

```typescript
// app/api/voice/availability/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkVoiceAvailability } from '@/lib/services/voice-availability'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const verticalKey = request.nextUrl.searchParams.get('vertical') || 'education'
  const organizationId = request.nextUrl.searchParams.get('organizationId')

  if (!organizationId) {
    return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
  }

  const availability = await checkVoiceAvailability({
    userId: user.id,
    organizationId,
    verticalKey
  })

  return NextResponse.json(availability)
}
```

#### B.5.2 User Voice Preferences Endpoint

```typescript
// app/api/user/voice-preferences/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: prefs, error } = await supabase
    .from('user_voice_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) {
    // Return defaults if not found
    return NextResponse.json({
      voiceEnabled: true,
      defaultMode: 'text',
      autoStartVoice: false
    })
  }

  return NextResponse.json({
    voiceEnabled: prefs.voice_enabled,
    defaultMode: prefs.default_mode,
    autoStartVoice: prefs.auto_start_voice,
    preferredVoiceId: prefs.preferred_voice_id
  })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const updates = await request.json()

  // Validate allowed fields
  const allowedFields = ['voice_enabled', 'default_mode', 'auto_start_voice', 'preferred_voice_id']
  const sanitizedUpdates: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(updates)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
    if (allowedFields.includes(snakeKey)) {
      sanitizedUpdates[snakeKey] = value
    }
  }

  const { data, error } = await supabase
    .from('user_voice_preferences')
    .upsert({
      user_id: user.id,
      ...sanitizedUpdates,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
```

#### B.5.3 Dynamic Signed URL with Vertical Config

```typescript
// app/api/voice/signed-url/route.ts (updated)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getVoiceConfigForSession } from '@/lib/services/voice-availability'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { sessionToken, moduleId } = await request.json()

  // Check voice availability and get config
  const voiceAvailability = await getVoiceConfigForSession(sessionToken)

  if (!voiceAvailability.available) {
    return NextResponse.json(
      { error: voiceAvailability.reason },
      { status: 403 }
    )
  }

  const config = voiceAvailability.config!

  // Get session details for dynamic variables
  const { data: session } = await supabase
    .from('agent_sessions')
    .select('id, stakeholder_name')
    .eq('session_token', sessionToken)
    .single()

  // Use vertical-specific agent ID, or fall back to default
  const agentId = config.elevenlabsAgentId || process.env.ELEVENLABS_AGENT_ID

  // Request signed URL from ElevenLabs
  const response = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
    {
      method: 'GET',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY!
      }
    }
  )

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to get signed URL' }, { status: 500 })
  }

  const { signed_url } = await response.json()

  return NextResponse.json({
    signedUrl: signed_url,
    dynamicVariables: {
      session_token: sessionToken,
      module_id: moduleId,
      stakeholder_name: session?.stakeholder_name,
      vertical_key: config.verticalKey
    },
    config: {
      verticalKey: config.verticalKey,
      displayName: config.displayName,
      llmEndpointPath: config.llmEndpointPath
    }
  })
}
```

---

### B.6 UI Components

#### B.6.1 Voice Settings in User Profile

```typescript
// components/settings/voice-preferences.tsx
'use client'

import { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Mic, MessageSquare } from 'lucide-react'

interface VoicePreferences {
  voiceEnabled: boolean
  defaultMode: 'text' | 'voice'
  autoStartVoice: boolean
}

export function VoicePreferencesSettings() {
  const [prefs, setPrefs] = useState<VoicePreferences>({
    voiceEnabled: true,
    defaultMode: 'text',
    autoStartVoice: false
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/user/voice-preferences')
      .then(res => res.json())
      .then(data => setPrefs(data))
  }, [])

  const updatePreference = async (key: keyof VoicePreferences, value: boolean | string) => {
    setSaving(true)
    const newPrefs = { ...prefs, [key]: value }
    setPrefs(newPrefs)

    await fetch('/api/user/voice-preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: value })
    })

    setSaving(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="w-5 h-5" />
          Voice Interview Settings
        </CardTitle>
        <CardDescription>
          Configure how you interact with AI interview agents
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Voice Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="voice-enabled">Enable Voice Mode</Label>
            <p className="text-sm text-muted-foreground">
              Allow voice conversations in interviews where available
            </p>
          </div>
          <Switch
            id="voice-enabled"
            checked={prefs.voiceEnabled}
            onCheckedChange={(checked) => updatePreference('voiceEnabled', checked)}
            disabled={saving}
          />
        </div>

        {/* Default Mode Selection */}
        {prefs.voiceEnabled && (
          <>
            <div className="space-y-3">
              <Label>Default Interview Mode</Label>
              <RadioGroup
                value={prefs.defaultMode}
                onValueChange={(value) => updatePreference('defaultMode', value)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="text" id="mode-text" />
                  <Label htmlFor="mode-text" className="flex items-center gap-2 cursor-pointer">
                    <MessageSquare className="w-4 h-4" />
                    Text
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="voice" id="mode-voice" />
                  <Label htmlFor="mode-voice" className="flex items-center gap-2 cursor-pointer">
                    <Mic className="w-4 h-4" />
                    Voice
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Auto-start Voice */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-start">Auto-start Voice Sessions</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically begin voice mode when starting an interview
                </p>
              </div>
              <Switch
                id="auto-start"
                checked={prefs.autoStartVoice}
                onCheckedChange={(checked) => updatePreference('autoStartVoice', checked)}
                disabled={saving}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
```

#### B.6.2 Voice Mode Toggle in Session

```typescript
// components/session/mode-selector.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MessageSquare, AlertCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface ModeSelectorProps {
  sessionToken: string
  organizationId: string
  verticalKey: string
  currentMode: 'text' | 'voice'
  onModeChange: (mode: 'text' | 'voice') => void
}

interface VoiceAvailability {
  available: boolean
  reason?: string
}

export function ModeSelector({
  sessionToken,
  organizationId,
  verticalKey,
  currentMode,
  onModeChange
}: ModeSelectorProps) {
  const [voiceAvailable, setVoiceAvailable] = useState<VoiceAvailability | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/voice/availability?vertical=${verticalKey}&organizationId=${organizationId}`)
      .then(res => res.json())
      .then(data => {
        setVoiceAvailable(data)
        setLoading(false)
      })
      .catch(() => {
        setVoiceAvailable({ available: false, reason: 'Unable to check voice availability' })
        setLoading(false)
      })
  }, [verticalKey, organizationId])

  if (loading) {
    return (
      <div className="flex space-x-2">
        <Button variant="outline" disabled className="animate-pulse">
          <MessageSquare className="w-4 h-4 mr-2" />
          Text
        </Button>
        <Button variant="outline" disabled className="animate-pulse">
          <Mic className="w-4 h-4 mr-2" />
          Voice
        </Button>
      </div>
    )
  }

  return (
    <div className="flex space-x-2">
      <Button
        variant={currentMode === 'text' ? 'default' : 'outline'}
        onClick={() => onModeChange('text')}
        className="flex items-center"
      >
        <MessageSquare className="w-4 h-4 mr-2" />
        Text
      </Button>

      {voiceAvailable?.available ? (
        <Button
          variant={currentMode === 'voice' ? 'default' : 'outline'}
          onClick={() => onModeChange('voice')}
          className="flex items-center"
        >
          <Mic className="w-4 h-4 mr-2" />
          Voice
        </Button>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              disabled
              className="flex items-center opacity-50"
            >
              <Mic className="w-4 h-4 mr-2" />
              Voice
              <AlertCircle className="w-3 h-3 ml-1" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{voiceAvailable?.reason || 'Voice not available'}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}
```

---

### B.7 ElevenLabs Agent Strategy

#### B.7.1 Shared vs. Per-Vertical Agents

Two approaches for managing ElevenLabs agents:

**Option 1: Single Shared Agent (Recommended for Start)**

```
┌─────────────────────────────────────────────────────────────────┐
│                    ELEVENLABS DASHBOARD                          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            FlowForge Interview Agent                      │  │
│  │                                                          │  │
│  │  Custom LLM: https://flowforge.app/api/voice/llm         │  │
│  │                                                          │  │
│  │  Dynamic Variables:                                      │  │
│  │    - session_token                                       │  │
│  │    - module_id                                           │  │
│  │    - vertical_key  ← Routes to correct backend logic     │  │
│  │    - stakeholder_name                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Pros:**
- Simpler management (one agent to configure)
- Consistent voice across verticals
- Lower ElevenLabs cost (single agent)

**Cons:**
- Same voice/personality for all verticals
- System prompt must be generic

**Backend Routing:**

```typescript
// app/api/voice/llm/route.ts

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { messages } = body

  // Extract vertical from dynamic variables in system prompt
  const verticalKey = extractVerticalKey(messages)

  // Route to appropriate agent logic
  switch (verticalKey) {
    case 'education':
      return handleEducationInterview(messages)
    case 'assessment':
      return handleAssessmentInterview(messages)
    default:
      return handleDefaultInterview(messages)
  }
}
```

---

**Option 2: Per-Vertical Agents (Future Enhancement)**

```
┌─────────────────────────────────────────────────────────────────┐
│                    ELEVENLABS DASHBOARD                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │       Education Interview Agent                         │    │
│  │  Agent ID: agent_edu_xxx                               │    │
│  │  Voice: "Sarah" (warm, educational)                    │    │
│  │  LLM: https://flowforge.app/api/voice/education/llm    │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │       Assessment Interview Agent                        │    │
│  │  Agent ID: agent_assess_xxx                            │    │
│  │  Voice: "James" (professional, consultative)           │    │
│  │  LLM: https://flowforge.app/api/voice/assessment/llm   │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │       [Future Vertical] Agent                           │    │
│  │  Agent ID: agent_xxx                                   │    │
│  │  Voice: [Customized]                                   │    │
│  │  LLM: https://flowforge.app/api/voice/[vertical]/llm   │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

**Pros:**
- Customized voice/personality per vertical
- Tailored system prompts
- Independent configuration

**Cons:**
- More agents to manage
- Higher ElevenLabs cost
- More complex deployment

---

### B.8 Adding a New Vertical (Checklist)

When adding voice capability to a new vertical:

```markdown
## New Vertical Voice Setup Checklist

### 1. Database Configuration
- [ ] Insert row into `vertical_voice_config`
  - vertical_key: 'new_vertical'
  - display_name: 'Human Readable Name'
  - voice_enabled: false (enable after testing)
  - llm_endpoint_path: '/api/voice/new_vertical/llm'

### 2. Backend Implementation
- [ ] Create `/api/voice/new_vertical/llm/route.ts`
- [ ] Implement `processNewVerticalMessage()` function
- [ ] Add vertical routing in main LLM endpoint (if shared agent)

### 3. ElevenLabs Configuration (if per-vertical agent)
- [ ] Create new agent in ElevenLabs dashboard
- [ ] Configure Custom LLM endpoint
- [ ] Add secrets and dynamic variables
- [ ] Update `vertical_voice_config` with agent ID

### 4. Frontend Integration
- [ ] Update session page to detect vertical
- [ ] Add voice mode toggle
- [ ] Test VoiceSession component with new vertical

### 5. Organization Enablement
- [ ] Update allowed_verticals for pilot organizations
- [ ] Test end-to-end voice flow

### 6. Go Live
- [ ] Set voice_enabled = true in vertical_voice_config
- [ ] Monitor logs and ElevenLabs dashboard
- [ ] Gather user feedback
```

---

### B.9 Usage Tracking & Billing

```typescript
// lib/services/voice-usage.ts

import { createClient } from '@/lib/supabase/server'

export async function trackVoiceUsage(
  sessionToken: string,
  durationSeconds: number
): Promise<void> {
  const supabase = await createClient()

  // Get session and org
  const { data: session } = await supabase
    .from('agent_sessions')
    .select(`
      id,
      voice_minutes_used,
      education_campaigns!inner(organization_id)
    `)
    .eq('session_token', sessionToken)
    .single()

  if (!session) return

  const durationMinutes = durationSeconds / 60

  // Update session usage
  await supabase
    .from('agent_sessions')
    .update({
      voice_minutes_used: (session.voice_minutes_used || 0) + durationMinutes
    })
    .eq('id', session.id)

  // Update organization monthly usage
  await supabase
    .from('organization_voice_settings')
    .update({
      monthly_voice_minutes_used: supabase.sql`monthly_voice_minutes_used + ${durationMinutes}`
    })
    .eq('organization_id', session.education_campaigns.organization_id)
}

// Reset monthly usage (run via cron)
export async function resetMonthlyVoiceUsage(): Promise<void> {
  const supabase = await createClient()

  await supabase
    .from('organization_voice_settings')
    .update({ monthly_voice_minutes_used: 0 })
    .neq('monthly_voice_minutes_used', 0)
}
```

---

### B.10 Implementation Sequence

**Phase 1: Foundation (1-2 days)**
1. Create database migrations for voice tables
2. Implement `checkVoiceAvailability` service
3. Create API endpoints for availability and preferences

**Phase 2: UI Integration (1-2 days)**
1. Add VoicePreferencesSettings to user profile
2. Add ModeSelector to session pages
3. Conditionally render VoiceSession component

**Phase 3: Admin Configuration (1 day)**
1. Create admin UI for vertical_voice_config
2. Create admin UI for organization voice settings
3. Add usage dashboard

**Phase 4: Testing & Rollout**
1. Enable voice for education vertical (pilot)
2. Test with internal users
3. Gradual rollout to organizations

---

## Document Information

**Workflow:** BMad Research Workflow - Technical Research v2.0
**Generated:** 2025-12-31
**Updated:** 2026-01-01 (Multi-Vertical Architecture added)
**Research Type:** Technical/Architecture Research

---

_This technical research report was generated using the BMad Method Research Workflow, combining systematic technology evaluation frameworks with real-time research and analysis._
