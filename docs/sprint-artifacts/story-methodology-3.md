# Story: API Layer for Methodologies

**Story ID:** METHODOLOGY-3
**Epic:** [Methodology Configuration System](../epics.md)
**Tech Spec:** [tech-spec.md](../tech-spec.md)
**Priority:** P0 - Critical Path
**Status:** Ready
**Depends On:** METHODOLOGY-1, METHODOLOGY-2

---

## User Story

**As a** tenant user
**I want** API endpoints to manage my methodologies
**So that** I can create, read, update, and delete custom methodologies

## Context

Tenants need CRUD operations for their methodologies. System defaults should be readable by all but not editable. The API should follow existing patterns from `app/api/admin/users/route.ts`.

## Tech Spec Reference

See [tech-spec.md](../tech-spec.md) sections:
- Technical Approach > 4. API Design
- Existing Patterns to Follow

---

## Acceptance Criteria

- [ ] **AC1:** GET /api/methodologies returns tenant's methodologies + system defaults
- [ ] **AC2:** POST /api/methodologies creates new methodology for tenant
- [ ] **AC3:** GET /api/methodologies/[id] returns single methodology
- [ ] **AC4:** PUT /api/methodologies/[id] updates tenant's methodology
- [ ] **AC5:** DELETE /api/methodologies/[id] soft-deletes (is_active=false)
- [ ] **AC6:** POST /api/methodologies/clone/[id] clones system default for tenant
- [ ] **AC7:** All endpoints require authentication
- [ ] **AC8:** Validation errors return 400 with details

---

## Tasks

### Task 1: Create List/Create Route
**File:** `app/api/methodologies/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreateMethodologyInputSchema } from '@/lib/methodology/schema'

/**
 * GET /api/methodologies
 * List methodologies for current tenant + system defaults
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get tenant for current user
    const { data: tenant } = await supabase
      .from('tenant_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    // Get methodologies (RLS handles filtering)
    const { data: methodologies, error } = await supabase
      .from('methodologies')
      .select('*')
      .or(`tenant_id.eq.${tenant?.id},is_system_default.eq.true`)
      .eq('is_active', true)
      .order('is_system_default', { ascending: false })
      .order('name')

    if (error) {
      console.error('Fetch methodologies error:', error)
      return NextResponse.json({ error: 'Failed to fetch methodologies' }, { status: 500 })
    }

    return NextResponse.json({ success: true, methodologies })

  } catch (error) {
    console.error('List methodologies error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/methodologies
 * Create new methodology for current tenant
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get tenant for current user
    const { data: tenant } = await supabase
      .from('tenant_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!tenant) {
      return NextResponse.json(
        { error: 'No tenant profile found. Only tenants can create methodologies.' },
        { status: 403 }
      )
    }

    // Parse and validate input
    const body = await request.json()
    const validation = CreateMethodologyInputSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    // Check slug uniqueness for this tenant
    const { data: existing } = await supabase
      .from('methodologies')
      .select('id')
      .eq('tenant_id', tenant.id)
      .eq('slug', validation.data.slug)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'A methodology with this slug already exists' },
        { status: 400 }
      )
    }

    // Create methodology
    const { data: methodology, error } = await supabase
      .from('methodologies')
      .insert({
        tenant_id: tenant.id,
        slug: validation.data.slug,
        name: validation.data.name,
        description: validation.data.description,
        category: validation.data.category,
        config: validation.data.config,
        created_by: user.id,
        is_system_default: false
      })
      .select()
      .single()

    if (error) {
      console.error('Create methodology error:', error)
      return NextResponse.json({ error: 'Failed to create methodology' }, { status: 500 })
    }

    return NextResponse.json({ success: true, methodology }, { status: 201 })

  } catch (error) {
    console.error('Create methodology error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### Task 2: Create Single Methodology Route
**File:** `app/api/methodologies/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { UpdateMethodologyInputSchema } from '@/lib/methodology/schema'

/**
 * GET /api/methodologies/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: methodology, error } = await supabase
      .from('methodologies')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !methodology) {
      return NextResponse.json({ error: 'Methodology not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, methodology })

  } catch (error) {
    console.error('Get methodology error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/methodologies/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check methodology exists and belongs to user's tenant
    const { data: existing } = await supabase
      .from('methodologies')
      .select('*, tenant_profiles!inner(user_id)')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Methodology not found' }, { status: 404 })
    }

    if (existing.is_system_default) {
      return NextResponse.json(
        { error: 'Cannot modify system default methodology. Clone it first.' },
        { status: 403 }
      )
    }

    // Validate input
    const body = await request.json()
    const validation = UpdateMethodologyInputSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    // Update methodology
    const { data: methodology, error } = await supabase
      .from('methodologies')
      .update(validation.data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update methodology error:', error)
      return NextResponse.json({ error: 'Failed to update methodology' }, { status: 500 })
    }

    return NextResponse.json({ success: true, methodology })

  } catch (error) {
    console.error('Update methodology error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/methodologies/[id]
 * Soft delete by setting is_active = false
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check methodology exists and is not system default
    const { data: existing } = await supabase
      .from('methodologies')
      .select('is_system_default')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Methodology not found' }, { status: 404 })
    }

    if (existing.is_system_default) {
      return NextResponse.json(
        { error: 'Cannot delete system default methodology' },
        { status: 403 }
      )
    }

    // Soft delete
    const { error } = await supabase
      .from('methodologies')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      console.error('Delete methodology error:', error)
      return NextResponse.json({ error: 'Failed to delete methodology' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Methodology deleted' })

  } catch (error) {
    console.error('Delete methodology error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### Task 3: Create Clone Route
**File:** `app/api/methodologies/clone/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/methodologies/clone/[id]
 * Clone a methodology (typically system default) for the current tenant
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get tenant
    const { data: tenant } = await supabase
      .from('tenant_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!tenant) {
      return NextResponse.json({ error: 'No tenant profile found' }, { status: 403 })
    }

    // Get source methodology
    const { data: source } = await supabase
      .from('methodologies')
      .select('*')
      .eq('id', id)
      .single()

    if (!source) {
      return NextResponse.json({ error: 'Source methodology not found' }, { status: 404 })
    }

    // Get new slug from body or generate one
    const body = await request.json().catch(() => ({}))
    const newSlug = body.slug || `${source.slug}-custom`
    const newName = body.name || `${source.name} (Custom)`

    // Check slug uniqueness
    const { data: existing } = await supabase
      .from('methodologies')
      .select('id')
      .eq('tenant_id', tenant.id)
      .eq('slug', newSlug)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'A methodology with this slug already exists. Provide a unique slug.' },
        { status: 400 }
      )
    }

    // Create clone
    const { data: cloned, error } = await supabase
      .from('methodologies')
      .insert({
        tenant_id: tenant.id,
        slug: newSlug,
        name: newName,
        description: source.description,
        category: source.category,
        config: source.config,
        created_by: user.id,
        is_system_default: false
      })
      .select()
      .single()

    if (error) {
      console.error('Clone methodology error:', error)
      return NextResponse.json({ error: 'Failed to clone methodology' }, { status: 500 })
    }

    return NextResponse.json({ success: true, methodology: cloned }, { status: 201 })

  } catch (error) {
    console.error('Clone methodology error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## Definition of Done

- [ ] All API routes created and tested
- [ ] Authentication enforced on all endpoints
- [ ] Validation errors return proper format
- [ ] System defaults protected from modification
- [ ] Clone operation works correctly
- [ ] RLS policies verified through API calls
