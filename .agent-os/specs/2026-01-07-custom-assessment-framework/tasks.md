# Spec Tasks

These are the tasks to be completed for the spec detailed in @.agent-os/specs/2026-01-07-custom-assessment-framework/spec.md

> Created: 2026-01-07
> Status: Ready for Implementation

## Tasks

- [ ] 1. **Database Schema & Migration**
  - [ ] 1.1 Write migration tests for new tables and columns
  - [ ] 1.2 Create migration file with custom_assessments table
  - [ ] 1.3 Create migration file with custom_assessment_results table
  - [ ] 1.4 Add ALTER TABLE statements for campaigns, coaching_sessions, agent_sessions
  - [ ] 1.5 Create indexes for performance
  - [ ] 1.6 Implement RLS policies for tenant isolation
  - [ ] 1.7 Apply migration to development/staging
  - [ ] 1.8 Verify all tests pass

- [ ] 2. **Assessment Parser Service**
  - [ ] 2.1 Write unit tests for assessment parser
  - [ ] 2.2 Install gray-matter dependency for YAML frontmatter parsing
  - [ ] 2.3 Create `lib/services/assessment-parser.ts`
  - [ ] 2.4 Implement markdown parsing with YAML extraction
  - [ ] 2.5 Implement dimension parsing with weights and rubrics
  - [ ] 2.6 Implement result category parsing
  - [ ] 2.7 Implement interview guidelines parsing
  - [ ] 2.8 Implement validation (weights sum, score ranges, required fields)
  - [ ] 2.9 Implement slug generation
  - [ ] 2.10 Verify all tests pass

- [ ] 3. **Assessment API Endpoints**
  - [ ] 3.1 Write integration tests for assessment endpoints
  - [ ] 3.2 Create `app/api/assessments/route.ts` (GET, POST)
  - [ ] 3.3 Create `app/api/assessments/[id]/route.ts` (GET, PUT, DELETE)
  - [ ] 3.4 Create `app/api/assessments/[id]/status/route.ts` (PATCH)
  - [ ] 3.5 Create `app/api/assessments/parse/route.ts` (POST)
  - [ ] 3.6 Add TypeScript types for assessment API
  - [ ] 3.7 Implement tenant authorization checks
  - [ ] 3.8 Verify all tests pass

- [ ] 4. **Assessment Library UI**
  - [ ] 4.1 Write component tests for assessment library
  - [ ] 4.2 Create `app/dashboard/settings/assessments/page.tsx`
  - [ ] 4.3 Create `components/assessments/AssessmentList.tsx`
  - [ ] 4.4 Create `components/assessments/AssessmentCard.tsx`
  - [ ] 4.5 Create `components/assessments/CreateAssessmentModal.tsx`
  - [ ] 4.6 Implement markdown file upload with drag-and-drop
  - [ ] 4.7 Implement real-time parsing validation
  - [ ] 4.8 Implement assessment preview within modal
  - [ ] 4.9 Add status toggle (draft/active/archived)
  - [ ] 4.10 Add delete confirmation dialog
  - [ ] 4.11 Verify all tests pass

- [ ] 5. **Campaign & Coaching Integration**
  - [ ] 5.1 Write integration tests for custom assessment selection
  - [ ] 5.2 Update campaign creation form with custom assessment dropdown
  - [ ] 5.3 Update `app/api/campaigns/route.ts` for custom assessment support
  - [ ] 5.4 Update coaching session creation for custom assessment support
  - [ ] 5.5 Add interview style override slider when assessment allows
  - [ ] 5.6 Validate assessment ownership and status on creation
  - [ ] 5.7 Verify all tests pass

- [ ] 6. **Interview Agent Adaptation**
  - [ ] 6.1 Write unit tests for custom assessment context loading
  - [ ] 6.2 Create `lib/services/assessment-context-loader.ts`
  - [ ] 6.3 Update `lib/agents/interview-agent.ts` to load custom context
  - [ ] 6.4 Implement dynamic system prompt builder for custom assessments
  - [ ] 6.5 Implement dimension tracking during interview
  - [ ] 6.6 Implement interview style adaptation (1-5 scale)
  - [ ] 6.7 Add dimension transition logic
  - [ ] 6.8 Verify all tests pass

- [ ] 7. **Custom Results Generator**
  - [ ] 7.1 Write unit tests for results generation
  - [ ] 7.2 Create `lib/services/custom-results-generator.ts`
  - [ ] 7.3 Implement dimension score extraction from transcript
  - [ ] 7.4 Implement weighted overall score calculation
  - [ ] 7.5 Implement result category matching
  - [ ] 7.6 Implement AI insights generation with custom context
  - [ ] 7.7 Store results with assessment definition snapshot
  - [ ] 7.8 Verify all tests pass

- [ ] 8. **Dynamic Results Renderer**
  - [ ] 8.1 Write component tests for results display
  - [ ] 8.2 Create `components/results/CustomAssessmentResults.tsx`
  - [ ] 8.3 Create `components/results/MultiDimensionalLayout.tsx` with radar chart
  - [ ] 8.4 Create `components/results/SingleOutcomeLayout.tsx`
  - [ ] 8.5 Create `components/results/DimensionScoreCard.tsx`
  - [ ] 8.6 Create `components/results/CategoryMatchCard.tsx`
  - [ ] 8.7 Apply tenant branding to results display
  - [ ] 8.8 Create results route for custom assessments
  - [ ] 8.9 Verify all tests pass

- [ ] 9. **Assessment Preview Mode**
  - [ ] 9.1 Write tests for preview functionality
  - [ ] 9.2 Create `app/api/assessments/[id]/preview/route.ts`
  - [ ] 9.3 Create `app/preview/assessment/[id]/page.tsx`
  - [ ] 9.4 Implement preview interview session (no data persistence)
  - [ ] 9.5 Add interview style selector for preview
  - [ ] 9.6 Display sample results at end of preview
  - [ ] 9.7 Verify all tests pass

- [ ] 10. **End-to-End Testing & Polish**
  - [ ] 10.1 Manual end-to-end test: upload assessment markdown
  - [ ] 10.2 Manual end-to-end test: create campaign with custom assessment
  - [ ] 10.3 Manual end-to-end test: complete interview with custom assessment
  - [ ] 10.4 Manual end-to-end test: view custom results
  - [ ] 10.5 Fix any bugs discovered during testing
  - [ ] 10.6 Add loading states and error handling
  - [ ] 10.7 Verify all automated tests pass
  - [ ] 10.8 Update documentation with custom assessment usage

---

## Task Dependencies

```
Task 1 (Database) → Task 2 (Parser) → Task 3 (API)
                                    ↘
Task 4 (UI) depends on Task 3        Task 5 (Campaign Integration)
                                    ↘
Task 6 (Interview Agent) depends on Task 2, Task 5
                                    ↓
Task 7 (Results Generator) depends on Task 6
                                    ↓
Task 8 (Results Display) depends on Task 7
                                    ↓
Task 9 (Preview) depends on Task 4, Task 6
                                    ↓
Task 10 (E2E Testing) depends on all above
```

---

## Effort Estimates

| Task | Effort | Notes |
|------|--------|-------|
| 1. Database Schema | M | Straightforward migration |
| 2. Assessment Parser | L | Complex parsing logic |
| 3. Assessment API | M | Standard CRUD with validation |
| 4. Assessment Library UI | L | Multiple components, file upload |
| 5. Campaign Integration | S | Extend existing forms |
| 6. Interview Agent | L | AI prompt engineering |
| 7. Results Generator | M | AI synthesis adaptation |
| 8. Results Display | M | Dynamic layouts |
| 9. Preview Mode | S | Reuse existing components |
| 10. E2E Testing | M | Integration testing |

**Effort Scale:**
- XS: < 1 day
- S: 1-2 days
- M: 3-5 days
- L: 1-2 weeks
- XL: 2+ weeks

**Total Estimated Effort:** 4-6 weeks

---

## Risk Areas

1. **Assessment Parser Complexity**
   - Markdown format flexibility vs. strict validation
   - Mitigation: Start with strict format, loosen based on feedback

2. **Interview Agent Adaptation**
   - AI may not follow custom rubrics consistently
   - Mitigation: Extensive prompt engineering and testing

3. **Results Category Matching**
   - Edge cases with overlapping score ranges
   - Mitigation: Clear validation rules and user warnings

4. **Performance with Large Assessments**
   - 20 dimensions may slow interview context
   - Mitigation: Implement caching, limit dimensions
