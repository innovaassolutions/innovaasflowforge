# Spec Requirements Document

> Spec: Custom Assessment Framework
> Created: 2026-01-07
> Status: Planning

## Overview

Enable coaches, consultants, and institutions to create and upload proprietary assessment methodologies that the AI uses to conduct personalized interviews and generate custom results. This feature transforms FlowForge from a fixed-assessment platform into a flexible assessment engine that can adapt to any methodology, with future marketplace potential for sharing and selling assessment frameworks.

## User Stories

### Story 1: Assessment Creator

As a leadership coach with my own proprietary assessment methodology, I want to upload a markdown file defining my assessment framework, so that my clients receive interviews and results based on my unique approach rather than generic archetypes.

**Workflow:**
1. Coach navigates to Dashboard > Settings > Assessments
2. Clicks "Create Custom Assessment"
3. Uploads a markdown file or uses the guided builder
4. Configures interview style (guided vs adaptive slider)
5. Previews the assessment flow
6. Activates the assessment for use in campaigns

### Story 2: Assessment User

As a consultant running multiple client engagements, I want to select from my library of custom assessments when creating a campaign, so that each client receives the appropriate assessment type for their needs.

**Workflow:**
1. Consultant creates a new campaign
2. In Assessment Type dropdown, sees: Industry 4.0, Archetype, Education, and their custom assessments
3. Selects their proprietary "Digital Maturity Model" assessment
4. Participants receive interviews tailored to that framework
5. Results page displays findings in the custom framework's structure

### Story 3: Future Marketplace Participant

As an assessment creator, I want to optionally publish my assessment to a marketplace, so that other practitioners can license and use my methodology (generating revenue for me).

**Workflow:**
1. Creator marks assessment as "Available for licensing"
2. Sets pricing tier (free, subscription, one-time)
3. Assessment appears in marketplace catalog
4. Other tenants can browse, preview, and license assessments
5. Creator receives usage-based royalties

## Spec Scope

1. **Assessment Definition Schema** - Structured markdown format for defining assessment frameworks including questions, dimensions, scoring rubrics, and result categories

2. **Assessment Builder UI** - Dashboard interface for uploading, editing, and previewing custom assessments

3. **Interview Adaptation Engine** - AI prompt system that reads custom assessment definitions and adapts interview style based on tenant's guided/adaptive preference

4. **Custom Results Renderer** - Dynamic results page that displays findings according to the assessment's defined structure and categories

5. **Assessment Library Management** - CRUD operations for tenants to manage their assessment collection

## Out of Scope

- Marketplace functionality (Phase 2 - separate spec)
- Assessment versioning and migration (Phase 2)
- Collaborative assessment editing (future)
- Assessment analytics and A/B testing (future)
- White-label PDF templates per assessment (Phase 2)
- Assessment certification/validation program (future)

## Expected Deliverable

1. A coach can upload a markdown file defining a 5-dimension leadership assessment with custom archetypes, and successfully run a client through an interview that uses those dimensions

2. Results page dynamically renders the custom assessment's categories, scores, and recommendations without hardcoded layouts

3. Assessment library shows all custom assessments with edit, preview, activate/deactivate, and delete options

4. Interview adaptation slider (1-5 scale from Structured to Conversational) visibly affects the AI's interview approach

## Spec Documentation

- **Tasks:** @.agent-os/specs/2026-01-07-custom-assessment-framework/tasks.md
- **Technical Specification:** @.agent-os/specs/2026-01-07-custom-assessment-framework/sub-specs/technical-spec.md
- **API Specification:** @.agent-os/specs/2026-01-07-custom-assessment-framework/sub-specs/api-spec.md
- **Database Schema:** @.agent-os/specs/2026-01-07-custom-assessment-framework/sub-specs/database-schema.md
- **Tests Specification:** @.agent-os/specs/2026-01-07-custom-assessment-framework/sub-specs/tests.md
