# Story: Database Foundation for Methodologies

**Story ID:** METHODOLOGY-1
**Epic:** [Methodology Configuration System](../epics.md)
**Tech Spec:** [tech-spec.md](../tech-spec.md)
**Priority:** P0 - Critical Path
**Status:** Ready

---

## User Story

**As a** platform developer
**I want** a database schema for storing interview methodologies
**So that** tenants can have custom methodologies without code changes

## Context

Currently, interview methodologies (Leadership Archetypes, Education Wellbeing, Industry 4.0) are hardcoded in TypeScript files under `lib/agents/`. This story creates the database foundation to store methodology configurations as JSONB, enabling dynamic methodology management.

## Tech Spec Reference

See [tech-spec.md](../tech-spec.md) sections:
- Technical Approach > 1. Database Schema
- Technical Approach > 2. Constitution JSONB Structure

---

## Acceptance Criteria

- [ ] **AC1:** Migration `20260106_005_create_methodologies.sql` creates table with all columns
- [ ] **AC2:** JSONB config column accepts valid methodology structure
- [ ] **AC3:** RLS policy allows tenants to read only their own methodologies
- [ ] **AC4:** RLS policy allows all authenticated users to read system defaults
- [ ] **AC5:** Unique constraint on (tenant_id, slug) prevents duplicate slugs per tenant
- [ ] **AC6:** Indexes exist on tenant_id, category, and is_system_default
- [ ] **AC7:** Database types regenerated with new table

---

## Tasks

### Task 1: Create Migration File
**File:** `supabase/migrations/20260106_005_create_methodologies.sql`

```sql
-- Migration: Create Methodologies Table
-- Purpose: Store interview methodology configurations as JSONB
-- Date: 2026-01-06
-- Epic: Methodology Configuration System

-- ============================================================================
-- CREATE METHODOLOGIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS methodologies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Tenant ownership (NULL for system defaults)
  tenant_id UUID REFERENCES tenant_profiles(id) ON DELETE CASCADE,
  
  -- Identity
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Classification
  category TEXT NOT NULL CHECK (category IN ('coaching', 'consulting', 'education', 'custom')),
  is_system_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Constitution structure (JSONB)
  config JSONB NOT NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT unique_tenant_slug UNIQUE NULLS NOT DISTINCT (tenant_id, slug)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_methodologies_tenant_id 
  ON methodologies(tenant_id) 
  WHERE tenant_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_methodologies_category 
  ON methodologies(category);

CREATE INDEX IF NOT EXISTS idx_methodologies_system_defaults 
  ON methodologies(is_system_default) 
  WHERE is_system_default = true;

CREATE INDEX IF NOT EXISTS idx_methodologies_active 
  ON methodologies(is_active) 
  WHERE is_active = true;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE methodologies ENABLE ROW LEVEL SECURITY;

-- Tenants can view their own methodologies
CREATE POLICY "Tenants can view own methodologies"
  ON methodologies
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT id FROM tenant_profiles WHERE user_id = auth.uid()
    )
  );

-- All authenticated users can view system defaults
CREATE POLICY "All users can view system defaults"
  ON methodologies
  FOR SELECT
  USING (is_system_default = true);

-- Tenants can insert their own methodologies
CREATE POLICY "Tenants can create own methodologies"
  ON methodologies
  FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT id FROM tenant_profiles WHERE user_id = auth.uid()
    )
    AND is_system_default = false
  );

-- Tenants can update their own methodologies
CREATE POLICY "Tenants can update own methodologies"
  ON methodologies
  FOR UPDATE
  USING (
    tenant_id IN (
      SELECT id FROM tenant_profiles WHERE user_id = auth.uid()
    )
    AND is_system_default = false
  );

-- Tenants can delete their own methodologies
CREATE POLICY "Tenants can delete own methodologies"
  ON methodologies
  FOR DELETE
  USING (
    tenant_id IN (
      SELECT id FROM tenant_profiles WHERE user_id = auth.uid()
    )
    AND is_system_default = false
  );

-- Admins can manage all methodologies
CREATE POLICY "Admins can manage all methodologies"
  ON methodologies
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND user_type = 'admin'
    )
  );

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_methodologies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_methodologies_updated_at
  BEFORE UPDATE ON methodologies
  FOR EACH ROW
  EXECUTE FUNCTION update_methodologies_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE methodologies IS 'Interview methodology configurations stored as JSONB';
COMMENT ON COLUMN methodologies.tenant_id IS 'Owner tenant, NULL for system defaults';
COMMENT ON COLUMN methodologies.slug IS 'URL-friendly identifier, unique per tenant';
COMMENT ON COLUMN methodologies.config IS 'Full constitution structure as JSONB';
COMMENT ON COLUMN methodologies.is_system_default IS 'System-provided methodologies visible to all';
```

### Task 2: Run Migration
```bash
supabase db push
```

### Task 3: Regenerate Database Types
```bash
supabase gen types typescript --project-id $PROJECT_ID > types/database.ts
```

### Task 4: Verify Migration
```sql
-- Check table exists
SELECT * FROM methodologies LIMIT 1;

-- Check RLS enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'methodologies';

-- Check indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'methodologies';
```

---

## Definition of Done

- [ ] Migration file created and reviewed
- [ ] Migration applied successfully to database
- [ ] Database types regenerated
- [ ] RLS policies tested with different user types
- [ ] Indexes verified in database
