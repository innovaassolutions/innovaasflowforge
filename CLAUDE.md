# Innovaas FlowForge - AI Development Context

> Project-specific instructions and reference materials for AI-assisted development

## Project Overview

**Innovaas FlowForge** is a Digital Transformation Readiness Assessment platform that helps manufacturing companies evaluate their Industry 4.0 maturity through structured stakeholder interviews and AI-powered synthesis.

## Key Technologies

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: TailwindCSS with Catppuccin Mocha theme
- **AI**: Anthropic Claude API
- **PDF Generation**: @react-pdf/renderer
- **Email**: Resend

## Architecture

### Core Flows

1. **Campaign Management**: Create campaigns → Add stakeholders → Generate invite links
2. **Interview Process**: AI-facilitated conversations using specialized agents
3. **Synthesis**: Multi-dimensional analysis across Technology, Process, Organization pillars
4. **Reporting**: PDF and Markdown reports with charts and visualizations

### Key Components

- **Interview Agent** (`lib/agents/interview-agent.ts`): Conducts stakeholder interviews
- **Synthesis Agent** (`lib/agents/synthesis-agent.ts`): Analyzes transcripts and generates assessments
- **PDF Generator** (`lib/pdf-document.tsx`, `lib/pdf-chart-components.tsx`): Creates beautiful reports

## Design Standards

### PDF Report Design

**IMPORTANT**: When working on PDF reports, always reference:

📄 **[PDF Design Guidelines](docs/pdf-design-guidelines.md)**

This comprehensive guide covers:
- Visual hierarchy and layout principles
- Typography standards
- Color theory and brand palette
- Data visualization best practices
- Accessibility requirements
- Implementation checklists

**Key Principles**:
- Content first, design elevates
- Generous whitespace (40-60pt margins)
- Consistent visual hierarchy
- Brand colors: Orange (#F25C05) primary, Teal (#1D9BA3) secondary
- Charts should be clear, accessible, and professionally styled

### UI Design

- **Theme**: Catppuccin Mocha (dark mode optimized)
- **Brand Colors**: Orange and Teal gradient for primary actions
- **No Emojis**: User explicitly requested no emojis in UI (icons only)
- **Typography**: Clean, modern sans-serif fonts

## Code Conventions

### File Organization

```
app/                    # Next.js app router pages
├── api/               # API routes
├── dashboard/         # Protected dashboard pages
└── session/          # Interview session pages

lib/                   # Shared libraries
├── agents/           # AI agents (interview, synthesis)
├── pdf-*.tsx         # PDF generation components
└── report-generator.ts

supabase/
├── migrations/       # Database migrations
└── functions/        # Edge functions
```

### Important Patterns

1. **Supabase Client**: Use `createClient()` with service role key for server-side operations
2. **Type Safety**: All database queries typed with TypeScript interfaces
3. **Error Handling**: Comprehensive try-catch with user-friendly messages
4. **AI Prompts**: Structured with clear instructions and JSON formatting requirements

## Development Guidelines

### When Working on Features

1. **Read relevant documentation first** (like PDF guidelines for report work)
2. **Follow existing patterns** in the codebase
3. **Maintain type safety** - TypeScript strict mode
4. **Test thoroughly** - especially AI agent responses
5. **Consider accessibility** - color contrast, screen readers

### When Fixing Bugs

1. **Check server logs** for AI agent errors
2. **Verify JSON parsing** - AI responses may include markdown wrappers
3. **Test edge cases** - empty data, missing fields, etc.

### When Adding New Features

1. **Review architecture** to understand data flow
2. **Follow design guidelines** for UI/PDF components
3. **Update types** as needed
4. **Document significant decisions**

## Common Issues & Solutions

### PDF Generation

- **React-PDF limitations**: No `position: 'absolute'`, limited CSS support
- **SVG compatibility**: Use `viewBox` for proper scaling
- **JSON parsing**: Strip markdown code blocks before parsing AI responses

### AI Agents

- **Response format**: Always request JSON, but expect markdown wrappers
- **Token limits**: Be mindful of conversation history size
- **Retries**: Implement for transient API errors

### Supabase

- **RLS Policies**: Service role bypasses RLS, anon key respects it
- **Type casting**: Use `as any` sparingly, prefer proper typing
- **Realtime**: Supabase subscriptions for live updates

## Documentation

- **PDF Design**: [docs/pdf-design-guidelines.md](docs/pdf-design-guidelines.md)
- **Knowledge Base**: [docs/knowledge/](docs/knowledge/) - Industry 4.0 reference materials
- **Database Schema**: See Supabase migrations

## Development Workflow

1. **Dev Server**: `npm run dev` (port 3000)
2. **Type Checking**: TypeScript strict mode enabled
3. **Environment**: `.env.local` for secrets (never commit)
4. **Database**: Supabase hosted PostgreSQL

## User Preferences

- **No emojis in UI** - use icons instead
- **Professional, business-focused design**
- **Data-driven visualizations**
- **Accessibility-first approach**

---

**For AI Assistants**: When working on this project, prioritize reading relevant documentation (especially PDF design guidelines when working on reports), following established patterns, and maintaining the professional, data-driven aesthetic. Always test changes thoroughly before considering work complete.
