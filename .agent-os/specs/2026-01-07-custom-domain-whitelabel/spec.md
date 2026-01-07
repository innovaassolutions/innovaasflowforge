# Spec Requirements Document

> Spec: Custom Domain / White-Label Feature
> Created: 2026-01-07
> Status: Planning

## Overview

Enable tenants (coaches, consultants, schools) to use their own custom subdomains instead of innovaas.co URLs, providing a fully white-labeled experience. Uses Cloudflare for SaaS to handle SSL provisioning and proxying at scale (~$0.10/domain/month for 1000+ tenants).

## User Stories

### Custom Domain Setup

As a **coach**, I want to configure a custom subdomain like `assessment.leadingwithmeaning.com`, so that my clients see my brand instead of innovaas.co in their browser.

**Workflow:**
1. Coach goes to Branding Settings
2. Enters desired subdomain (e.g., `assessment.leadingwithmeaning.com`)
3. System displays DNS instructions (CNAME record)
4. Coach configures DNS at their domain registrar
5. System verifies DNS and activates the custom domain
6. All coach URLs now work on the custom subdomain

### Clean URL Structure

As a **client**, I want to access my assessment results at a simple URL like `assessment.leadingwithmeaning.com/results/[token]`, so that the experience feels native to my coach's brand.

**Workflow:**
1. Client receives email with link to custom domain
2. URL structure is clean: `/results/[token]` (no `/coach/[slug]/` prefix)
3. All branding matches the coach's configuration
4. Fallback to innovaas.co URL if custom domain has issues

## Spec Scope

1. **Custom Domain Configuration UI** - Add domain settings to the Branding Settings page with DNS instructions and verification status
2. **Cloudflare for SaaS Integration** - Programmatically add/remove custom hostnames via Cloudflare API when tenants configure domains
3. **Next.js Middleware Routing** - Detect incoming hostname, lookup tenant, and rewrite to internal paths while preserving external URL
4. **DNS Verification System** - Verify CNAME records are correctly configured before activating custom domains
5. **Fallback Handling** - Gracefully fall back to innovaas.co URLs if custom domain is misconfigured

## Out of Scope

- Full apex domain support (only subdomains like `assessment.example.com`)
- Email sending from custom domains (emails still come from innovaas.co)
- SSL certificate management UI (Cloudflare handles this automatically)
- Custom domain for the main dashboard (only public-facing tenant pages)
- Migration of existing session URLs (old innovaas.co links continue to work)

## Expected Deliverable

1. Tenants can enter a custom subdomain in Branding Settings and see DNS configuration instructions
2. System automatically verifies DNS and shows verification status (pending/verified/failed)
3. Once verified, all tenant public pages work on the custom subdomain with clean URL paths
4. Old innovaas.co URLs continue to work as fallback

## Spec Documentation

- Tasks: @.agent-os/specs/2026-01-07-custom-domain-whitelabel/tasks.md
- Technical Specification: @.agent-os/specs/2026-01-07-custom-domain-whitelabel/sub-specs/technical-spec.md
- Database Schema: @.agent-os/specs/2026-01-07-custom-domain-whitelabel/sub-specs/database-schema.md
- API Specification: @.agent-os/specs/2026-01-07-custom-domain-whitelabel/sub-specs/api-spec.md
- Tests Specification: @.agent-os/specs/2026-01-07-custom-domain-whitelabel/sub-specs/tests.md

## Future Enhancement

- **Tier Gating**: Custom domains will be restricted to Professional/Enterprise plans in a future release (simple check to add later)
