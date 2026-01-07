# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2026-01-07-custom-assessment-framework/spec.md

> Created: 2026-01-07
> Version: 1.0.0

## New Endpoints

### Assessment Management

#### GET /api/assessments

List all custom assessments for the authenticated tenant.

**Authentication:** Required (Bearer token)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter by status: draft, active, archived |
| limit | number | No | Max results (default: 50) |
| offset | number | No | Pagination offset |

**Response (200):**
```json
{
  "assessments": [
    {
      "id": "uuid",
      "name": "Leadership Effectiveness Assessment",
      "slug": "leadership-effectiveness",
      "version": "1.0",
      "status": "active",
      "assessmentType": "multi-dimensional",
      "dimensionCount": 5,
      "createdAt": "2026-01-07T10:00:00Z",
      "updatedAt": "2026-01-07T10:00:00Z"
    }
  ],
  "total": 10,
  "limit": 50,
  "offset": 0
}
```

---

#### POST /api/assessments

Create a new custom assessment.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "name": "Leadership Effectiveness Assessment",
  "description": "A comprehensive assessment of leadership effectiveness",
  "sourceType": "upload",
  "sourceMarkdown": "---\nname: Leadership Effectiveness...\n---\n## Dimensions\n...",
  "assessmentType": "multi-dimensional",
  "interviewStyleDefault": 3,
  "interviewStyleAllowOverride": true,
  "resultDisclosure": "full"
}
```

**Response (201):**
```json
{
  "success": true,
  "assessment": {
    "id": "uuid",
    "name": "Leadership Effectiveness Assessment",
    "slug": "leadership-effectiveness",
    "version": "1.0",
    "status": "draft",
    "definition": { ... },
    "createdAt": "2026-01-07T10:00:00Z"
  }
}
```

**Errors:**
| Code | Description |
|------|-------------|
| 400 | Invalid markdown format or missing required fields |
| 401 | Unauthorized |
| 422 | Validation error (weights don't sum to 1, etc.) |

---

#### GET /api/assessments/:id

Get a specific assessment by ID.

**Authentication:** Required (Bearer token)

**Response (200):**
```json
{
  "assessment": {
    "id": "uuid",
    "tenantId": "uuid",
    "name": "Leadership Effectiveness Assessment",
    "slug": "leadership-effectiveness",
    "version": "1.0",
    "description": "...",
    "definition": {
      "metadata": { ... },
      "dimensions": [ ... ],
      "resultCategories": [ ... ],
      "interviewGuidelines": { ... }
    },
    "sourceMarkdown": "...",
    "sourceType": "upload",
    "assessmentType": "multi-dimensional",
    "interviewStyleDefault": 3,
    "interviewStyleAllowOverride": true,
    "resultDisclosure": "full",
    "status": "active",
    "createdAt": "2026-01-07T10:00:00Z",
    "updatedAt": "2026-01-07T10:00:00Z"
  }
}
```

---

#### PUT /api/assessments/:id

Update an existing assessment.

**Authentication:** Required (Bearer token)

**Request Body:** Same as POST, all fields optional

**Response (200):**
```json
{
  "success": true,
  "assessment": { ... }
}
```

**Notes:**
- Updating an active assessment increments the version
- Cannot update archived assessments

---

#### DELETE /api/assessments/:id

Delete an assessment.

**Authentication:** Required (Bearer token)

**Response (200):**
```json
{
  "success": true,
  "message": "Assessment deleted successfully"
}
```

**Errors:**
| Code | Description |
|------|-------------|
| 400 | Cannot delete assessment with existing results |
| 404 | Assessment not found |

---

#### PATCH /api/assessments/:id/status

Change assessment status.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "status": "active"  // draft, active, archived
}
```

**Response (200):**
```json
{
  "success": true,
  "assessment": {
    "id": "uuid",
    "status": "active",
    "publishedAt": "2026-01-07T10:00:00Z"
  }
}
```

---

### Assessment Parsing

#### POST /api/assessments/parse

Parse and validate markdown without saving.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "markdown": "---\nname: Test Assessment\n---\n## Dimensions\n..."
}
```

**Response (200):**
```json
{
  "valid": true,
  "definition": {
    "metadata": { ... },
    "dimensions": [ ... ],
    "resultCategories": [ ... ]
  },
  "warnings": [
    "Dimension weights sum to 0.98, expected 1.0"
  ]
}
```

**Response (400 - Invalid):**
```json
{
  "valid": false,
  "errors": [
    {
      "line": 15,
      "message": "Missing required field: weight",
      "section": "Dimensions.Strategic Thinking"
    }
  ]
}
```

---

### Assessment Preview

#### POST /api/assessments/:id/preview

Generate a preview interview session.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "interviewStyle": 4  // Optional override
}
```

**Response (200):**
```json
{
  "previewSessionId": "uuid",
  "previewUrl": "/preview/assessment/uuid",
  "expiresAt": "2026-01-07T11:00:00Z"
}
```

---

### Assessment Results

#### GET /api/assessments/:id/results

Get all results for an assessment.

**Authentication:** Required (Bearer token)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| sessionType | string | No | Filter by: campaign, coaching |
| dateFrom | string | No | ISO date |
| dateTo | string | No | ISO date |

**Response (200):**
```json
{
  "results": [
    {
      "id": "uuid",
      "sessionId": "uuid",
      "sessionType": "coaching",
      "participantName": "John Doe",
      "dimensionScores": {
        "Strategic Thinking": 4.2,
        "Emotional Intelligence": 3.8
      },
      "overallScore": 4.0,
      "matchedCategory": "The Visionary Leader",
      "completedAt": "2026-01-07T10:00:00Z"
    }
  ],
  "total": 25
}
```

---

## Modified Endpoints

### Campaign Creation

#### POST /api/campaigns

**Changes:** Add support for custom assessment selection.

**New Request Fields:**
```json
{
  "assessmentType": "custom",
  "customAssessmentId": "uuid",
  "interviewStyleOverride": 4
}
```

**Validation:**
- If `assessmentType` is "custom", `customAssessmentId` is required
- `customAssessmentId` must reference an active assessment owned by the tenant
- `interviewStyleOverride` only valid if assessment allows override

---

### Coaching Session Creation

#### POST /api/coach/:slug/sessions

**Changes:** Add support for custom assessment selection.

**New Request Fields:**
```json
{
  "assessmentType": "custom",
  "customAssessmentId": "uuid",
  "interviewStyleOverride": 3
}
```

---

### Interview Agent Context

#### Internal: loadInterviewContext()

**Changes:** Load custom assessment definition for interview.

**New Context Shape:**
```typescript
interface InterviewContext {
  // Existing fields...

  // New custom assessment fields
  customAssessment?: {
    id: string
    definition: AssessmentDefinition
    interviewStyle: number
    currentDimension: string
    dimensionsCovered: string[]
  }
}
```

---

### Results Generation

#### POST /api/sessions/:token/complete

**Changes:** Generate custom assessment results.

**New Response Shape (when custom assessment):**
```json
{
  "success": true,
  "results": {
    "type": "custom",
    "assessmentId": "uuid",
    "assessmentName": "Leadership Effectiveness Assessment",
    "dimensionScores": { ... },
    "overallScore": 4.2,
    "matchedCategory": {
      "name": "The Visionary Leader",
      "description": "...",
      "strengths": [ ... ],
      "growthAreas": [ ... ],
      "recommendations": [ ... ]
    },
    "insights": [ ... ]
  },
  "resultsUrl": "/coach/tenant-slug/results/session-id"
}
```

---

## Internal Services

### AssessmentParser

Service for parsing markdown assessment definitions.

```typescript
// lib/services/assessment-parser.ts

interface ParseResult {
  valid: boolean
  definition?: AssessmentDefinition
  errors?: ParseError[]
  warnings?: string[]
}

export async function parseAssessmentMarkdown(
  markdown: string
): Promise<ParseResult>

export function validateDefinition(
  definition: AssessmentDefinition
): ValidationResult

export function generateSlug(name: string): string
```

---

### AssessmentContextLoader

Service for loading assessment context into interview agent.

```typescript
// lib/services/assessment-context-loader.ts

export async function loadAssessmentContext(
  sessionId: string,
  sessionType: 'campaign' | 'coaching'
): Promise<CustomAssessmentContext | null>

export function buildAssessmentSystemPrompt(
  context: CustomAssessmentContext
): string

export function getNextDimension(
  context: CustomAssessmentContext,
  transcript: Message[]
): string
```

---

### CustomResultsGenerator

Service for generating results from custom assessments.

```typescript
// lib/services/custom-results-generator.ts

export async function generateCustomResults(
  assessmentId: string,
  transcript: Message[],
  definition: AssessmentDefinition
): Promise<CustomAssessmentResults>

export function matchResultCategory(
  scores: Record<string, number>,
  categories: ResultCategory[]
): ResultCategory
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| ASSESSMENT_NOT_FOUND | 404 | Assessment ID does not exist |
| ASSESSMENT_NOT_ACTIVE | 400 | Cannot use inactive assessment |
| ASSESSMENT_PARSE_ERROR | 400 | Markdown parsing failed |
| ASSESSMENT_VALIDATION_ERROR | 422 | Definition validation failed |
| ASSESSMENT_HAS_RESULTS | 400 | Cannot delete assessment with results |
| ASSESSMENT_ACCESS_DENIED | 403 | Tenant does not own this assessment |
| INTERVIEW_STYLE_OVERRIDE_DENIED | 400 | Assessment does not allow style override |

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /api/assessments | 10 | per hour |
| POST /api/assessments/parse | 30 | per hour |
| POST /api/assessments/:id/preview | 20 | per hour |
| GET endpoints | 100 | per minute |

---

## Webhook Events (Future)

For marketplace integration (Phase 2):

```typescript
// Assessment published
{
  "event": "assessment.published",
  "assessmentId": "uuid",
  "tenantId": "uuid",
  "timestamp": "2026-01-07T10:00:00Z"
}

// Assessment licensed
{
  "event": "assessment.licensed",
  "assessmentId": "uuid",
  "licenseeId": "uuid",
  "timestamp": "2026-01-07T10:00:00Z"
}
```
