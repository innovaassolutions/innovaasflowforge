# Spec Tasks

These are the tasks to be completed for the spec detailed in @.agent-os/specs/2026-01-07-custom-domain-whitelabel/spec.md

> Created: 2026-01-07
> Status: Ready for Implementation

## Tasks

- [x] 1. **Database Migration** - Add custom domain verification fields
  - [x] 1.1 Create migration file `20260107_001_add_custom_domain_verification.sql`
  - [x] 1.2 Add `domain_verified` BOOLEAN column
  - [x] 1.3 Add `cloudflare_hostname_id` TEXT column
  - [x] 1.4 Add `domain_verification_started_at` TIMESTAMPTZ column
  - [x] 1.5 Create index for verified domain lookups
  - [x] 1.6 Apply migration to Supabase
  - [x] 1.7 Verify columns exist in database

- [x] 2. **Cloudflare Service** - Create API integration layer
  - [x] 2.1 Add Cloudflare environment variables to `.env.local.example`
  - [x] 2.2 Create `lib/services/cloudflare-domains.ts` service file
  - [x] 2.3 Implement `addCustomHostname()` function
  - [x] 2.4 Implement `getHostnameStatus()` function
  - [x] 2.5 Implement `deleteCustomHostname()` function
  - [x] 2.6 Add domain validation utility `lib/utils/domain-validation.ts`
  - [ ] 2.7 Add Cloudflare env vars to Vercel (requires manual setup)
  - [ ] 2.8 Test Cloudflare API calls manually

- [x] 3. **API Endpoints** - Create domain configuration routes
  - [x] 3.1 Create `app/api/tenant/domain/route.ts` (POST, GET, DELETE)
  - [x] 3.2 Implement POST handler - configure domain
  - [x] 3.3 Implement DELETE handler - remove domain
  - [x] 3.4 Create `app/api/tenant/domain/status/route.ts` (GET)
  - [x] 3.5 Implement GET handler - check verification status
  - [x] 3.6 Add error handling and validation
  - [ ] 3.7 Test endpoints via curl/Postman (requires env vars)

- [x] 4. **Branding Settings UI** - Add custom domain configuration section
  - [x] 4.1 Add domain state variables to branding page
  - [x] 4.2 Create "Custom Domain" card section with input field
  - [x] 4.3 Add DNS instructions display component
  - [x] 4.4 Add verification status indicator (pending/verified/failed)
  - [x] 4.5 Implement configure domain button handler
  - [x] 4.6 Implement remove domain button handler
  - [x] 4.7 Add manual check status button (polling not needed)
  - [ ] 4.8 Test UI flow end-to-end (requires env vars)

- [x] 5. **Middleware Routing** - Add custom domain detection and rewriting
  - [x] 5.1 Create `lib/services/tenant-lookup.ts` for domain→tenant lookup
  - [x] 5.2 Update `middleware.ts` to detect custom domains
  - [x] 5.3 Implement URL path rewriting logic
  - [x] 5.4 Add fallback redirect to innovaas.co for unknown domains
  - [ ] 5.5 Test with simulated custom domain (hosts file or ngrok)
  - [ ] 5.6 Verify standard innovaas.co URLs still work

- [ ] 6. **Cloudflare Setup & Testing** - Configure Cloudflare for SaaS
  - [ ] 6.1 Enable Cloudflare for SaaS on innovaas.co zone
  - [ ] 6.2 Configure fallback origin
  - [ ] 6.3 Note CNAME target for DNS instructions
  - [ ] 6.4 Test with a real subdomain (e.g., test.toddabraham.com)
  - [ ] 6.5 Verify SSL provisioning works
  - [ ] 6.6 Verify full flow: configure → DNS → verify → access

## Future Enhancements (Not in Initial Scope)

- [ ] Tier gating - Restrict custom domains to Professional/Enterprise plans
- [ ] Edge caching - Cache tenant lookups at Vercel Edge for <1ms latency
- [ ] Domain analytics - Track requests per custom domain
- [ ] Multiple domains - Allow tenants to configure multiple custom domains

## Notes

- Task 6 (Cloudflare Setup) requires access to Cloudflare dashboard
- Testing task 5.5 may require temporary hosts file modification or ngrok tunnel
- Environment variables needed before task 2: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`, `CLOUDFLARE_CNAME_TARGET`
