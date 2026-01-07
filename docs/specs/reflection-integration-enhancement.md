# Tech Spec: Reflection Integration Enhancement

> Created: 2026-01-07
> Status: Draft
> Type: Feature Redesign

## Problem Statement

Current reflection implementation is fundamentally flawed. The system merely appends raw Q&A conversation as a separate "Your Reflections" section at the end of the PDF. This provides no additional value beyond what the user already said.

**Current Flow (Wrong):**
```
Assessment Results → Reflection Conversation → Append transcript to PDF
```

**Desired Flow:**
```
Assessment Results → Reflection Conversation → Re-synthesize with insights → Enhanced Results + Regenerated PDF
```

## Solution Overview

When reflection is completed, the system will:

1. Take the user's reflection responses
2. Feed them to a new **Enhancement Agent** along with the original assessment results
3. Generate personalized, contextual insights that integrate the user's self-reflection
4. Store enhanced results in database
5. Regenerate PDF with enriched content woven throughout
6. Update results page to display enhanced insights

## Technical Design

### 1. New Enhancement Agent

**File:** `lib/agents/enhancement-agent.ts`

**Purpose:** Takes original archetype results + reflection conversation → produces enhanced, personalized assessment

**Input:**
```typescript
interface EnhancementInput {
  originalResults: ArchetypeResults
  reflectionMessages: ReflectionMessage[]
  participantName: string
  sessionContext: {
    defaultArchetype: Archetype
    authenticArchetype: Archetype
    hasTension: boolean
    scores: ArchetypeScores
  }
}
```

**Output:**
```typescript
interface EnhancedResults {
  // Personalized archetype narrative (replaces generic description)
  personalizedDefaultNarrative: string
  personalizedAuthenticNarrative: string

  // Enhanced tension pattern insights (if applicable)
  personalizedTensionInsights?: string

  // Key themes extracted from reflection
  reflectionThemes: string[]

  // Personalized "Moving Forward" guidance
  personalizedGuidance: string

  // Pull quotes from reflection for PDF callouts
  meaningfulQuotes: Array<{
    quote: string
    context: string
  }>
}
```

**AI Prompt Strategy:**
- Analyze reflection responses for patterns, specific situations, emotional themes
- Map user's language back to archetype framework
- Generate insights that feel personally relevant, not generic
- Extract 2-3 meaningful quotes that illustrate key points
- Craft personalized guidance based on what user revealed

### 2. Database Changes

**Table:** `coaching_sessions`

**New Column:**
```sql
ALTER TABLE coaching_sessions
ADD COLUMN enhanced_results JSONB DEFAULT NULL;
```

**Structure:**
```typescript
{
  enhanced_at: string // ISO timestamp
  personalizedDefaultNarrative: string
  personalizedAuthenticNarrative: string
  personalizedTensionInsights?: string
  reflectionThemes: string[]
  personalizedGuidance: string
  meaningfulQuotes: Array<{ quote: string; context: string }>
}
```

### 3. Enhancement Trigger Flow

**When:** Reflection status changes to `completed`

**Location:** `app/api/coach/[slug]/results/[token]/reflect/route.ts`

**Flow:**
```typescript
// After final reflection message processed
if (newState.phase === 'completed') {
  // 1. Mark reflection complete
  await updateReflectionStatus(sessionId, 'completed', messages)

  // 2. Trigger enhancement (async but awaited)
  const enhanced = await enhanceWithReflection({
    sessionId,
    originalResults,
    reflectionMessages: messages
  })

  // 3. Store enhanced results
  await storeEnhancedResults(sessionId, enhanced)

  // 4. Return response indicating enhancement complete
  return {
    success: true,
    isComplete: true,
    enhanced: true
  }
}
```

### 4. PDF Generation Updates

**File:** `lib/pdf/archetype-results-pdf.tsx`

**Changes:**

1. **Check for enhanced results** - If `enhanced_results` exists, use personalized content

2. **Replace generic narratives:**
   - Default archetype description → `personalizedDefaultNarrative`
   - Authentic archetype description → `personalizedAuthenticNarrative`
   - Tension pattern explanation → `personalizedTensionInsights`

3. **Add meaningful quote callouts:**
   - Style as pull quotes with teal accent
   - Place strategically near relevant archetype sections

4. **Replace "Moving Forward" section:**
   - Generic guidance → `personalizedGuidance`

5. **Remove raw Q&A section:**
   - No longer append conversation transcript
   - The insights ARE the reflection, woven throughout

**New PDF Structure:**
```
Page 1: Primary Archetype (with personalized narrative + quote callout)
Page 2: Tension Pattern + Authentic Archetype (personalized, if tension exists)
Page 3: Moving Forward (personalized guidance based on reflection)
```

### 5. Results Page Updates

**File:** `app/coach/[slug]/results/[token]/page.tsx`

**Changes:**

1. **Fetch enhanced results** if available
2. **Display personalized narratives** instead of generic descriptions
3. **Show reflection themes** as tags/badges
4. **Display quote callouts** in UI
5. **Update "Reflection Complete" state** to indicate results are enhanced

**UI Flow:**
- Before reflection: Show standard results with "Want to go deeper?" prompt
- After reflection: Show enhanced results with indicator "Personalized based on your reflection"

### 6. API Changes

**Endpoint:** `GET /api/coach/[slug]/results/[token]`

**Response Addition:**
```typescript
{
  // existing fields...
  enhancedResults?: EnhancedResults
  isEnhanced: boolean
}
```

**Endpoint:** `GET /api/coach/[slug]/results/[token]/download-pdf`

**Change:** Use `enhanced_results` when generating PDF if available

## Migration Path

### For Existing Completed Reflections

Sessions with `reflection_status = 'completed'` but no `enhanced_results`:
- Option A: Leave as-is (legacy format)
- Option B: Batch process to generate enhancements (recommended)

### Database Migration

```sql
-- Migration: add_enhanced_results_column
ALTER TABLE coaching_sessions
ADD COLUMN enhanced_results JSONB DEFAULT NULL;

-- Index for querying enhanced sessions
CREATE INDEX idx_coaching_sessions_enhanced
ON coaching_sessions ((enhanced_results IS NOT NULL));
```

## Tasks

### 1. Create Enhancement Agent
- [ ] 1.1 Create `lib/agents/enhancement-agent.ts`
- [ ] 1.2 Define input/output interfaces
- [ ] 1.3 Write AI prompt for enhancement synthesis
- [ ] 1.4 Add `processEnhancement()` function
- [ ] 1.5 Test with sample reflection data

### 2. Database Updates
- [ ] 2.1 Create migration for `enhanced_results` column
- [ ] 2.2 Apply migration to Supabase
- [ ] 2.3 Update TypeScript types

### 3. Integration with Reflection Flow
- [ ] 3.1 Modify reflection API to trigger enhancement on completion
- [ ] 3.2 Store enhanced results after processing
- [ ] 3.3 Handle enhancement errors gracefully

### 4. Update PDF Generation
- [ ] 4.1 Modify PDF data fetching to include enhanced results
- [ ] 4.2 Create conditional rendering for personalized vs generic content
- [ ] 4.3 Add quote callout component
- [ ] 4.4 Remove raw Q&A section
- [ ] 4.5 Test PDF output with enhanced content

### 5. Update Results Page
- [ ] 5.1 Fetch and display enhanced results
- [ ] 5.2 Add "Personalized" indicator
- [ ] 5.3 Display reflection themes
- [ ] 5.4 Show quote highlights
- [ ] 5.5 Update ReflectionChoice component for enhanced state

### 6. Testing & Validation
- [ ] 6.1 End-to-end test: complete reflection → verify enhancement
- [ ] 6.2 Test PDF generation with enhanced content
- [ ] 6.3 Test fallback to generic content when no enhancement
- [ ] 6.4 Verify existing sessions still work

## Out of Scope

- Batch enhancement of historical sessions (future consideration)
- Multiple enhancement passes (one reflection = one enhancement)
- User editing of enhanced results
- A/B testing enhanced vs non-enhanced

## Success Criteria

1. User completes reflection → results automatically enhanced
2. PDF contains personalized narratives, not conversation transcript
3. Results page shows enhanced insights
4. Enhancement feels genuinely personalized, not template-filled
5. System gracefully handles enhancement failures (falls back to generic)
