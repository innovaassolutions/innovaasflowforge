# Innovaas FlowForge

**Multi-Disciplinary Consulting Platform**

## Overview

FlowForge is a SaaS platform that enables management consultants to facilitate structured assessments, workshops, and strategy sessions using AI-powered agents specialized in various consulting methodologies.

### Supported Methodologies (Modular Agent System)

- **Theory of Constraints**: Identify and resolve system bottlenecks
- **Lean Six Sigma**: Process optimization and waste reduction
- **Industry 4.0 Best Practices**: Digital transformation readiness
- **BMAD Method**: Business planning and strategic frameworks
- **Additional Frameworks**: Extensible architecture for new methodologies

### Platform Capabilities

FlowForge combines AI-facilitated stakeholder interviews with automated synthesis to deliver:
- Structured assessment campaigns
- Multi-stakeholder workshop facilitation
- Cross-perspective synthesis and analysis
- Strategic recommendations and roadmaps
- Professional reporting and documentation

The platform supports both external consultants managing multiple clients and internal company teams running their own assessments.

## Architecture

### Multi-Tenancy Model

FlowForge uses a **campaign-level multi-tenancy** architecture with two distinct user types:

#### User Types

1. **Consultants**
   - Manage multiple client companies
   - Create unlimited company profiles
   - Run campaigns across different methodologies
   - Billed per campaign
   - Access all campaigns they create

2. **Company Users**
   - Linked to one company profile (their organization)
   - Manage stakeholder profiles (employees)
   - Create campaigns for their divisions
   - Purchase campaign packages

### Data Model

```
Users (Facilitators)
└── User Type: Consultant | Company

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

Campaign Assignments
├── Links Stakeholder Profile → Campaign
├── Unique access_token per assignment
├── Tracks interview/workshop progress
└── Stores conversation data and artifacts
```

### Modular Agent Architecture

FlowForge uses a **methodology-specific agent system**:

```
Campaign → Methodology Selection → Specialized Agent

Examples:
- Industry 4.0 Campaign → Industry 4.0 Assessment Agent
- TOC Campaign → Theory of Constraints Agent
- Lean Six Sigma Campaign → LSS Process Agent
- BMAD Strategic Planning → Strategic Planning Agent
```

Each agent is purpose-built with:
- Domain-specific knowledge base
- Methodology-appropriate questioning framework
- Specialized synthesis and analysis capabilities
- Custom reporting templates

### Key Features

- **Reusable Stakeholder Profiles**: Same stakeholder can participate in multiple campaigns without re-entering information
- **Company-Level Isolation**: Data properly isolated by company, not by user account
- **Flexible Access Control**: RLS policies support both consultant and company user workflows
- **Token-Based Access**: Stakeholders access sessions via unique URLs (no login required)
- **Methodology Flexibility**: Modular agent system supports diverse consulting frameworks

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: TailwindCSS with Catppuccin Mocha theme
- **AI**: Anthropic Claude API (Sonnet 4.5)
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
  "companyName": "Acme Manufacturing",
  "industry": "Automotive",
  "description": "Leading automotive parts manufacturer",
  "website": "https://acme.com",
  "marketScope": "international",
  "employeeCountRange": "500-1000",
  "annualRevenueRange": "$50M-$100M",
  "headquartersLocation": "Detroit, MI"
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
  "fullName": "John Doe",
  "email": "john@acme.com",
  "roleType": "it_operations",
  "title": "IT Director",
  "department": "Information Technology"
}
```

**GET /api/company-profiles/[companyId]/stakeholders**
List all stakeholders for a company.

### Campaigns

**POST /api/campaigns**
Create a new campaign.

```json
{
  "name": "Q1 2025 TOC Assessment",
  "companyProfileId": "uuid",
  "campaignType": "theory_of_constraints", // Methodology selection
  "facilitatorName": "Jane Smith",
  "facilitatorEmail": "jane@consultant.com",
  "description": "Quarterly constraint analysis",
  "stakeholders": [
    {
      "stakeholderProfileId": "uuid" // Existing profile
    },
    {
      // OR create new profile inline
      "fullName": "New Stakeholder",
      "email": "new@acme.com",
      "roleType": "production_manager",
      "position": "Plant Manager",
      "department": "Manufacturing"
    }
  ]
}
```

**Supported Campaign Types:**
- `industry_4_0_readiness` - Digital transformation assessment
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
- Used by stakeholders to access their interviews/workshops

## Database Schema

### Key Tables

- **company_profiles**: Company information and metadata
- **stakeholder_profiles**: Reusable stakeholder records
- **user_profiles**: User accounts with type (consultant/company)
- **campaigns**: Assessment/workshop campaigns with methodology type
- **campaign_assignments**: Join table linking stakeholders to campaigns with access tokens
- **agent_sessions**: AI conversation state and history

### Row Level Security (RLS)

All tables use RLS policies to enforce multi-tenancy:

- **company_profiles**: Users access companies they created or are linked to
- **stakeholder_profiles**: Users manage stakeholders for their companies
- **campaigns**: Users manage campaigns they created or for their company
- **campaign_assignments**: Facilitators manage assignments; stakeholders access via token

## Development

### Prerequisites

- Node.js 20+ LTS
- Supabase account
- Anthropic API key
- Resend API key

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

Migrations are in `supabase/migrations/` and should be applied in order:
1. Initial schema
2. Multi-tenancy setup
3. Company profiles and stakeholder profiles
4. Table renames and cleanup

See [docs/MIGRATION-PLAN.md](docs/MIGRATION-PLAN.md) for details.

## User Journeys

### Consultant Workflow

1. **Signup** → Select "Consultant" user type
2. **Create Company Profile** → Add client company details
3. **Add Stakeholder Profiles** → Create profiles for client employees
4. **Create Campaign** → Select methodology, assign stakeholders
5. **Monitor Progress** → Track session completion
6. **Review Synthesis** → Access AI-generated insights and recommendations

### Company Workflow

1. **Signup** → Select "Company" user type, create company profile
2. **Add Stakeholder Profiles** → Create profiles for employees
3. **Create Campaign** → Select methodology for division/department assessment
4. **Monitor Progress** → Track session completion
5. **Review Synthesis** → Access AI-generated insights and recommendations

### Stakeholder Workflow

1. **Receive Email** → With unique access link
2. **Click Link** → No login required
3. **Complete Session** → AI-facilitated conversation/workshop (20-30 min)
4. **Upload Documents** → Optional supporting materials
5. **Submit** → Completion confirmation

## AI Agent System

### Modular Agent Architecture

FlowForge uses methodology-specific agents, each with:
- **Domain Knowledge Base**: Relevant frameworks, best practices, terminology
- **Questioning Strategy**: Methodology-appropriate interview structure
- **Analysis Capabilities**: Specialized synthesis for that domain
- **Reporting Templates**: Custom outputs for methodology

### Current Agents

#### Industry 4.0 Assessment Agent
- **Purpose**: Digital transformation readiness evaluation
- **Model**: Claude Sonnet 4.5
- **Knowledge Base**: Industry 4.0, UNS, IIoT, smart manufacturing
- **Outputs**: Maturity assessment, technology roadmap, implementation plan

### Planned Agents (Modular Expansion)

- **Theory of Constraints Agent**: System bottleneck identification
- **Lean Six Sigma Agent**: Process optimization and waste analysis
- **BMAD Strategic Planning Agent**: Business model and strategy development
- *(Additional agents for new methodologies)*

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
- **Knowledge Base**: [docs/knowledge/](docs/knowledge/) - Methodology-specific reference materials

## Future Roadmap

### Methodology Expansion
- Add Theory of Constraints agent and knowledge base
- Add Lean Six Sigma agent and templates
- Add BMAD Method strategic planning workflows
- Build agent creation framework for custom methodologies

### Platform Enhancements
- Multi-agent workshop facilitation
- Real-time collaboration features
- Advanced analytics dashboard
- Custom reporting builder

## License

Proprietary - Innovaas Solutions

## Support

For issues or questions, contact the development team.

---

**Built with AI-assisted development using BMad Method**
