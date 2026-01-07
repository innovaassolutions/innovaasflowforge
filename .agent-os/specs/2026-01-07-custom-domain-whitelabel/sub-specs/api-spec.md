# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2026-01-07-custom-domain-whitelabel/spec.md

> Created: 2026-01-07
> Version: 1.0.0

## Endpoints Overview

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/tenant/domain` | Configure custom domain |
| GET | `/api/tenant/domain/status` | Check verification status |
| DELETE | `/api/tenant/domain` | Remove custom domain |

---

## POST /api/tenant/domain

Configure a new custom domain for the authenticated tenant.

### Request

```typescript
// Headers
Authorization: Bearer <session_token>  // Supabase auth
Content-Type: application/json

// Body
{
  "domain": "assessment.leadingwithmeaning.com"
}
```

### Validation Rules

1. Must be authenticated as tenant owner
2. Domain must be a valid subdomain (not apex domain)
3. Domain must not be already claimed by another tenant
4. Domain must not be a reserved subdomain (e.g., `www`, `mail`, `api`)
5. Tenant must not have a pending domain verification

### Response - Success (200)

```typescript
{
  "success": true,
  "domain": "assessment.leadingwithmeaning.com",
  "status": "pending",
  "dns_instructions": {
    "record_type": "CNAME",
    "host": "assessment",
    "target": "flowforge.ssl.cloudflare.com",
    "message": "Add a CNAME record pointing 'assessment' to 'flowforge.ssl.cloudflare.com'"
  }
}
```

### Response - Error (400/409)

```typescript
// Invalid domain format
{
  "success": false,
  "error": "invalid_domain",
  "message": "Domain must be a subdomain (e.g., assessment.yourdomain.com)"
}

// Domain already claimed
{
  "success": false,
  "error": "domain_taken",
  "message": "This domain is already in use by another tenant"
}

// Reserved subdomain
{
  "success": false,
  "error": "reserved_domain",
  "message": "This subdomain is reserved and cannot be used"
}
```

### Implementation Flow

```typescript
async function POST(request: Request) {
  // 1. Authenticate user and get tenant
  const { user } = await getUser()
  const tenant = await getTenantByUserId(user.id)

  // 2. Validate domain format
  const { domain } = await request.json()
  if (!isValidSubdomain(domain)) {
    return error('invalid_domain')
  }

  // 3. Check domain not already taken
  const existing = await checkDomainExists(domain)
  if (existing && existing.id !== tenant.id) {
    return error('domain_taken')
  }

  // 4. Add to Cloudflare
  const cfResponse = await cloudflareAddHostname(domain)

  // 5. Update database
  await updateTenant(tenant.id, {
    custom_domain: domain,
    domain_verified: false,
    cloudflare_hostname_id: cfResponse.id,
    domain_verification_started_at: new Date()
  })

  // 6. Return DNS instructions
  return success({
    domain,
    status: 'pending',
    dns_instructions: getDnsInstructions(domain)
  })
}
```

---

## GET /api/tenant/domain/status

Check the current verification status of the custom domain.

### Request

```typescript
// Headers
Authorization: Bearer <session_token>
```

### Response - Success (200)

```typescript
// Not configured
{
  "configured": false,
  "domain": null,
  "status": null
}

// Pending verification
{
  "configured": true,
  "domain": "assessment.leadingwithmeaning.com",
  "status": "pending",
  "started_at": "2026-01-07T10:30:00Z",
  "dns_instructions": {
    "record_type": "CNAME",
    "host": "assessment",
    "target": "flowforge.ssl.cloudflare.com"
  }
}

// Verified and active
{
  "configured": true,
  "domain": "assessment.leadingwithmeaning.com",
  "status": "verified",
  "verified_at": "2026-01-07T10:35:00Z",
  "url": "https://assessment.leadingwithmeaning.com"
}

// Verification failed (timeout or DNS issue)
{
  "configured": true,
  "domain": "assessment.leadingwithmeaning.com",
  "status": "failed",
  "error": "DNS verification failed. Please check your CNAME record.",
  "dns_instructions": {
    "record_type": "CNAME",
    "host": "assessment",
    "target": "flowforge.ssl.cloudflare.com"
  }
}
```

### Implementation Flow

```typescript
async function GET(request: Request) {
  // 1. Get tenant
  const tenant = await getTenantByUserId(user.id)

  // 2. If no domain configured
  if (!tenant.custom_domain) {
    return { configured: false }
  }

  // 3. If already verified, return success
  if (tenant.domain_verified) {
    return {
      configured: true,
      domain: tenant.custom_domain,
      status: 'verified',
      url: `https://${tenant.custom_domain}`
    }
  }

  // 4. Check Cloudflare for current status
  const cfStatus = await cloudflareGetHostnameStatus(tenant.cloudflare_hostname_id)

  // 5. If Cloudflare says active, update our database
  if (cfStatus === 'active') {
    await updateTenant(tenant.id, { domain_verified: true })
    return {
      configured: true,
      domain: tenant.custom_domain,
      status: 'verified'
    }
  }

  // 6. Check for timeout (>24 hours)
  const startedAt = new Date(tenant.domain_verification_started_at)
  const hoursElapsed = (Date.now() - startedAt.getTime()) / (1000 * 60 * 60)

  if (hoursElapsed > 24) {
    return {
      configured: true,
      domain: tenant.custom_domain,
      status: 'failed',
      error: 'DNS verification timed out after 24 hours'
    }
  }

  // 7. Still pending
  return {
    configured: true,
    domain: tenant.custom_domain,
    status: 'pending',
    dns_instructions: getDnsInstructions(tenant.custom_domain)
  }
}
```

---

## DELETE /api/tenant/domain

Remove the custom domain configuration.

### Request

```typescript
// Headers
Authorization: Bearer <session_token>
```

### Response - Success (200)

```typescript
{
  "success": true,
  "message": "Custom domain removed successfully"
}
```

### Implementation Flow

```typescript
async function DELETE(request: Request) {
  // 1. Get tenant
  const tenant = await getTenantByUserId(user.id)

  // 2. If no domain, nothing to do
  if (!tenant.custom_domain) {
    return { success: true }
  }

  // 3. Delete from Cloudflare
  if (tenant.cloudflare_hostname_id) {
    await cloudflareDeleteHostname(tenant.cloudflare_hostname_id)
  }

  // 4. Update database
  await updateTenant(tenant.id, {
    custom_domain: null,
    domain_verified: false,
    cloudflare_hostname_id: null,
    domain_verification_started_at: null
  })

  return { success: true }
}
```

---

## Internal API: Cloudflare Service

```typescript
// lib/services/cloudflare-domains.ts

interface CloudflareHostnameResponse {
  id: string
  hostname: string
  status: 'pending' | 'active' | 'moved' | 'deleted'
}

async function addCustomHostname(domain: string): Promise<CloudflareHostnameResponse> {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/custom_hostnames`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        hostname: domain,
        ssl: { method: 'http', type: 'dv' }
      })
    }
  )

  const data = await response.json()
  return data.result
}

async function getHostnameStatus(hostnameId: string): Promise<string> {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/custom_hostnames/${hostnameId}`,
    {
      headers: { 'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}` }
    }
  )

  const data = await response.json()
  return data.result.status
}

async function deleteCustomHostname(hostnameId: string): Promise<void> {
  await fetch(
    `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/custom_hostnames/${hostnameId}`,
    {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}` }
    }
  )
}
```

---

## Error Codes Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `invalid_domain` | 400 | Domain format is invalid or is an apex domain |
| `domain_taken` | 409 | Domain is already claimed by another tenant |
| `reserved_domain` | 400 | Domain uses a reserved subdomain prefix |
| `cloudflare_error` | 502 | Error communicating with Cloudflare API |
| `not_authenticated` | 401 | User is not authenticated |
| `not_authorized` | 403 | User does not own this tenant |
