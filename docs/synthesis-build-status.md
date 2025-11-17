# Synthesis Engine Build Status

> **Workshop Tomorrow:** November 18, 2025
> **Current Time:** Late night (targeting 2-3 AM completion)
> **Status:** Just starting synthesis build (Option B)

## Current Task: Build Synthesis & Reporting Engine (Option B)

User selected Option B: Build complete synthesis and reporting engine tonight (4-6 hours) for end-to-end automation at tomorrow's workshop.

## Additional Requirement: SIRI Methodology

**User Request:**
> "Can you research the Smart Industry Readiness Index - SIRI out of Singapore and determine how they do their assessment scoring and apply a similar method to our system. Do not hard code mention of SIRI anywhere in our system."

**Critical Constraint:** Apply SIRI-like scoring methodology but DO NOT mention SIRI explicitly in code.

## What's Already Complete ✅

### Interview System - Fully Functional
1. **Multi-stakeholder interviews** - 6 role types with role-specific questioning
2. **Automatic completion** - Triggers at question 15 with agent farewell
3. **Stakeholder self-submit** - Button appears after 5+ questions with confirmation dialog
4. **Facilitator override** - Dashboard "Mark as Complete" button
5. **Pause/resume** - Token-based session persistence with conversation history restoration
6. **Real-time dashboard** - 10-second polling shows live status updates
7. **Role-specific prompts** - Detailed focus areas for all 6 stakeholder types

### Critical Bugs Fixed
1. Field name mismatches (`stakeholder_role` vs `role_type`) - FIXED
2. Completion threshold bug (was >15, now >=15) - FIXED
3. Database status updates on completion - FIXED
4. Conversation state persistence - WORKING

### API Endpoints Working
- `POST /api/sessions/[token]/messages` - Message exchange with completion detection
- `GET /api/sessions/[token]` - Session data with resume capability
- `POST /api/sessions/[token]/complete` - Stakeholder manual submit
- `POST /api/campaigns/[id]/sessions/[sessionId]/complete` - Facilitator override

## What Needs to be Built (Tonight)

### Todo List Status:
1. ⏳ **Research SIRI methodology** - IN PROGRESS (just started)
2. ⬜ Design readiness scoring framework based on SIRI
3. ⬜ Build synthesis agent (`/lib/agents/synthesis-agent.ts`)
4. ⬜ Create report generator with markdown templates
5. ⬜ Build API endpoint (`/api/campaigns/[id]/synthesize`)
6. ⬜ Add dashboard integration with Generate Report button
7. ⬜ Test end-to-end synthesis and reporting

### Build Plan Details

#### 1. SIRI Research (30-45 min)
- Understand Singapore's Smart Industry Readiness Index framework
- Document dimensional scoring approach
- Identify assessment criteria and rubrics
- Adapt methodology for our 6-role stakeholder model
- **Output:** Design document for scoring framework

#### 2. Synthesis Agent (2-3 hours)
**File:** `/lib/agents/synthesis-agent.ts`

**Capabilities Needed:**
- Read all completed session transcripts from campaign
- Use Claude to identify common themes across stakeholders
- Extract key pain points, contradictions, strategic priorities
- Map insights to Industry 4.0 dimensions:
  - Technology Infrastructure
  - Data & Analytics
  - Operations & Processes
  - Strategy & Leadership
- Generate coherent cross-stakeholder narrative
- Calculate readiness scores (SIRI-inspired methodology)

#### 3. Report Generator (1-2 hours)
**Format:** Markdown (single-tier initially)

**Sections:**
1. **Executive Overview** - Campaign summary, completion stats
2. **Readiness Scores** - Dimensional scores with methodology (SIRI-inspired but not named)
3. **Key Findings** - Cross-stakeholder analysis, themes, patterns
4. **Stakeholder Perspectives** - Individual role summaries
5. **Recommendations** - Prioritized action items

**Future Enhancement:** Multi-tier reports (basic, detailed, architectural) based on client payment level

#### 4. API Endpoint (1 hour)
**Route:** `POST /api/campaigns/[id]/synthesize`

**Flow:**
1. Verify all stakeholders completed
2. Fetch all completed session transcripts from `agent_sessions`
3. Run synthesis agent with all transcripts
4. Generate report using template
5. Return report data (markdown + metadata)

#### 5. Dashboard Integration (1 hour)
**Location:** `/app/dashboard/campaigns/[id]/page.tsx`

**Features:**
- "Generate Analysis Report" button
- Only shows when all stakeholders completed
- Loading state while generating
- Download synthesized report as markdown
- Optional: PDF export capability

## Database Schema (Existing)

```sql
-- Already exists, contains all transcript data
agent_sessions:
  - id
  - stakeholder_session_id
  - conversation_history (jsonb) -- Full transcript
  - session_context (jsonb) -- Conversation state
  - created_at
  - last_message_at

stakeholder_sessions:
  - id
  - campaign_id
  - stakeholder_name
  - stakeholder_email
  - stakeholder_title
  - stakeholder_role (determines question focus)
  - status (invited | in_progress | completed)
  - access_token
  - completed_at
```

## Key Technical Patterns to Follow

1. **Claude API Usage:**
   - Model: `claude-sonnet-4-20250514`
   - Temperature: 0.7 for synthesis (creative but grounded)
   - Max tokens: 4000+ for comprehensive analysis

2. **Synthesis Strategy:**
   - Process each transcript individually first
   - Extract structured insights per stakeholder
   - Cross-reference for themes and contradictions
   - Map to dimensional framework
   - Generate unified narrative

3. **Scoring Methodology:**
   - Research SIRI's dimensional approach
   - Adapt for our context (6 roles vs their framework)
   - Calculate dimension scores based on conversation analysis
   - Generate overall readiness score
   - **Do not mention SIRI in any user-facing output**

## Next Immediate Steps

1. Research SIRI methodology via web search
2. Document scoring framework design
3. Start building synthesis-agent.ts
4. Test with existing campaign data (Malcom & George's completed interviews)

## Workshop Demo Requirements

**Must Have by Tomorrow:**
1. Working synthesis generation from completed interviews
2. Professional markdown report output
3. Dashboard button to trigger synthesis
4. Readiness scoring visible in report
5. Dimensional analysis shown

**Nice to Have:**
- PDF export
- Visual charts/graphs
- Email delivery of report

## Files to Create

```
/lib/agents/synthesis-agent.ts          (NEW - core synthesis logic)
/lib/report-generator.ts                (NEW - markdown template generation)
/app/api/campaigns/[id]/synthesize/route.ts  (NEW - API endpoint)
```

## Files to Modify

```
/app/dashboard/campaigns/[id]/page.tsx  (ADD - Generate Report button)
```

## Current Development Server

Background Bash process running: `npm run dev`
Status: Running (has new output to check)

---

**Resume Point:** About to research SIRI methodology, web search was attempted but interrupted by user to clear context window.
