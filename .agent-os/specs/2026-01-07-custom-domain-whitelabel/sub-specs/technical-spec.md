# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2026-01-07-custom-domain-whitelabel/spec.md

> Created: 2026-01-07
> Version: 1.0.0

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  assessment.leadingwithmeaning.com                              │
│         ↓ CNAME to [zone].ssl.cloudflare.com                    │
│  Cloudflare for SaaS (SSL termination + proxy)                  │
│         ↓ Origin: innovaas.co                                   │
│  Vercel (Next.js)                                               │
│         ↓                                                       │
│  middleware.ts (hostname detection + tenant lookup)             │
│         ↓                                                       │
│  Internal rewrite: /coach/[slug]/results/[token]                │
│  External URL preserved: /results/[token]                       │
└─────────────────────────────────────────────────────────────────┘
```

## Technical Requirements

### 1. Cloudflare for SaaS Setup (One-Time)

- Enable "Cloudflare for SaaS" on existing Cloudflare zone
- Configure fallback origin: `innovaas.co` (or Vercel deployment URL)
- Note the CNAME target (e.g., `flowforge.ssl.cloudflare.com`)

### 2. Cloudflare API Integration

**Add Custom Hostname:**
```typescript
// POST https://api.cloudflare.com/client/v4/zones/{zone_id}/custom_hostnames
{
  "hostname": "assessment.leadingwithmeaning.com",
  "ssl": {
    "method": "http",
    "type": "dv"
  }
}
```

**Check Hostname Status:**
```typescript
// GET https://api.cloudflare.com/client/v4/zones/{zone_id}/custom_hostnames/{hostname_id}
// Returns: { status: "pending" | "active" | "moved" | "deleted" }
```

**Delete Custom Hostname:**
```typescript
// DELETE https://api.cloudflare.com/client/v4/zones/{zone_id}/custom_hostnames/{hostname_id}
```

### 3. Next.js Middleware Enhancement

```typescript
// middleware.ts - Enhanced hostname routing
export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''

  // Skip if it's the main innovaas.co domain
  if (hostname.includes('innovaas.co') || hostname.includes('localhost')) {
    return handleDefaultRouting(request)
  }

  // Custom domain detected - lookup tenant
  const tenant = await lookupTenantByDomain(hostname)

  if (!tenant) {
    // Domain not found - redirect to innovaas.co
    return NextResponse.redirect('https://innovaas.co')
  }

  // Rewrite URL to internal path
  // External: /results/abc123
  // Internal: /coach/leadingwithmeaning/results/abc123
  const url = request.nextUrl.clone()
  const path = url.pathname

  // Map clean paths to internal paths
  if (path.startsWith('/results/')) {
    url.pathname = `/coach/${tenant.slug}${path}`
  } else if (path.startsWith('/session/')) {
    url.pathname = `/coach/${tenant.slug}${path}`
  } else if (path === '/' || path === '') {
    url.pathname = `/coach/${tenant.slug}`
  }

  return NextResponse.rewrite(url)
}
```

### 4. URL Path Mapping

| Custom Domain Path | Internal Path | Description |
|-------------------|---------------|-------------|
| `/` | `/coach/[slug]` | Landing page |
| `/register` | `/coach/[slug]/register` | Registration |
| `/session/[token]` | `/coach/[slug]/session/[token]` | Interview session |
| `/results/[token]` | `/coach/[slug]/results/[token]` | Results page |
| `/results/[token]/reflect` | `/coach/[slug]/results/[token]/reflect` | Reflection page |
| `/results/[token]/thank-you` | `/coach/[slug]/results/[token]/thank-you` | Thank you page |

### 5. DNS Verification Flow

1. Tenant enters desired subdomain
2. System validates format (must be subdomain, not apex)
3. System calls Cloudflare API to add custom hostname
4. System stores `cloudflare_hostname_id` in database
5. UI shows DNS instructions: "Add CNAME record pointing to `[target].ssl.cloudflare.com`"
6. Background job polls Cloudflare API for status
7. When status = "active", update `domain_verified = true`

### 6. Caching Strategy

**Tenant Lookup Cache (Edge):**
- Cache tenant by custom_domain in Vercel Edge Config or Redis
- TTL: 5 minutes
- Invalidate on domain change

**Why caching matters:**
- Middleware runs on every request
- Database lookup on every request is expensive
- Edge caching reduces latency to <1ms

## Approach Options

### Option A: Direct Cloudflare API (Selected)

Call Cloudflare API directly from Next.js API routes.

**Pros:**
- Simple implementation
- Direct control
- No additional infrastructure

**Cons:**
- Need to handle API rate limits
- Polling for verification status

### Option B: Cloudflare Workers Integration

Use Cloudflare Workers as an intermediary.

**Pros:**
- Could handle routing at Cloudflare edge
- Lower latency

**Cons:**
- Additional complexity
- Split logic between Vercel and Cloudflare
- Harder to debug

**Rationale:** Option A is simpler and keeps all logic in Next.js. The middleware rewrite approach is well-supported by Vercel and doesn't require additional infrastructure.

## External Dependencies

### New Environment Variables

```env
# Cloudflare for SaaS
CLOUDFLARE_API_TOKEN=xxx          # API token with Zone:Edit permissions
CLOUDFLARE_ZONE_ID=xxx            # Zone ID for innovaas.co
CLOUDFLARE_CNAME_TARGET=xxx       # CNAME target (e.g., flowforge.ssl.cloudflare.com)
```

### NPM Packages

No new packages required - using native `fetch` for Cloudflare API calls.

## Security Considerations

1. **Domain Validation**: Verify subdomain format before sending to Cloudflare
2. **Uniqueness Check**: Ensure custom domain isn't already claimed by another tenant
3. **Rate Limiting**: Limit domain configuration attempts per tenant
4. **DNS Spoofing**: Cloudflare handles SSL verification via HTTP-01 challenge
5. **Fallback Security**: Invalid domains redirect to main site, not error pages

## Performance Considerations

1. **Middleware Latency**: Cache tenant lookups at edge (<1ms target)
2. **Verification Polling**: Use background job, not user-blocking requests
3. **Cloudflare Propagation**: SSL provisioning takes 1-5 minutes typically

## Rollback Plan

If issues arise:
1. Disable custom domain routing in middleware (feature flag)
2. All traffic falls back to standard innovaas.co URLs
3. Existing links continue to work
