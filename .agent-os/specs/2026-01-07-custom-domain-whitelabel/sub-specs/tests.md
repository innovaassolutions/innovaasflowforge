# Tests Specification

This is the tests coverage details for the spec detailed in @.agent-os/specs/2026-01-07-custom-domain-whitelabel/spec.md

> Created: 2026-01-07
> Version: 1.0.0

## Test Coverage Overview

| Category | Test Count | Priority |
|----------|------------|----------|
| Unit Tests | 12 | High |
| Integration Tests | 8 | High |
| E2E Tests | 5 | Medium |

---

## Unit Tests

### Domain Validation (`lib/utils/domain-validation.ts`)

```typescript
describe('isValidSubdomain', () => {
  it('should accept valid subdomain: assessment.example.com', () => {
    expect(isValidSubdomain('assessment.example.com')).toBe(true)
  })

  it('should accept multi-level subdomain: coach.assessment.example.com', () => {
    expect(isValidSubdomain('coach.assessment.example.com')).toBe(true)
  })

  it('should reject apex domain: example.com', () => {
    expect(isValidSubdomain('example.com')).toBe(false)
  })

  it('should reject www subdomain: www.example.com', () => {
    expect(isValidSubdomain('www.example.com')).toBe(false)
  })

  it('should reject reserved subdomains: mail.example.com', () => {
    expect(isValidSubdomain('mail.example.com')).toBe(false)
  })

  it('should reject invalid characters: test@example.com', () => {
    expect(isValidSubdomain('test@example.com')).toBe(false)
  })

  it('should reject domains with http prefix', () => {
    expect(isValidSubdomain('http://assessment.example.com')).toBe(false)
  })
})
```

### Cloudflare Service (`lib/services/cloudflare-domains.ts`)

```typescript
describe('CloudflareDomainService', () => {
  describe('addCustomHostname', () => {
    it('should call Cloudflare API with correct parameters', async () => {
      // Mock fetch
      const mockFetch = jest.fn().mockResolvedValue({
        json: () => ({ success: true, result: { id: 'cf_123', status: 'pending' } })
      })

      const result = await addCustomHostname('assessment.example.com')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/custom_hostnames'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('assessment.example.com')
        })
      )
      expect(result.id).toBe('cf_123')
    })

    it('should throw on Cloudflare API error', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        json: () => ({ success: false, errors: [{ message: 'Rate limited' }] })
      })

      await expect(addCustomHostname('test.example.com'))
        .rejects.toThrow('Cloudflare API error')
    })
  })

  describe('getHostnameStatus', () => {
    it('should return status from Cloudflare response', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        json: () => ({ result: { status: 'active' } })
      })

      const status = await getHostnameStatus('cf_123')
      expect(status).toBe('active')
    })
  })
})
```

### Middleware Tenant Lookup (`lib/services/tenant-lookup.ts`)

```typescript
describe('lookupTenantByDomain', () => {
  it('should return tenant for verified custom domain', async () => {
    // Seed: tenant with verified domain
    const tenant = await lookupTenantByDomain('assessment.leadingwithmeaning.com')

    expect(tenant).not.toBeNull()
    expect(tenant.slug).toBe('leadingwithmeaning')
  })

  it('should return null for unverified domain', async () => {
    // Seed: tenant with unverified domain
    const tenant = await lookupTenantByDomain('pending.example.com')

    expect(tenant).toBeNull()
  })

  it('should return null for unknown domain', async () => {
    const tenant = await lookupTenantByDomain('unknown.example.com')

    expect(tenant).toBeNull()
  })

  it('should return null for inactive tenant', async () => {
    // Seed: inactive tenant with verified domain
    const tenant = await lookupTenantByDomain('inactive.example.com')

    expect(tenant).toBeNull()
  })
})
```

---

## Integration Tests

### API: POST /api/tenant/domain

```typescript
describe('POST /api/tenant/domain', () => {
  it('should configure domain and return DNS instructions', async () => {
    const response = await request(app)
      .post('/api/tenant/domain')
      .set('Authorization', `Bearer ${tenantToken}`)
      .send({ domain: 'assessment.example.com' })

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.status).toBe('pending')
    expect(response.body.dns_instructions.record_type).toBe('CNAME')
  })

  it('should reject apex domain', async () => {
    const response = await request(app)
      .post('/api/tenant/domain')
      .set('Authorization', `Bearer ${tenantToken}`)
      .send({ domain: 'example.com' })

    expect(response.status).toBe(400)
    expect(response.body.error).toBe('invalid_domain')
  })

  it('should reject already-claimed domain', async () => {
    // Another tenant already has this domain
    const response = await request(app)
      .post('/api/tenant/domain')
      .set('Authorization', `Bearer ${tenantToken}`)
      .send({ domain: 'claimed.example.com' })

    expect(response.status).toBe(409)
    expect(response.body.error).toBe('domain_taken')
  })

  it('should require authentication', async () => {
    const response = await request(app)
      .post('/api/tenant/domain')
      .send({ domain: 'test.example.com' })

    expect(response.status).toBe(401)
  })
})
```

### API: GET /api/tenant/domain/status

```typescript
describe('GET /api/tenant/domain/status', () => {
  it('should return pending status during verification', async () => {
    // Setup: tenant with pending domain
    const response = await request(app)
      .get('/api/tenant/domain/status')
      .set('Authorization', `Bearer ${pendingTenantToken}`)

    expect(response.body.status).toBe('pending')
    expect(response.body.dns_instructions).toBeDefined()
  })

  it('should return verified when Cloudflare confirms', async () => {
    // Mock Cloudflare returning 'active'
    const response = await request(app)
      .get('/api/tenant/domain/status')
      .set('Authorization', `Bearer ${verifiedTenantToken}`)

    expect(response.body.status).toBe('verified')
    expect(response.body.url).toContain('https://')
  })

  it('should return failed after 24 hour timeout', async () => {
    // Setup: tenant with stale pending domain
    const response = await request(app)
      .get('/api/tenant/domain/status')
      .set('Authorization', `Bearer ${timedOutTenantToken}`)

    expect(response.body.status).toBe('failed')
  })
})
```

### Middleware: Custom Domain Routing

```typescript
describe('Custom Domain Middleware', () => {
  it('should rewrite /results/token to /coach/slug/results/token', async () => {
    const response = await request(app)
      .get('/results/abc123')
      .set('Host', 'assessment.leadingwithmeaning.com')

    // Should serve the coach results page
    expect(response.status).toBe(200)
    // Check that correct tenant branding is applied
    expect(response.text).toContain('Leading with Meaning')
  })

  it('should serve landing page at root', async () => {
    const response = await request(app)
      .get('/')
      .set('Host', 'assessment.leadingwithmeaning.com')

    expect(response.status).toBe(200)
  })

  it('should redirect unknown domains to innovaas.co', async () => {
    const response = await request(app)
      .get('/results/abc123')
      .set('Host', 'unknown.example.com')

    expect(response.status).toBe(302)
    expect(response.headers.location).toContain('innovaas.co')
  })

  it('should not affect innovaas.co URLs', async () => {
    const response = await request(app)
      .get('/coach/leadingwithmeaning/results/abc123')
      .set('Host', 'www.innovaas.co')

    expect(response.status).toBe(200)
  })
})
```

---

## E2E Tests (Playwright)

```typescript
describe('Custom Domain Configuration E2E', () => {
  test('tenant can configure custom domain in branding settings', async ({ page }) => {
    // Login as tenant
    await page.goto('/auth/login')
    await login(page, tenantCredentials)

    // Navigate to branding settings
    await page.goto('/dashboard/settings/branding')

    // Enter custom domain
    await page.fill('[data-testid="custom-domain-input"]', 'assessment.mycoaching.com')
    await page.click('[data-testid="configure-domain-button"]')

    // Should show DNS instructions
    await expect(page.locator('[data-testid="dns-instructions"]')).toBeVisible()
    await expect(page.locator('text=CNAME')).toBeVisible()
    await expect(page.locator('[data-testid="domain-status"]')).toContainText('Pending')
  })

  test('tenant can remove custom domain', async ({ page }) => {
    // Setup: tenant with configured domain
    await page.goto('/dashboard/settings/branding')

    await page.click('[data-testid="remove-domain-button"]')
    await page.click('[data-testid="confirm-remove"]')

    await expect(page.locator('[data-testid="domain-status"]')).not.toBeVisible()
  })

  test('verified domain shows in branding settings', async ({ page }) => {
    // Setup: tenant with verified domain
    await page.goto('/dashboard/settings/branding')

    await expect(page.locator('[data-testid="domain-status"]')).toContainText('Verified')
    await expect(page.locator('[data-testid="custom-domain-url"]')).toContainText('https://')
  })
})
```

---

## Mocking Requirements

### Cloudflare API Mock

```typescript
// __mocks__/cloudflare.ts
export const mockCloudflareApi = {
  addHostname: jest.fn().mockResolvedValue({
    id: 'cf_mock_123',
    hostname: 'test.example.com',
    status: 'pending'
  }),

  getStatus: jest.fn().mockResolvedValue('pending'),

  deleteHostname: jest.fn().mockResolvedValue(undefined),

  // Helper to simulate verification completion
  simulateVerification: () => {
    mockCloudflareApi.getStatus.mockResolvedValue('active')
  }
}
```

### Supabase Mock for Middleware Tests

```typescript
// Use in-memory database or mock for middleware tenant lookup
const mockTenants = [
  {
    id: '1',
    slug: 'leadingwithmeaning',
    custom_domain: 'assessment.leadingwithmeaning.com',
    domain_verified: true,
    is_active: true
  }
]

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: mockTenants[0] })
        })
      })
    })
  })
}))
```

---

## Test Data Fixtures

```typescript
// fixtures/tenants.ts
export const testTenants = {
  verifiedDomain: {
    id: 'tenant-1',
    slug: 'leadingwithmeaning',
    custom_domain: 'assessment.leadingwithmeaning.com',
    domain_verified: true,
    cloudflare_hostname_id: 'cf_123',
    is_active: true
  },
  pendingDomain: {
    id: 'tenant-2',
    slug: 'pendingcoach',
    custom_domain: 'pending.example.com',
    domain_verified: false,
    cloudflare_hostname_id: 'cf_456',
    domain_verification_started_at: new Date().toISOString(),
    is_active: true
  },
  noDomain: {
    id: 'tenant-3',
    slug: 'nodomaincoach',
    custom_domain: null,
    domain_verified: false,
    is_active: true
  }
}
```
