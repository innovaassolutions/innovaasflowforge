# Innovaas FlowForge - AI Development Context

> Project-specific instructions and reference materials for AI-assisted development

## Project Overview

**Innovaas FlowForge** is a management consulting platform that enables consultants to conduct structured assessments across any industry through AI-facilitated stakeholder interviews and intelligent synthesis.

**First Use Case**: Digital Transformation Readiness Assessment - helping organizations across healthcare, manufacturing, retail, finance, education, logistics, and professional services evaluate their digital maturity and transformation readiness.

## Key Technologies

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: TailwindCSS with Pearl Vibrant theme (see Design System below)
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

### UI Design System (MANDATORY)

**CRITICAL**: Before making ANY UI changes, you MUST read the design system documentation:

1. **[Design System Reference](docs/design-system.md)** - Color tokens, typography, spacing, component specs
2. **[UX Color Themes](docs/ux-color-themes.html)** - Full color palette explorer
3. **[UX Design Directions](docs/ux-design-directions.html)** - Complete page mockups and patterns

**Pearl Vibrant Theme - Quick Reference:**
| Token | Hex | Usage |
|-------|-----|-------|
| `--accent` | `#F25C05` | CTAs, active states, progress bars |
| `--accent-hover` | `#DC5204` | Button hover states |
| `--accent-subtle` | `#FEF5EE` | Badge backgrounds, highlights |
| `--bg` | `#FFFEFB` | Main page backgrounds |
| `--bg-subtle` | `#FAF8F3` | Cards, inputs, sidebars |
| `--bg-muted` | `#F2EFE7` | Hover states, dividers |
| `--border` | `#E6E2D6` | Borders, separators |
| `--text` | `#171614` | Primary text |
| `--text-muted` | `#71706B` | Secondary text, labels |

**Design Rules:**
- **Font**: Inter (Google Fonts)
- **No Emojis**: Use Lucide icons only
- **Orange Sparingly**: Only for interactive elements (CTAs, active nav, progress)
- **Border Radius**: 8px for buttons/inputs, 12px for cards
- **Spacing**: Follow 12/16/20/24/32/40px scale
- **Shadows**: Subtle only - use borders for depth

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

- **UI Design System**: [docs/design-system.md](docs/design-system.md) - MANDATORY for all UI work
- **UX Color Themes**: [docs/ux-color-themes.html](docs/ux-color-themes.html) - Visual color explorer
- **UX Design Directions**: [docs/ux-design-directions.html](docs/ux-design-directions.html) - Page mockups
- **PDF Design**: [docs/pdf-design-guidelines.md](docs/pdf-design-guidelines.md)
- **Report Design**: [docs/report-design-guidelines.md](docs/report-design-guidelines.md)
- **Knowledge Base**: [docs/knowledge/](docs/knowledge/) - Assessment framework reference materials
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

## For AI Assistants

**BEFORE ANY UI WORK:**
1. Read [docs/design-system.md](docs/design-system.md) for color tokens and component specs
2. Reference [docs/ux-design-directions.html](docs/ux-design-directions.html) for layout patterns
3. Verify your changes match the Pearl Vibrant theme exactly

**General Guidelines:**
- Prioritize reading relevant documentation before making changes
- Follow established patterns in the codebase
- Maintain the professional, data-driven aesthetic
- Always test changes thoroughly before considering work complete
- When in doubt, reference the design system files
