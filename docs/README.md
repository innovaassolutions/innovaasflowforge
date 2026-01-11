# Innovaas Flow Forge - Documentation Index

**Project:** Innovaas Flow Forge
**Platform Type:** AI-Assisted Business Consulting Platform
**Current Focus:** Industry 4.0 Readiness Assessment
**Version:** 0.1.0
**Last Updated:** November 16, 2025

---

## 📚 Documentation Structure

This documentation provides comprehensive coverage of the Flow Forge platform vision, architecture, and implementation.

---

## Core Documentation

### 1. [Strategic Vision](./strategic-vision.md)
**Purpose:** Long-term platform vision and capabilities roadmap

**Key Topics:**
- Platform mission and positioning
- Supported consulting methodologies (TOC, Lean Six Sigma, etc.)
- Target industry verticals (Manufacturing, Services, Banking)
- Extensibility framework
- Strategic differentiators
- Roadmap through 2026

**Audience:** Executives, Strategic Planners, Business Stakeholders

---

### 2. [Industry 4.0 Assessment - Current Implementation](./industry-4-assessment-current.md)
**Purpose:** Detailed documentation of current system implementation

**Key Topics:**
- Assessment scope and dimensions
- Stakeholder role definitions
- Technical implementation details
- Database schema
- AI agent architecture
- Campaign management workflows
- Workshop readiness status
- Deployment configuration

**Audience:** Developers, Technical Teams, Implementation Teams

---

## Quick Reference

### Platform Overview

**What is Flow Forge?**
An AI-powered platform that conducts multi-stakeholder business assessments, synthesizes cross-functional insights, and generates strategic recommendations.

**Current Capability:**
Industry 4.0 readiness assessment across 6 stakeholder roles with AI-guided interviews and campaign management.

**Future Vision:**
Universal transformation assessment engine supporting multiple consulting methodologies, industry verticals, and organizational contexts.

---

### Technology Stack Summary

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 15 + React 18 |
| Database | Supabase (PostgreSQL) |
| AI Engine | Anthropic Claude (Sonnet) |
| Email Service | Resend API |
| State Management | Zustand |
| Authentication | Token-based (Supabase) |
| Hosting | Vercel (recommended) |
| Runtime | Node.js 20+ |

---

### Supported Stakeholder Roles

1. **Managing Director / Executive Leadership**
2. **IT Operations Manager**
3. **Production Manager**
4. **Purchasing Manager**
5. **Planning & Scheduler**
6. **Engineering & Maintenance**

*(Additional roles planned for future releases)*

---

### Assessment Methodologies

#### Current Implementation
- ✅ **Industry 4.0 Readiness Assessment**

#### Planned Methodologies
- 📋 **Theory of Constraints (TOC)**
- 📋 **Lean Six Sigma**
- 📋 **Digital Transformation Frameworks**
- 📋 **Operational Excellence Models**

---

### Target Industry Verticals

#### Manufacturing Sectors
- Pharmaceutical Manufacturing
- Food & Beverage
- Discrete Manufacturing
- Automotive Manufacturing
- Electronics Manufacturing

#### Service Sectors
- Sales & Marketing Organizations
- Professional Services
- Banking & Financial Services

---

## Development Status

### Workshop Ready - November 18, 2025

**Completed Features:**
- ✅ Campaign creation and management
- ✅ Multi-stakeholder configuration
- ✅ Email invitation system
- ✅ AI-powered interview agents
- ✅ Session progress tracking
- ✅ Mid-campaign stakeholder addition
- ✅ Real-time dashboard monitoring

**In Development:**
- 🚧 Cross-synthesis analysis engine
- 🚧 Report generation
- 🚧 Results dashboard
- 🚧 Export functionality

**Planned Enhancements:**
- 📋 Reminder email automation
- 📋 Session analytics
- 📋 Custom question libraries
- 📋 Multi-language support
- 📋 White-label capabilities

---

## Key Architecture Decisions

### Multi-Agent AI System
Each stakeholder role engages with a specialized AI agent that adapts its questioning based on:
- Stakeholder role and responsibilities
- Previous responses and context
- Assessment objectives
- Conversation phase

### Token-Based Access
Stakeholders access their interview sessions via unique, cryptographically secure tokens:
- No password required
- Single-use per stakeholder
- Secure session isolation
- Time-unlimited access (sessions can be paused and resumed)

### Campaign-Centric Design
All assessments are organized as campaigns:
- Multiple stakeholders per campaign
- Facilitator-managed
- Company-specific context
- Progress tracking across all participants

### Synthesis-First Analytics
The platform is designed to:
1. Capture multi-perspective inputs
2. Identify patterns and gaps across stakeholders
3. Synthesize strategic insights automatically
4. Generate actionable recommendations

---

## Deployment Architecture

### FlowForge Subdomain Setup

> **Note:** As of January 2026, FlowForge moved from a basePath configuration to a dedicated subdomain. See `docs/migration-basepath-removal.md` for migration details.

FlowForge is deployed as a standalone application on its own subdomain:

- **Production URL:** `https://flowforge.innovaas.co`
- **Repository:** `innovaasflowforge` (this project)
- **Deployment:** Vercel (direct, no proxy)

#### Request Flow

1. User visits: `https://flowforge.innovaas.co`
2. Vercel serves the page directly
3. No basePath, no proxy layer
4. Clean URL structure (e.g., `/dashboard`, `/auth/login`)

#### Custom Domain Support

The subdomain architecture enables proper custom domain routing:

1. Tenant configures custom domain (e.g., `assessment.clientcompany.com`)
2. DNS points to Vercel
3. Middleware detects custom domain and rewrites to tenant's internal path
4. Tenant sees their branded experience on their own domain

#### URL Helpers

Located in `lib/api-url.ts`, these helpers construct URLs:

```typescript
// Build a full public URL (for emails, API responses)
export function buildPublicUrl(path: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${appUrl}${cleanPath}`
}

// Build a relative API URL
export function apiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `/${cleanPath}`
}
```

Usage in components:
```typescript
const response = await fetch(apiUrl('api/campaigns'))
// Resolves to: /api/campaigns
```

---

## Documentation Roadmap

### Planned Documentation

1. **API Documentation**
   - REST API reference
   - Authentication flows
   - Request/response formats
   - Error handling

2. **User Guides**
   - Facilitator guide (campaign creation and management)
   - Stakeholder guide (interview participation)
   - Administrator guide (system configuration)

3. **Integration Guides**
   - Email system setup (Resend)
   - Database configuration (Supabase)
   - AI service integration (Anthropic)
   - Deployment procedures (Vercel)

4. **Development Guides**
   - Local development setup
   - Testing procedures
   - Contribution guidelines
   - Code style standards

5. **Methodology Expansion Guides**
   - Adding new consulting frameworks
   - Custom question library creation
   - Industry vertical customization
   - Synthesis algorithm development

---

## Quick Links

### External Resources

- **Anthropic Claude Documentation:** https://docs.anthropic.com
- **Supabase Documentation:** https://supabase.com/docs
- **Next.js Documentation:** https://nextjs.org/docs
- **Resend Documentation:** https://resend.com/docs

### Project Resources

- **Repository:** (To be added)
- **Issue Tracker:** (To be added)
- **Roadmap:** See [Strategic Vision](./strategic-vision.md)
- **Changelog:** (To be created)

---

## Contact and Support

**Project Owner:** Todd
**Platform:** Innovaas Flow Forge
**Development Framework:** BMAD (Business Methods Agentic Development)

---

## Document Maintenance

This documentation is actively maintained and updated as the platform evolves.

**Update Frequency:**
- Strategic documents: Monthly or upon major decisions
- Implementation documents: Weekly during active development
- Technical documents: As features are added or modified

**Last Major Update:** November 16, 2025
**Next Scheduled Review:** December 1, 2025

---

## Navigation

- 📖 [Strategic Vision](./strategic-vision.md) - Platform vision and roadmap
- 🔧 [Current Implementation](./industry-4-assessment-current.md) - Technical details and status
- 🏠 [Back to Documentation Index](./README.md) - This page

---

**Flow Forge** - Transforming Consulting Through AI-Powered Assessment
