# FlowForge

**Encode Your Expertise. Scale Your Impact.**

## Overview

FlowForge lets senior consultants, coaches, and educators encode their methodology, frameworks, and questioning approach into an AI-powered platform — then run it across multiple clients simultaneously. Your brain, multiplied. Your expertise, working at scale.

Instead of replacing experts with AI, FlowForge amplifies what makes them great. Encode your approach once, deploy it across every engagement, and focus your time on the high-value strategic work only you can deliver.

### Who It's For

- **Senior Consultants & Boutique Firms** — Encode your methodology and run it across multiple client engagements simultaneously. Your frameworks, your questioning instincts, your approach — at scale.
- **Coaches & Leadership Development** — Capture your coaching methodology in guided AI conversations that reveal patterns, archetypes, and growth opportunities — serving more clients without diluting depth.
- **Educators & Institutions** — Capture stakeholder perspectives across faculty, staff, parents, and administrators to drive institutional improvement.
- **Manufacturing & Operations** — Assess digital transformation readiness across complex organizations with multiple stakeholder groups.

### Live Use Cases

- **Leadership Archetype Discovery** (Coaching) — Built with [Leading With Meaning](https://leadingwithmeaning.com), helping leaders uncover their leadership archetypes through guided AI conversations
- **Digital Transformation Readiness** (Manufacturing) — Multi-stakeholder assessment of Industry 4.0 maturity
- **Institutional Assessment** (Education) — Cross-stakeholder analysis for schools and universities

### Platform Capabilities

FlowForge lets experts encode their approach and run it at scale:
- **Methodology encoding** — capture your frameworks, questioning strategies, and domain expertise
- **Parallel engagement execution** — run conversations across multiple clients simultaneously
- **Multi-stakeholder interview facilitation** — text and voice, adapting to each participant
- **Cross-perspective synthesis** — AI identifies patterns and contradictions across all conversations
- **Professional deliverables** — executive-ready reports, insights documents, and strategic recommendations

The platform supports both external consultants managing multiple clients and internal teams running their own assessments.

## Architecture

### Multi-Tenancy Model

FlowForge uses a **campaign-level multi-tenancy** architecture with multiple user types:

#### User Types

1. **Consultants**
   - Manage multiple client companies
   - Create unlimited company profiles
   - Run campaigns across different methodologies
   - Billed per campaign
   - Access all campaigns they create

2. **Coaches**
   - Manage coaching sessions with individual clients
   - Custom-branded tenant profiles with unique slugs
   - Run archetype discovery and leadership assessments
   - Token-based client access (no login required)

3. **Company Users**
   - Linked to one company profile (their organization)
   - Manage stakeholder profiles (employees)
   - Create campaigns for their divisions
   - Purchase campaign packages

### Data Model

```
Users (Facilitators)
└── User Type: Consultant | Coach | Company

Tenant Profiles (Coach/Consultant Branding)
├── Custom slug and branding
├── Enabled assessment types
└── Brand colors and configuration

Company Profiles
├── Managed by Consultants (many) OR
├── Owned by Company Users (one)
└── Contains: industry, market scope, company details

Stakeholder Profiles (Reusable)
├── Belong to Company Profiles
├── Can be assigned to multiple campaigns
└── Contains: name, email, role, title, department

Campaigns
├── Belong to Company Profile
├── Created by Facilitator (User)
├── Campaign Type: Methodology/Framework being used
└── Assessment type, status, metadata

Coaching Sessions
├── Belong to Tenant Profile
├── Individual client sessions
├── Token-based access
└── Conversation data and artifacts

Campaign Assignments
├── Links Stakeholder Profile → Campaign
├── Unique access_token per assignment
├── Tracks interview progress
└── Stores conversation data and artifacts
```

### Modular Agent Architecture

FlowForge uses a **methodology-specific agent system**:

```
Campaign → Methodology Selection → Specialized Agent

Examples:
- Consulting Discovery → Stakeholder Interview Agent
- Coaching Session → Archetype Discovery Agent
- Education Assessment → Institutional Review Agent
- Industry 4.0 Campaign → Digital Transformation Agent
- TOC Campaign → Theory of Constraints Agent
```

Each agent is purpose-built with:
- Domain-specific knowledge and frameworks
- Methodology-appropriate questioning strategies
- Specialized synthesis and analysis capabilities
- Custom reporting templates

### Key Features

- **Reusable Stakeholder Profiles**: Same stakeholder can participate in multiple campaigns without re-entering information
- **Company-Level Isolation**: Data properly isolated by company, not by user account
- **Flexible Access Control**: RLS policies support consultant, coach, and company user workflows
- **Token-Based Access**: Stakeholders and coaching clients access sessions via unique URLs (no login required)
- **Voice Interviews**: ElevenLabs integration for natural voice-based conversations
- **Methodology Flexibility**: Modular agent system supports diverse consulting frameworks

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: TailwindCSS with Pearl Vibrant theme
- **AI**: Anthropic Claude API (Sonnet 4.5)
- **Voice**: ElevenLabs Conversational AI
- **PDF Generation**: @react-pdf/renderer
- **Email**: Resend

## API Endpoints

### Authentication
All endpoints require Bearer token authentication via `Authorization` header.

### Company Profiles

**POST /api/company-profiles**
Create a new company profile.

```json
{
  "companyName": "Meridian Strategy Group",
  "industry": "Professional Services",
  "description": "Boutique strategy consulting firm",
  "website": "https://meridianstrategy.com",
  "marketScope": "national",
  "employeeCountRange": "10-50",
  "annualRevenueRange": "$1M-$5M",
  "headquartersLocation": "Austin, TX"
}
```

**GET /api/company-profiles**
List all company profiles accessible to the authenticated user.
- Consultants see all companies they created
- Company users see their linked company

### Stakeholder Profiles

**POST /api/company-profiles/[companyId]/stakeholders**
Create a stakeholder profile for a company.

```json
{
  "fullName": "Sarah Chen",
  "email": "sarah@clientorg.com",
  "roleType": "executive_leadership",
  "title": "VP of Operations",
  "department": "Operations"
}
```

**GET /api/company-profiles/[companyId]/stakeholders**
List all stakeholders for a company.

### Campaigns

**POST /api/campaigns**
Create a new campaign.

```json
{
  "name": "Q1 2026 Organizational Assessment",
  "companyProfileId": "uuid",
  "campaignType": "consulting_discovery",
  "facilitatorName": "Jane Smith",
  "facilitatorEmail": "jane@consultant.com",
  "description": "Cross-functional stakeholder discovery for strategic planning engagement",
  "stakeholders": [
    {
      "stakeholderProfileId": "uuid"
    },
    {
      "fullName": "New Stakeholder",
      "email": "new@clientorg.com",
      "roleType": "department_head",
      "position": "Director of Engineering",
      "department": "Engineering"
    }
  ]
}
```

**Supported Campaign Types:**
- `consulting_discovery` - Stakeholder discovery and organizational assessment
- `coaching_archetype_discovery` - Leadership archetype and self-discovery
- `industry_4_0_readiness` - Digital transformation assessment
- `education_institutional` - Institutional assessment
- `theory_of_constraints` - System bottleneck identification
- `lean_six_sigma` - Process optimization
- `bmad_strategic_planning` - Business planning framework
- *(Extensible for additional methodologies)*

**GET /api/campaigns**
List all campaigns created by the authenticated user.

### Interview Sessions

**GET /api/sessions/[token]**
Access a session via access token.
- Public endpoint (no auth required)
- Used by stakeholders to access their interviews

## Database Schema

### Key Tables

- **user_profiles**: User accounts with type (consultant/coach/company)
- **tenant_profiles**: Coach/consultant branding and configuration
- **company_profiles**: Company information and metadata
- **stakeholder_profiles**: Reusable stakeholder records
- **campaigns**: Assessment/workshop campaigns with methodology type
- **campaign_assignments**: Join table linking stakeholders to campaigns with access tokens
- **coaching_sessions**: Individual coaching client sessions
- **agent_sessions**: AI conversation state and history

### Row Level Security (RLS)

All tables use RLS policies to enforce multi-tenancy:

- **company_profiles**: Users access companies they created or are linked to
- **stakeholder_profiles**: Users manage stakeholders for their companies
- **campaigns**: Users manage campaigns they created or for their company
- **campaign_assignments**: Facilitators manage assignments; stakeholders access via token
- **coaching_sessions**: Coaches manage their sessions; clients access via token

## Development

### Prerequisites

- Node.js 20+ LTS
- Supabase account
- Anthropic API key
- Resend API key
- ElevenLabs API key (for voice features)

### Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Anthropic
ANTHROPIC_API_KEY=your-api-key

# Resend
RESEND_API_KEY=your-api-key

# ElevenLabs
ELEVENLABS_API_KEY=your-api-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Setup

```bash
# Install dependencies
npm install

# Run database migrations (via Supabase CLI or Dashboard)
# See supabase/migrations/

# Run development server
npm run dev
```

### Database Migrations

Migrations are in `supabase/migrations/` and should be applied in order. See [docs/MIGRATION-PLAN.md](docs/MIGRATION-PLAN.md) for details.

## User Journeys

### Consultant Workflow

1. **Signup** → Select "Consultant" user type
2. **Create Company Profile** → Add client company details
3. **Add Stakeholder Profiles** → Create profiles for client stakeholders
4. **Create Campaign** → Select methodology, assign stakeholders
5. **Monitor Progress** → Track session completion
6. **Review Synthesis** → Access AI-generated insights and recommendations

### Coach Workflow

1. **Signup** → Select "Coach" user type
2. **Set Up Tenant Profile** → Configure branding and slug
3. **Create Session** → Add client details, select assessment type
4. **Share Link** → Client accesses via unique token URL
5. **Review Results** → Access conversation insights and archetype analysis

### Company Workflow

1. **Signup** → Select "Company" user type, create company profile
2. **Add Stakeholder Profiles** → Create profiles for employees
3. **Create Campaign** → Select methodology for division/department assessment
4. **Monitor Progress** → Track session completion
5. **Review Synthesis** → Access AI-generated insights and recommendations

### Stakeholder / Client Workflow

1. **Receive Email** → With unique access link
2. **Click Link** → No login required
3. **Complete Session** → AI-facilitated conversation (20-30 min, text or voice)
4. **Upload Documents** → Optional supporting materials
5. **Submit** → Completion confirmation

## AI Agent System

### Modular Agent Architecture

FlowForge uses methodology-specific agents, each with:
- **Domain Knowledge**: Relevant frameworks, best practices, terminology
- **Questioning Strategy**: Methodology-appropriate interview structure
- **Analysis Capabilities**: Specialized synthesis for that domain
- **Reporting Templates**: Custom outputs for methodology

### Current Agents

#### Coaching Archetype Discovery Agent
- **Purpose**: Leadership archetype identification and self-discovery
- **Model**: Claude Sonnet 4.5
- **Outputs**: Archetype profile, leadership patterns, development recommendations

#### Consulting Discovery Agent
- **Purpose**: Multi-stakeholder organizational assessment
- **Model**: Claude Sonnet 4.5
- **Outputs**: Stakeholder synthesis, alignment analysis, strategic recommendations

#### Industry 4.0 Assessment Agent
- **Purpose**: Digital transformation readiness evaluation
- **Model**: Claude Sonnet 4.5
- **Outputs**: Maturity assessment, technology roadmap, implementation plan

### Agent Architecture

```typescript
interface ConsultingAgent {
  methodologyType: string
  knowledgeBase: string[]
  questioningFramework: InterviewStructure
  synthesisEngine: AnalysisCapability
  reportingTemplates: ReportType[]
}
```

## Documentation

- **Architecture**: [docs/ARCHITECTURE-multi-tenancy-redesign.md](docs/ARCHITECTURE-multi-tenancy-redesign.md)
- **Migration Plan**: [docs/MIGRATION-PLAN.md](docs/MIGRATION-PLAN.md)
- **PDF Design**: [docs/pdf-design-guidelines.md](docs/pdf-design-guidelines.md)
- **Design System**: [docs/design-system.md](docs/design-system.md)
- **Voice Integration**: [docs/elevenlabs-knowledge.md](docs/elevenlabs-knowledge.md)
- **Knowledge Base**: [docs/knowledge/](docs/knowledge/) - Methodology-specific reference materials

## Future Roadmap

### Methodology Expansion
- Additional coaching and leadership development frameworks
- Theory of Constraints agent and knowledge base
- Lean Six Sigma agent and templates
- BMAD Method strategic planning workflows
- Agent creation framework for custom methodologies

### Platform Enhancements
- Multi-agent workshop facilitation
- Real-time collaboration features
- Advanced analytics dashboard
- Custom reporting builder
- White-label tenant experiences

## License

Proprietary - Innovaas Solutions

## Support

For issues or questions, contact the development team.

---

**Built with AI-assisted development using BMad Method**
