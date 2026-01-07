# Tests Specification

This is the tests coverage details for the spec detailed in @.agent-os/specs/2026-01-07-custom-assessment-framework/spec.md

> Created: 2026-01-07
> Version: 1.0.0

## Test Categories

### 1. Assessment Parser Tests

**File:** `__tests__/lib/services/assessment-parser.test.ts`

#### Unit Tests

**Valid Markdown Parsing**
- Parse valid assessment markdown with all required fields
- Parse assessment with optional fields omitted
- Parse multi-dimensional assessment type
- Parse single-outcome assessment type
- Parse comparative assessment type
- Extract YAML frontmatter correctly
- Parse dimensions with weights, descriptions, and rubrics
- Parse result categories with score ranges
- Parse interview guidelines sections

**Invalid Markdown Handling**
- Return error for missing YAML frontmatter
- Return error for missing required metadata fields
- Return error for missing dimensions section
- Return error for dimension without weight
- Return error for dimension weights not summing to 1.0
- Return error for result category without score range
- Return error for malformed YAML
- Return error for empty markdown

**Validation**
- Validate dimension weights sum to 1.0 (with 0.01 tolerance)
- Validate score ranges don't overlap
- Validate result category references valid dimensions
- Validate interview style is 1-5
- Warn on missing optional sections

**Slug Generation**
- Generate slug from assessment name
- Handle special characters in name
- Handle unicode characters
- Generate unique slug when duplicate exists

---

### 2. Assessment API Tests

**File:** `__tests__/app/api/assessments/route.test.ts`

#### Integration Tests

**GET /api/assessments**
- Return empty array for tenant with no assessments
- Return all assessments for authenticated tenant
- Filter by status parameter
- Paginate with limit and offset
- Exclude assessments from other tenants
- Return 401 for unauthenticated request

**POST /api/assessments**
- Create assessment from valid markdown
- Generate slug from name
- Set default values for optional fields
- Return parsed definition in response
- Return 400 for invalid markdown
- Return 401 for unauthenticated request
- Return 422 for validation errors

**GET /api/assessments/:id**
- Return assessment with full definition
- Return 404 for non-existent ID
- Return 403 for assessment owned by different tenant
- Include source markdown in response

**PUT /api/assessments/:id**
- Update assessment name and description
- Update definition from new markdown
- Increment version on update
- Return 400 for invalid markdown
- Return 403 for assessment owned by different tenant

**DELETE /api/assessments/:id**
- Delete assessment with no results
- Return 400 when assessment has results
- Return 404 for non-existent ID

**PATCH /api/assessments/:id/status**
- Change status from draft to active
- Set publishedAt when first activated
- Change status to archived
- Return 400 for invalid status transition

---

### 3. Assessment Parser Endpoint Tests

**File:** `__tests__/app/api/assessments/parse/route.test.ts`

**POST /api/assessments/parse**
- Return valid: true for correct markdown
- Return parsed definition
- Return valid: false with errors for invalid markdown
- Return warnings for non-critical issues
- Include line numbers in error messages
- Return 401 for unauthenticated request

---

### 4. Campaign Integration Tests

**File:** `__tests__/app/api/campaigns/custom-assessment.test.ts`

**POST /api/campaigns (custom assessment)**
- Create campaign with custom assessment
- Validate customAssessmentId exists
- Validate assessment is active
- Validate assessment belongs to tenant
- Store interviewStyleOverride if allowed
- Return 400 if assessment doesn't allow override
- Return 400 for inactive assessment

**Campaign-Assessment Relationship**
- Campaign references correct assessment
- Campaign stores assessment version at creation
- Deleting assessment sets reference to null

---

### 5. Coaching Session Integration Tests

**File:** `__tests__/app/api/coach/custom-assessment.test.ts`

**POST /api/coach/:slug/sessions (custom assessment)**
- Create coaching session with custom assessment
- Validate assessment belongs to tenant
- Store interview style override
- Return 400 for assessment type mismatch

---

### 6. Interview Agent Tests

**File:** `__tests__/lib/agents/interview-agent-custom.test.ts`

#### Unit Tests

**Context Loading**
- Load custom assessment definition for session
- Return null for non-custom sessions
- Cache loaded definition

**System Prompt Generation**
- Include assessment description in prompt
- Include all dimensions in prompt
- Include interview style guidance
- Include current dimension focus
- Include scoring rubric for current dimension
- Include probing questions for current dimension

**Dimension Tracking**
- Track covered dimensions during interview
- Determine next dimension to explore
- Signal completion when all dimensions covered

#### Integration Tests

**Interview Flow**
- Complete interview covering all dimensions
- Generate dimension scores from transcript
- Adapt style based on interview style setting
- Handle structured style (1-2)
- Handle conversational style (4-5)

---

### 7. Results Generation Tests

**File:** `__tests__/lib/services/custom-results-generator.test.ts`

#### Unit Tests

**Score Calculation**
- Calculate dimension scores from transcript
- Calculate overall score with weights
- Handle missing dimension coverage

**Category Matching**
- Match result category by overall score
- Select category with matching primary dimensions
- Handle overlapping score ranges
- Handle no matching category

**Insights Generation**
- Generate insights based on scores
- Include dimension-specific recommendations
- Reference matched category strengths/growth areas

#### Integration Tests

**End-to-End Results**
- Generate complete results from transcript
- Store results with assessment snapshot
- Generate results URL with tenant branding

---

### 8. Results Display Tests

**File:** `__tests__/components/results/custom-assessment-results.test.tsx`

#### Component Tests

**Dynamic Rendering**
- Render multi-dimensional layout
- Render single-outcome layout
- Render comparative layout
- Display all dimension scores
- Display radar chart for multi-dimensional
- Display matched category info
- Display strengths and growth areas
- Display recommendations
- Apply tenant branding

**Edge Cases**
- Handle assessment with many dimensions (20)
- Handle long dimension names
- Handle empty insights array
- Handle missing optional fields

---

### 9. Assessment Library UI Tests

**File:** `__tests__/app/dashboard/settings/assessments/page.test.tsx`

#### Component Tests

**Assessment List**
- Display all tenant assessments
- Show assessment status badges
- Show dimension count
- Sort by updated date
- Filter by status
- Show empty state for no assessments

**Assessment Card**
- Display assessment name and description
- Show status indicator
- Enable edit for draft assessments
- Enable preview for any assessment
- Enable delete for assessments without results
- Confirm before delete

**Create Assessment Modal**
- Display upload tab
- Display builder tab (placeholder)
- Accept markdown file upload
- Show parsing errors inline
- Preview parsed definition
- Enable save when valid

---

### 10. Assessment Preview Tests

**File:** `__tests__/app/preview/assessment/[id]/page.test.tsx`

#### Integration Tests

**Preview Mode**
- Load assessment definition
- Display interview style selector
- Start preview interview
- Complete preview without saving results
- Show sample results at end

---

### 11. Database Migration Tests

**File:** `__tests__/migrations/custom-assessments.test.ts`

**Schema Tests**
- custom_assessments table exists with all columns
- custom_assessment_results table exists with all columns
- campaigns.custom_assessment_id foreign key works
- coaching_sessions.custom_assessment_id foreign key works
- Unique constraint on (tenant_id, slug) enforced

**RLS Policy Tests**
- Tenant can only see own assessments
- Tenant cannot see other tenant's assessments
- Published marketplace assessments visible to all
- System templates visible to all
- Service role can manage results

---

## Mocking Requirements

### External Services

**Anthropic Claude API**
- Mock AI responses for interview agent tests
- Mock synthesis responses for results generation
- Provide deterministic responses for testing

### Supabase

**Database Operations**
- Use test database or mock Supabase client
- Seed test data for assessment tests
- Clean up after each test

### File System

**Markdown Upload**
- Mock file upload for browser tests
- Provide sample markdown files in fixtures

---

## Test Data Fixtures

### Sample Assessment Markdown

```markdown
# __tests__/fixtures/sample-assessment.md

---
name: "Test Leadership Assessment"
version: "1.0"
type: "multi-dimensional"
author: "Test Author"
description: "Test assessment for unit tests"
interview_style:
  default: 3
  allow_override: true
result_disclosure: "full"
---

## Dimensions

### Strategic Thinking
- **weight**: 0.5
- **description**: Test dimension 1
- **interview_themes**:
  - Theme 1
  - Theme 2
- **scoring_rubric**:
  - 1-2: Low
  - 3-4: Medium
  - 5: High

### Emotional Intelligence
- **weight**: 0.5
- **description**: Test dimension 2
- **interview_themes**:
  - Theme 1
- **scoring_rubric**:
  - 1-2: Low
  - 3-4: Medium
  - 5: High

## Result Categories

### High Performer
- **score_range**: [4.0, 5.0]
- **primary_dimensions**: ["Strategic Thinking"]
- **description**: High performing leader
- **strengths**:
  - Strength 1
- **growth_areas**:
  - Growth area 1
- **recommendations**:
  - Recommendation 1

### Developing
- **score_range**: [1.0, 3.9]
- **primary_dimensions**: []
- **description**: Developing leader
- **strengths**:
  - Strength 1
- **growth_areas**:
  - Growth area 1
- **recommendations**:
  - Recommendation 1

## Interview Guidelines

### Opening
"Welcome to this assessment."

### Closing
"Thank you for participating."
```

---

## Coverage Targets

| Category | Target |
|----------|--------|
| Assessment Parser | 95% |
| API Endpoints | 90% |
| Interview Agent | 85% |
| Results Generator | 90% |
| UI Components | 80% |
| Database/Migrations | 100% |

---

## Test Environment

- **Test Framework:** Jest / Vitest
- **Component Testing:** React Testing Library
- **API Testing:** Supertest or native fetch mocks
- **Database:** Test Supabase project or mocked client
- **E2E Testing:** Playwright (Phase 2)
