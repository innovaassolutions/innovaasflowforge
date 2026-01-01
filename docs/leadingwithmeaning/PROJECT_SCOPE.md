# Leading with Meaning: Leadership Archetypes Discovery
## FlowForge Integration Project Scope

> **Client:** Leading with Meaning (Mark Nickerson)
> **Project:** AI-Enhanced Leadership Archetypes Assessment
> **Created:** 2025-12-31
> **Status:** Planning
> **Version:** 2.0 (AI-Enhanced Hybrid Approach)

---

## 1. Executive Summary

### Project Overview

Create an AI-facilitated Leadership Archetypes Discovery session for Leading with Meaning, combining Mark Nickerson's validated archetype framework with FlowForge's conversational AI capabilities. This hybrid approach delivers both the scientific rigor of deterministic scoring AND the personalization of AI-driven narrative synthesis.

### The Hybrid Value Proposition

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    TRADITIONAL QUIZ                                      │
│    Click → Click → Click → Generic Report                               │
│    (Commodity - anyone can build this)                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                    AI-ENHANCED DISCOVERY                                 │
│    Conversation → Stories → Reflection → Personalized Report            │
│    (Premium - unique to FlowForge + Leading with Meaning)               │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key Deliverables

1. **AI-Facilitated Discovery Session** - Conversational archetype exploration with embedded scoring
2. **Personalized Narrative Report** - AI-synthesized insights using client's own words and stories
3. **Context-Specific Relief Moves** - Recommendations tailored to client's actual situation
4. **Secure Token Access** - Private results accessible only via secure link
5. **Coach Dashboard** - Mark's view of all client results with conversation transcripts

### Value Proposition

**For Mark:**
- Clients arrive at first coaching session already reflective and warmed up
- Richer data: not just scores, but stories and examples from the client
- Differentiated offering from every other archetype quiz online
- Saves 30+ minutes of initial discovery per client

**For Clients:**
- Feels like a mini-coaching session, not a form
- Report speaks in their language, references their examples
- More likely to feel "seen" and engaged before meeting Mark
- Immediate, high-quality insight

**For FlowForge:**
- Demonstrates platform versatility beyond organizational assessments
- Proves AI-interview model works for coaching frameworks
- Template for other coaches/consultants to digitize their methodologies

---

## 2. Understanding the Assessment

### The 5 Leadership Archetypes

| Archetype | Answer Key | Core Traits | Under Pressure | When Grounded |
|-----------|------------|-------------|----------------|---------------|
| **Anchor** | A | Steadiness, calming, emotional regulation, stability | Absorbs tension, holds things together | Creates calm, helps others feel grounded |
| **Catalyst** | B | Momentum, action, decisiveness, urgency | Pushes harder, drives execution | Creates progress, makes things happen |
| **Steward** | C | Care, connection, emotional support, trust | Carries emotional weight, protects others | Builds trust, creates psychological safety |
| **Wayfinder** | D | Clarity, thinking, perspective, orientation | Overthinks, carries mental loops | Provides clarity, makes sense of complexity |
| **Architect** | E | Systems, structure, process, design | Fixes broken systems compulsively | Builds sustainable structures |

### Survey Structure (19 Questions)

| Section | Questions | Purpose | Scoring | AI Enhancement |
|---------|-----------|---------|---------|----------------|
| **1. Context** | Q1-3 | Role, ambiguity level, current state | Not scored | AI explores with follow-up stories |
| **2. Default Mode** | Q4-12 | Coping archetype under pressure | 2pts most / 1pt second | AI probes for real examples |
| **3. Authentic Mode** | Q13-16 | Natural leadership when centered | Same scoring | AI explores energy and sustainability |
| **4. Friction Signals** | Q17-19 | Validate patterns, resolve ties | Tiebreaker | AI confirms resonance |

### Scoring Algorithm (Runs in Background)

```
For each scored question (Q4-19):
  - "Most like me" selection → Add 2 points to that archetype
  - "Second most like me" selection → Add 1 point to that archetype

Default Archetype = Highest scoring archetype in Section 2 (Q4-12)
  Maximum possible: 27 points per archetype (9 questions × 3 points if always selected)

Authentic Archetype = Highest scoring archetype in Section 3 (Q13-16)
  Maximum possible: 12 points per archetype (4 questions × 3 points)

Tiebreaker: Section 4 responses + friction signal alignment

If Default ≠ Authentic → Misalignment Pattern (20 possible combinations)
If Default = Authentic → Aligned Pattern (5 possible combinations)
```

### Key Insight: 25 Possible Patterns

| Pattern Type | Count | Interpretation |
|--------------|-------|----------------|
| Misaligned | 20 | Coping effectively but not sustainably; relief moves focus on bridging gap |
| Aligned | 5 | Natural style matches pressure response; relief moves focus on protection |

---

## 3. The AI-Enhanced Experience

### 3.1 Session Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ARCHETYPE DISCOVERY SESSION                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐                                                       │
│  │   OPENING    │  AI introduces itself, sets tone, asks about          │
│  │   RAPPORT    │  what brought them to this assessment                 │
│  └──────┬───────┘                                                       │
│         │                                                               │
│         ▼                                                               │
│  ┌──────────────┐                                                       │
│  │   CONTEXT    │  Q1-3 presented conversationally                      │
│  │  EXPLORATION │  AI asks follow-up: "Tell me more about what          │
│  │   (Q1-3)     │  leading in ambiguity feels like for you"             │
│  └──────┬───────┘                                                       │
│         │                                                               │
│         ▼                                                               │
│  ┌──────────────┐                                                       │
│  │   DEFAULT    │  Each question presented, client selects              │
│  │    MODE      │  AI probes: "Can you think of a recent time           │
│  │   (Q4-12)    │  when you did this? What happened?"                   │
│  └──────┬───────┘  [Scoring engine calculates in background]            │
│         │                                                               │
│         ▼                                                               │
│  ┌──────────────┐                                                       │
│  │  AUTHENTIC   │  Shift in framing: "Now think about when              │
│  │    MODE      │  leadership feels good..."                            │
│  │   (Q13-16)   │  AI explores: "What makes that energizing?"           │
│  └──────┬───────┘                                                       │
│         │                                                               │
│         ▼                                                               │
│  ┌──────────────┐                                                       │
│  │   FRICTION   │  "These last few questions are about the              │
│  │   SIGNALS    │  harder parts..."                                     │
│  │   (Q17-19)   │  AI validates: "Does that resonate?"                  │
│  └──────┬───────┘                                                       │
│         │                                                               │
│         ▼                                                               │
│  ┌──────────────┐                                                       │
│  │   CLOSING    │  AI summarizes themes heard                           │
│  │  + PREVIEW   │  Previews archetype pairing (without full report)     │
│  │              │  Sets expectation for report + coaching               │
│  └──────────────┘                                                       │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  BACKGROUND PROCESSES                                                   │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │ Scoring Engine: Tracks selections, calculates archetype scores │    │
│  │ Story Capture: Extracts notable quotes and examples            │    │
│  │ Pattern Detection: Identifies emerging themes in responses     │    │
│  └────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 What AI Adds at Each Stage

#### Opening & Rapport
- **Traditional Quiz:** "Click to begin"
- **AI-Enhanced:** "Hi, I'm here to help you explore your leadership patterns. Before we dive in, I'm curious — what made you decide to take this assessment today?"

#### Context Exploration (Q1-3)
- **Traditional:** Click "Manager of managers"
- **AI-Enhanced:** After selection, asks "Tell me a bit about what that looks like day-to-day. What's the hardest part of being in that role right now?"

**Value:** Captures rich context that personalizes the entire report.

#### Default Mode Discovery (Q4-12)
- **Traditional:** Select top 2, move to next question
- **AI-Enhanced:** After selection, probes: "You said you tend to 'push for a decision so we don't stall.' Can you think of a recent situation where you did exactly that? What was happening?"

**Value:**
- Validates the selection with real experience
- Captures narrative for personalized report
- Reveals nuance (was it effective? exhausting? both?)

#### Authentic Mode Exploration (Q13-16)
- **Traditional:** Same click-through
- **AI-Enhanced:** Changes tone: "Now I want you to think about times when leadership feels right — sustainable, even enjoyable. When you're at your best..."

After selection: "You said you feel most energized when 'building trust and strong relationships.' What does that look like when it's happening? What makes it possible?"

**Value:** Captures the aspirational self, not just coping patterns.

#### Friction & Exhaustion (Q17-19)
- **Traditional:** Uncomfortable questions, click through quickly
- **AI-Enhanced:** "These last few questions might feel a bit more tender. They're about the parts of leadership that drain you. There are no wrong answers — just honest ones."

After selection: "You said 'I carry momentum almost alone' feels uncomfortably true. How long has that been the case? What would it take for that to shift?"

**Value:** Validates the friction signal, creates openness for coaching.

#### Closing & Preview
- **Traditional:** "Your results: Catalyst → Steward. Click to see report."
- **AI-Enhanced:** "Based on our conversation, I'm seeing some clear patterns. Under pressure, you become the engine — you make things happen, you push through. But what truly energizes you is connection and trust. That gap is real, and it's something Mark can help you work with. Your full report will have more detail, but I wanted you to know: this pattern makes sense, and there's a path forward."

**Value:** Client leaves feeling understood, not just categorized.

### 3.3 AI-Synthesized Report (The Key Differentiator)

Instead of generic templated content, the report includes:

#### Traditional Report:
> "As a Catalyst under pressure, you tend to push for action and momentum. This can lead to burnout."

#### AI-Enhanced Report:
> "When stakes are high, you become the engine — as you described when talking about the product launch where 'nothing moved unless I pushed it.' You carry momentum, often alone. But what truly energizes you is different: building trust and supporting your team, like in the example you shared about mentoring Sarah through her first leadership challenge. The gap between these two modes is where exhaustion lives."

#### Traditional Relief Moves:
> "Try delegating more and checking in on your team's emotional state."

#### AI-Enhanced Relief Moves:
> "Given that you're currently navigating constant ambiguity as a manager of managers, and leadership feels 'heavy and draining' right now, here's one small move: Before your next high-pressure meeting, take 30 seconds to ask yourself 'What does this team need from me emotionally right now?' — not just 'What needs to get done?' You mentioned Sarah as someone you've successfully supported. What would Sarah-level attention look like for the rest of your team?"

---

## 4. Technical Architecture

### 4.1 Approach: AI Interview with Scoring Backbone

This is a **hybrid architecture** that combines:
- FlowForge's conversation-based interview agent
- Deterministic scoring engine running in parallel
- AI synthesis for report generation

**Why This Approach:**
- Leverages existing FlowForge infrastructure (agent sessions, conversations, synthesis)
- Maintains scientific validity of archetype scoring
- Delivers premium personalized experience
- Scalable to other coaching frameworks

### 4.2 New Constitution: Archetype Interview Agent

A new constitution (like Education Parent Experience) defines the AI's behavior:

```yaml
constitution_id: leadership_archetypes_discovery
version: 1.0

role:
  identity: Leadership Pattern Explorer
  stance: Curious guide helping leaders discover patterns — not judge, fix, or diagnose

tone:
  qualities:
    - Warm but professional
    - Normalizing ("these patterns make sense")
    - Non-pathologizing ("not fixing, discovering")
    - Reflective ("I'm hearing that...")

  good_examples:
    - "That's a really common pattern for leaders in your position."
    - "It sounds like that approach has served you well, even if it's also been costly."
    - "I'm noticing a theme here..."

  bad_examples:
    - "That's a problem you need to fix."
    - "You should try to be less like that."
    - "Most successful leaders do it differently."

domains:
  context_exploration:
    questions: [Q1, Q2, Q3]
    follow_up_prompt: "Tell me more about what that's like day-to-day"

  default_mode_discovery:
    questions: [Q4-Q12]
    presentation: "When things feel tense or high-stakes, what you do instinctively matters more than what you intend. For each situation, I'll ask you to pick what feels most like you, and then second-most."
    follow_up_prompt: "Can you think of a recent time when you did exactly that? What was happening?"

  authentic_mode_discovery:
    questions: [Q13-Q16]
    presentation: "Now let's shift. Think about times when leadership feels sustainable, even enjoyable. When you're at your best..."
    follow_up_prompt: "What makes that possible? What does it feel like?"

  friction_validation:
    questions: [Q17-Q19]
    presentation: "These last questions are about the harder parts — the drain, the frustration."
    follow_up_prompt: "Does that resonate? How long has it been like that?"

question_presentation:
  format: conversational
  selection_ui: ranked_choice (most_like_me, second_most_like_me)
  after_selection: probe_for_story
  before_next_question: brief_reflection

closing_protocol:
  summarize_themes: true
  preview_archetype_pairing: true
  set_coaching_expectation: true
  tone: hopeful_and_grounded
```

### 4.3 Database Schema

```sql
-- ============================================
-- ORGANIZATION BRANDING (extends existing)
-- ============================================
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS
  brand_config JSONB DEFAULT '{}';
  -- Structure:
  -- {
  --   "logo_url": "https://...",
  --   "primary_color": "#1a365d",
  --   "secondary_color": "#3182ce",
  --   "accent_color": "#ed8936",
  --   "font_family": "Inter",
  --   "report_footer_text": "Prepared by Leading with Meaning"
  -- }

-- ============================================
-- CAMPAIGN TYPE: leadership_archetypes
-- ============================================
-- campaigns.campaign_type will include: 'leadership_archetypes'
-- campaigns.education_config repurposed as assessment_config:
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS
  assessment_config JSONB DEFAULT '{}';
  -- Structure for archetype campaigns:
  -- {
  --   "constitution_id": "leadership_archetypes_discovery",
  --   "enable_story_probing": true,
  --   "include_friction_section": true,
  --   "coach_id": "uuid-of-mark",
  --   "completion_notification_email": "mark@leadingwithmeaning.com"
  -- }

-- ============================================
-- ARCHETYPE RESPONSES (within conversation)
-- ============================================
-- These are captured from the conversation, not separate table
-- Stored in agent_sessions.session_context:
-- {
--   "archetype_responses": {
--     "Q4": { "most": "B", "second": "D", "story": "During the product launch..." },
--     "Q5": { "most": "C", "second": "A", "story": null },
--     ...
--   },
--   "context_responses": {
--     "role": "manager_of_managers",
--     "role_story": "I have 4 direct reports who each manage teams of 5-8...",
--     "ambiguity": "constantly",
--     "feeling": "heavy_and_draining"
--   }
-- }

-- ============================================
-- ARCHETYPE RESULTS (calculated post-session)
-- ============================================
CREATE TABLE archetype_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES campaign_assignments(id) UNIQUE,

  -- Raw scores (calculated from conversation responses)
  scores JSONB NOT NULL,
  -- {
  --   "default": { "anchor": 8, "catalyst": 14, "steward": 10, "wayfinder": 6, "architect": 7 },
  --   "authentic": { "anchor": 4, "catalyst": 3, "steward": 9, "wayfinder": 5, "architect": 3 },
  --   "friction": { "anchor": 0, "catalyst": 1, "steward": 2, "wayfinder": 0, "architect": 0 }
  -- }

  -- Determined archetypes
  default_archetype VARCHAR(20) NOT NULL,
  authentic_archetype VARCHAR(20) NOT NULL,
  is_aligned BOOLEAN NOT NULL,

  -- Key stories extracted by AI (for report personalization)
  notable_stories JSONB,
  -- [
  --   { "context": "default_mode", "archetype": "catalyst", "quote": "During the product launch, nothing moved unless I pushed it", "theme": "carrying_momentum" },
  --   { "context": "authentic_mode", "archetype": "steward", "quote": "Mentoring Sarah through her first leadership challenge", "theme": "building_trust" }
  -- ]

  -- Context for relief move personalization
  context_summary JSONB,
  -- {
  --   "role": "manager_of_managers",
  --   "ambiguity_level": "constantly",
  --   "current_feeling": "heavy_and_draining",
  --   "key_challenges": ["carrying momentum alone", "no time to think"]
  -- }

  calculated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Link to synthesis (report generation)
  synthesis_id UUID REFERENCES synthesis(id)
);

-- ============================================
-- ARCHETYPE CONTENT LIBRARY
-- ============================================
-- Pre-written content that AI can reference/personalize
CREATE TABLE archetype_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  archetype VARCHAR(20) NOT NULL,
  content_type VARCHAR(50) NOT NULL,
  -- Types: 'description', 'under_pressure', 'when_grounded', 'overuse_signals', 'protection_strategies'
  content_text TEXT NOT NULL,
  content_metadata JSONB DEFAULT '{}',
  display_order INTEGER DEFAULT 0,

  UNIQUE(archetype, content_type)
);

-- ============================================
-- MISALIGNMENT PATTERN CONTENT
-- ============================================
CREATE TABLE misalignment_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  default_archetype VARCHAR(20) NOT NULL,
  authentic_archetype VARCHAR(20) NOT NULL,

  -- Pattern identity
  pattern_name VARCHAR(100),
  -- e.g., "The Exhausted Engine" (Catalyst → Steward)

  -- Narrative content
  core_tension TEXT,
  why_it_happens TEXT,
  what_it_costs TEXT,
  path_to_relief TEXT,

  -- Relief moves (AI will personalize these)
  relief_move_templates JSONB,
  -- [
  --   { "move": "Before high-pressure meetings, pause to consider emotional needs", "personalization_hook": "team_context" },
  --   { "move": "Identify one person to invest in this week", "personalization_hook": "relationship_mentioned" }
  -- ]

  UNIQUE(default_archetype, authentic_archetype)
);

-- ============================================
-- SEED DATA: 5 Archetypes × 5 Content Types = 25 records
-- SEED DATA: 25 Misalignment Patterns
-- ============================================
-- (To be populated with content from Mark)
```

### 4.4 API Endpoints

```
# Session Management (uses existing FlowForge session infrastructure)
GET  /api/archetype/[token]              # Get session state
POST /api/archetype/[token]/messages     # Send message, receive AI response
                                         # (Scoring engine runs in background)
POST /api/archetype/[token]/complete     # Finalize session, calculate results

# Report Generation
POST /api/archetype/[token]/synthesize   # Run AI synthesis on conversation
GET  /api/archetype/[token]/report       # Get report data (JSON)
POST /api/archetype/[token]/report/pdf   # Generate and download PDF

# Coach Dashboard
GET  /api/coach/archetype/sessions       # List all sessions
GET  /api/coach/archetype/sessions/[id]  # Get session detail + transcript
POST /api/coach/archetype/invite         # Generate new invite
GET  /api/coach/archetype/analytics      # Aggregate statistics
```

### 4.5 UI Components

**New Pages:**
- `/archetype/[token]` - Conversation interface (public, token-authenticated)
- `/archetype/[token]/report` - Web report view
- `/dashboard/coach/archetypes` - Coach's session management

**Conversation UI Components:**
- `ArchetypeChat` - Main conversation interface (similar to existing interview)
- `RankedChoiceSelector` - UI for selecting "most like me" + "second most"
- `ProgressIndicator` - Shows section progress (Context → Default → Authentic → Friction)
- `SessionClosing` - Summary and next steps display

**Report Components:**
- `ArchetypeProfileCard` - Visual display of single archetype
- `PatternDiagram` - Visual showing Default → Authentic relationship
- `StoryHighlight` - Displays extracted quote with context
- `ReliefMoveCard` - Personalized recommendation display
- `ArchetypePDFDocument` - React-PDF report template

### 4.6 Integration with Existing FlowForge

| Existing Component | Archetype Usage |
|-------------------|-----------------|
| `campaign_assignments` | Stores archetype session (access_token, status, progress) |
| `agent_sessions` | Stores conversation history, session_context with responses |
| `interview-agent.ts` pattern | New `archetype-agent.ts` with constitution-driven behavior |
| `synthesis-agent.ts` pattern | New synthesis for archetype report generation |
| `pdf-document.tsx` | New `archetype-pdf-document.tsx` for branded report |
| Email system (Resend) | Completion notifications, report delivery |

---

## 5. Report Generation: AI Synthesis

### 5.1 Synthesis Input

The archetype synthesis agent receives:
1. **Conversation transcript** - Full dialogue with client
2. **Archetype scores** - Calculated from selections
3. **Extracted stories** - Notable quotes and examples
4. **Context summary** - Role, ambiguity, current feeling
5. **Content library** - Archetype descriptions, pattern content, relief move templates

### 5.2 Synthesis Output

```typescript
interface ArchetypeReportContent {
  // Executive Summary
  executive_summary: {
    headline: string; // "Catalyst Under Pressure, Steward at Heart"
    pattern_summary: string; // 2-3 sentences on the misalignment
    key_insight: string; // Most important takeaway
  };

  // Default Archetype Section
  default_archetype: {
    archetype: Archetype;
    score: number;
    score_breakdown: Record<Archetype, number>;
    personalized_description: string; // AI-written using client's stories
    notable_quotes: string[];
    what_it_protects: string;
    overuse_signals: string[];
  };

  // Authentic Archetype Section
  authentic_archetype: {
    archetype: Archetype;
    score: number;
    score_breakdown: Record<Archetype, number>;
    personalized_description: string;
    notable_quotes: string[];
    what_energizes: string;
    sustainability_factors: string[];
  };

  // Pattern Analysis (if misaligned)
  misalignment_pattern?: {
    pattern_name: string;
    core_tension: string; // Personalized
    why_it_happens: string; // Personalized
    what_it_costs: string; // Personalized
  };

  // Alignment Analysis (if aligned)
  alignment_pattern?: {
    what_it_means: string;
    protection_strategies: string[];
  };

  // Relief Moves (personalized to context)
  relief_moves: Array<{
    move: string;
    why_this_move: string;
    how_to_start: string;
  }>;

  // Next Steps
  next_steps: {
    coaching_invitation: string;
    reflection_prompts: string[];
    contact_info: CoachContact;
  };
}
```

### 5.3 Personalization Examples

**Generic → Personalized (Default Archetype):**

Generic:
> "As a Catalyst, you drive action and momentum under pressure."

Personalized:
> "When the stakes rise, you become the engine. You described this vividly when talking about the product launch: 'Nothing moved unless I pushed it.' This Catalyst energy has served you well — things get done, decisions get made, progress happens. But as you noted, it's also exhausting, especially when you feel like you're 'carrying momentum almost alone.'"

**Generic → Personalized (Relief Move):**

Generic:
> "Try to delegate more and trust your team."

Personalized:
> "You mentioned Sarah — someone you successfully mentored through her first leadership challenge. That Steward energy is already in you; it just gets crowded out under pressure. This week, pick one person on your team who needs what Sarah got from you. It doesn't have to be big — a 15-minute check-in asking 'How are you really doing?' Before your next crisis meeting, ask yourself: 'What does this team need from me emotionally, not just operationally?'"

---

## 6. Implementation Phases

### Phase 1: Core Conversation + Basic Report (MVP)

**Scope:**
- Archetype Interview Agent with constitution
- Conversation UI with ranked choice selection
- Background scoring engine
- Basic web report (scores + archetype descriptions)
- Secure token access
- Simple coach view (list of completions)

**Deliverable:** Mark can send session links to clients, they have a meaningful conversation, and both see basic results.

**Technical Work:**
- [ ] Create `archetype-constitution.ts`
- [ ] Create `archetype-interview-agent.ts`
- [ ] Build conversation UI at `/archetype/[token]`
- [ ] Implement scoring engine
- [ ] Create `archetype_results` table
- [ ] Basic report page

### Phase 2: AI-Synthesized Personalized Report

**Scope:**
- Full synthesis agent for report generation
- Story extraction from conversation
- Personalized narrative in report
- Context-specific relief moves
- Coach can view full transcript

**Deliverable:** Client receives deeply personalized report that references their stories.

**Technical Work:**
- [ ] Create `archetype-synthesis-agent.ts`
- [ ] Populate content library tables
- [ ] Build report synthesis API
- [ ] Enhanced report UI with quotes/stories

### Phase 3: Professional PDF + Branding

**Scope:**
- Branded PDF generation
- Leading with Meaning visual design
- Downloadable by client and coach
- Email notification on completion
- Email delivery of report

**Deliverable:** Professional, printable report matching LWM brand.

**Technical Work:**
- [ ] Create `archetype-pdf-document.tsx`
- [ ] Implement brand_config system
- [ ] Gather brand assets from Mark
- [ ] Email templates

### Phase 4: Coach Dashboard & Analytics

**Scope:**
- Full coach dashboard
- Session management (invite, view, archive)
- Transcript access
- Analytics (archetype distributions, common patterns)
- Batch invite generation

**Deliverable:** Mark has complete visibility and control.

### Phase 5: Multi-Coach / White Label (Future)

**Scope:**
- Support multiple coaches with own branding
- Coach onboarding flow
- Per-coach content customization
- Subscription/billing integration

**Deliverable:** FlowForge becomes a SaaS platform for coaching assessments.

---

## 7. Branding & Theming

### 7.1 Leading with Meaning Brand (To Be Confirmed)

Based on website analysis:
- **Primary Color:** Navy/Dark Blue (professional, trustworthy)
- **Accent Color:** Likely warm (gold, orange, or teal)
- **Typography:** Clean sans-serif (likely Inter or similar)
- **Tone:** Professional, empathetic, direct
- **Visual Style:** Minimal, generous whitespace, modern

### 7.2 Brand Application

| Element | Branding |
|---------|----------|
| Session Header | LWM logo, colors |
| Progress Bar | Accent color |
| Buttons | Primary/accent colors |
| Report Cover | Full brand treatment |
| Report Headers | Brand colors |
| PDF Footer | "Prepared by Leading with Meaning" |
| Email | Brand template |

### 7.3 Assets Needed from Mark

- [ ] Logo (SVG or high-res PNG, light and dark versions)
- [ ] Color palette (primary, secondary, accent)
- [ ] Font preference (or approval of Inter)
- [ ] Headshot (optional, for report)
- [ ] Tagline for report footer

---

## 8. Content Requirements from Mark

### 8.1 Archetype Descriptions (5 archetypes × 4 types = 20 pieces)

For each archetype (Anchor, Catalyst, Steward, Wayfinder, Architect):
- **General Description** (2-3 sentences)
- **Under Pressure Behavior** (what it looks like, what it protects)
- **When Grounded Behavior** (what it feels like, what energizes)
- **Overuse Warning Signs** (how to know when it's too much)

### 8.2 Misalignment Pattern Content (20 combinations)

For each Default → Authentic pairing (e.g., Catalyst → Steward):
- **Pattern Name** (e.g., "The Exhausted Engine")
- **Core Tension** (what the gap feels like)
- **Why It Happens** (normalizing explanation)
- **What It Costs** (sustainable perspective)
- **2-3 Relief Move Templates** (to be personalized by AI)

### 8.3 Aligned Pattern Content (5 combinations)

For each aligned pairing (e.g., Catalyst → Catalyst):
- **What Alignment Means** (not fixing, protecting)
- **Protection Strategies** (how to maintain under pressure)
- **Sustainability Factors** (what keeps it healthy)

### 8.4 Content Workshop Recommendation

BMad Master recommends a 2-hour collaborative session with Mark to:
1. Review his existing coaching materials
2. Draft archetype descriptions in his voice
3. Name the misalignment patterns together
4. Define relief moves for top 5 most common pairings
5. AI can help generate remaining content for review

---

## 9. Open Questions for Mark

1. **Session Duration:** Is 15-20 minutes acceptable, or does it need to be shorter?

2. **Story Depth:** How much probing for examples? (Light touch vs. deep exploration)

3. **Closing Preview:** Should the AI reveal the archetype pairing at session end, or save entirely for report?

4. **Report Delivery:** Immediate access, or delivered via email after synthesis?

5. **Transcript Access:** Should clients see their full conversation transcript in the report?

6. **Follow-up:** Should the report include a direct scheduling link for coaching?

7. **Content Voice:** Does Mark want to write the archetype content himself, or have AI draft for his review?

8. **Brand Assets:** Can Mark provide logo, colors, fonts?

---

## 10. Success Criteria

### MVP Success (Phase 1-2)

- [ ] Client completes meaningful 15-20 minute conversation
- [ ] Archetype scoring matches manual calculation
- [ ] Report includes at least 2 personalized elements from conversation
- [ ] Client feedback: "This felt like more than a quiz"
- [ ] Mark feedback: "Clients arrive more prepared for coaching"

### Full Product Success

- [ ] Professional PDF report matches LWM brand standards
- [ ] Client NPS > 8 on assessment experience
- [ ] Mark saves 30+ minutes per client on initial discovery
- [ ] Zero security incidents
- [ ] Coach dashboard provides full visibility

### Stretch Goals

- [ ] 90% session completion rate
- [ ] Clients share reports with colleagues (organic growth)
- [ ] Mark offers to other coaches (Phase 5 validation)

---

## 11. Next Steps

1. **Review this scope** with Todd and Mark
2. **Content workshop** to develop archetype content in Mark's voice
3. **Gather brand assets** from Mark
4. **Technical spike** on constitution-driven archetype agent
5. **Phase 1 development** begin

---

## 12. Appendix: Sample Conversation Flow

```
AI: Hi there. I'm here to help you explore your leadership patterns —
    specifically, how you tend to show up under pressure versus when
    you're at your best. There are no right or wrong answers, just
    honest ones. Before we dive into the questions, I'm curious —
    what made you decide to take this assessment today?

CLIENT: My coach Mark suggested it. I've been feeling pretty burned
        out lately and he thought this might help us figure out why.

AI: That makes sense. Burnout has a way of making everything feel
    harder. Let's see if we can find some patterns that might explain
    what's been draining you — and what might help.

    First, a quick bit of context. Which best describes your current role?
    a. Individual contributor
    b. People manager
    c. Manager of managers
    d. Senior leader or executive
    e. Founder or business owner

CLIENT: C - Manager of managers

AI: Got it. So you're leading leaders — that's a particular kind of
    pressure. What does that look like day-to-day? What's the hardest
    part right now?

CLIENT: I have 4 direct reports who each have teams of 5-8 people.
        The hardest part is that I'm constantly pulled between
        strategic work and putting out fires. My team needs me to be
        thinking ahead, but I spend most of my time reacting.

AI: That tension between strategic and reactive is exhausting. And
    it sounds like the fires keep winning.

    Speaking of which — how often does your role require you to make
    decisions with incomplete information?
    a. Rarely
    b. Occasionally
    c. Frequently
    d. Constantly

CLIENT: D - Constantly

AI: Constantly navigating ambiguity while putting out fires. That's
    a lot. One more context question: Lately, leadership feels...
    a. Mostly manageable
    b. Busy but sustainable
    c. Heavy and draining
    d. Chaotic and overwhelming

CLIENT: C - Heavy and draining

AI: Heavy and draining. I hear that. Let's dig into what might be
    making it feel that way.

    Now we'll move into some questions about how you tend to respond
    when things get tense. What you do instinctively matters more than
    what you intend — so think about what you actually do, not what
    you think you should do.

    When pressure is high and things feel messy, I tend to...

    Pick the one that feels MOST like you, and then the one that's
    SECOND most like you:

    a. Slow things down and help everyone regain calm before moving
    b. Push for a decision so we don't stall
    c. Check in on how people are feeling and try to reduce strain
    d. Step back to think through what actually matters
    e. Fix the process or system that seems broken

CLIENT: Most like me: B
        Second most: D

AI: So your first instinct is to push for a decision — keep things
    moving. Can you think of a recent situation where you did exactly
    that? What was happening?

CLIENT: Yeah, last month during a product launch. The team was going
        in circles about the rollout plan and I finally just said
        "We're doing option 2, let's move." It worked, but I was
        exhausted after.

AI: "We're doing option 2, let's move." — that's very Catalyst energy.
    The team needed momentum and you provided it. And you mentioned
    being exhausted after. Was that exhaustion physical, emotional,
    or something else?

CLIENT: Both, I think. It felt like nothing would have moved unless
        I pushed it. That's been a pattern lately.

AI: "Nothing moves unless I push it." That's an important observation.
    Let's keep exploring...

[... conversation continues through all 19 questions ...]

AI: We've covered a lot of ground together. Before we wrap up, let me
    share what I'm seeing in the patterns.

    Under pressure — when stakes are high and things feel messy — you
    become the engine. You push for decisions, you create momentum,
    you make things happen. That Catalyst energy has served you well.

    But when I asked about what feels most sustainable and energizing,
    a different picture emerged. You lit up talking about mentoring
    Sarah, about building trust, about creating space for your team
    to grow. That's Steward energy — and it sounds like that's where
    you feel most like yourself.

    The gap between those two — being the engine under pressure while
    your heart is in connection — might explain some of that heaviness
    you mentioned.

    Your full report will have more detail on this pattern and some
    specific moves that might help. But I wanted you to know: this
    pattern makes sense. You're not broken. There's a path to leading
    in a way that feels more like you.

CLIENT: That really resonates. I never thought about it that way.

AI: That's exactly what this assessment is for. Mark will have your
    full report and can help you figure out what to do with these
    insights. Thanks for being so open today.
```

---

*Document prepared by BMad Master for Innovaas FlowForge*
*Version: 2.0 (AI-Enhanced Hybrid Approach) | December 31, 2025*
