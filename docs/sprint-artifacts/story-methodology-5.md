# Story: UI Integration

**Story ID:** METHODOLOGY-5
**Epic:** [Methodology Configuration System](../epics.md)
**Tech Spec:** [tech-spec.md](../tech-spec.md)
**Priority:** P1 - High
**Status:** Ready
**Depends On:** METHODOLOGY-3, METHODOLOGY-4

---

## User Story

**As a** coach
**I want** to select which methodology to use when inviting a client
**So that** I can use my preferred leadership assessment framework

## Context

Coaches currently have no way to select a methodology - the archetype system is hardcoded. We need a methodology selector component and integration into the invite flow.

## Tech Spec Reference

See [tech-spec.md](../tech-spec.md) sections:
- UX/UI Considerations
- Source Tree Changes > UI components

---

## Acceptance Criteria

- [ ] **AC1:** MethodologySelector component shows available methodologies
- [ ] **AC2:** Methodologies grouped by category (coaching, consulting, education)
- [ ] **AC3:** System defaults shown with badge/indicator
- [ ] **AC4:** Coach invite page includes methodology selection
- [ ] **AC5:** Selected methodology stored with session/campaign
- [ ] **AC6:** Methodology list page accessible from dashboard navigation
- [ ] **AC7:** Component follows existing shadcn/ui patterns

---

## Tasks

### Task 1: Create MethodologySelector Component
**File:** `components/MethodologySelector.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Methodology } from '@/types/methodology'

interface MethodologySelectorProps {
  value?: string
  onValueChange: (methodologyId: string) => void
  category?: 'coaching' | 'consulting' | 'education' | 'custom'
  disabled?: boolean
}

export function MethodologySelector({
  value,
  onValueChange,
  category,
  disabled = false
}: MethodologySelectorProps) {
  const [methodologies, setMethodologies] = useState<Methodology[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMethodologies() {
      try {
        const response = await fetch('/api/methodologies')
        const data = await response.json()
        
        if (data.success) {
          let filtered = data.methodologies
          if (category) {
            filtered = filtered.filter((m: Methodology) => m.category === category)
          }
          setMethodologies(filtered)
        }
      } catch (error) {
        console.error('Failed to fetch methodologies:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMethodologies()
  }, [category])

  // Group methodologies by category
  const groupedMethodologies = methodologies.reduce((acc, m) => {
    if (!acc[m.category]) acc[m.category] = []
    acc[m.category].push(m)
    return acc
  }, {} as Record<string, Methodology[]>)

  const categoryLabels: Record<string, string> = {
    coaching: 'Coaching Methodologies',
    consulting: 'Consulting Assessments',
    education: 'Education Surveys',
    custom: 'Custom Methodologies'
  }

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Loading methodologies..." />
        </SelectTrigger>
      </Select>
    )
  }

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a methodology" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(groupedMethodologies).map(([cat, items]) => (
          <SelectGroup key={cat}>
            <SelectLabel>{categoryLabels[cat] || cat}</SelectLabel>
            {items.map((methodology) => (
              <SelectItem key={methodology.id} value={methodology.id}>
                <div className="flex items-center gap-2">
                  <span>{methodology.name}</span>
                  {methodology.is_system_default && (
                    <Badge variant="secondary" className="text-xs">
                      Default
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}
```

### Task 2: Update Coach Invite Page
**File:** `app/dashboard/coaching/invite/page.tsx` (modify existing)

Add methodology selection before generating invite link:

```typescript
// Add to imports
import { MethodologySelector } from '@/components/MethodologySelector'

// Add to state
const [selectedMethodology, setSelectedMethodology] = useState<string>('')

// Add to form (before submit button)
<div className="space-y-2">
  <label className="text-sm font-medium text-foreground">
    Assessment Methodology
  </label>
  <MethodologySelector
    value={selectedMethodology}
    onValueChange={setSelectedMethodology}
    category="coaching"
  />
  <p className="text-xs text-muted-foreground">
    Select the methodology to use for this client's assessment
  </p>
</div>

// Update submit handler to include methodology
const inviteData = {
  ...existingData,
  methodology_id: selectedMethodology
}
```

### Task 3: Create Methodology List Page
**File:** `app/dashboard/methodologies/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Plus, Copy, Trash2, Settings } from 'lucide-react'
import { Methodology } from '@/types/methodology'

export default function MethodologiesPage() {
  const [methodologies, setMethodologies] = useState<Methodology[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMethodologies()
  }, [])

  async function fetchMethodologies() {
    try {
      const response = await fetch('/api/methodologies')
      const data = await response.json()
      if (data.success) {
        setMethodologies(data.methodologies)
      }
    } catch (error) {
      console.error('Failed to fetch methodologies:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleClone(id: string) {
    try {
      const response = await fetch(`/api/methodologies/clone/${id}`, {
        method: 'POST'
      })
      if (response.ok) {
        fetchMethodologies()
      }
    } catch (error) {
      console.error('Failed to clone methodology:', error)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this methodology?')) return
    
    try {
      const response = await fetch(`/api/methodologies/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        fetchMethodologies()
      }
    } catch (error) {
      console.error('Failed to delete methodology:', error)
    }
  }

  const categoryColors: Record<string, string> = {
    coaching: 'bg-blue-100 text-blue-800',
    consulting: 'bg-green-100 text-green-800',
    education: 'bg-purple-100 text-purple-800',
    custom: 'bg-orange-100 text-orange-800'
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Methodologies</h1>
          <p className="text-muted-foreground">
            Manage your interview methodologies and assessment frameworks
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          Create Methodology
        </button>
      </div>

      <div className="grid gap-4">
        {methodologies.map((methodology) => (
          <div
            key={methodology.id}
            className="bg-card border border-border rounded-lg p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {methodology.name}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[methodology.category]}`}>
                    {methodology.category}
                  </span>
                  {methodology.is_system_default && (
                    <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs">
                      System Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {methodology.description || 'No description'}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{methodology.config.questions?.length || 0} questions</span>
                  <span>{methodology.config.phases?.length || 0} phases</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {methodology.is_system_default ? (
                  <button
                    onClick={() => handleClone(methodology.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Clone
                  </button>
                ) : (
                  <>
                    <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors">
                      <Settings className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(methodology.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {methodologies.length === 0 && (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground mb-4">No methodologies found</p>
          <button className="text-primary hover:underline">
            Create your first methodology
          </button>
        </div>
      )}
    </div>
  )
}
```

### Task 4: Add Navigation Item
**File:** `components/DashboardSidebar.tsx` (modify existing)

Add to coach nav items:
```typescript
const coachNavItems = isCoach ? [
  {
    name: 'Clients',
    href: '/dashboard/coaching/clients',
    icon: UserCircle,
    matchPaths: ['/dashboard/coaching/clients']
  },
  {
    name: 'Methodologies',
    href: '/dashboard/methodologies',
    icon: BookOpen, // Add import
    matchPaths: ['/dashboard/methodologies']
  }
] : []
```

---

## Definition of Done

- [ ] MethodologySelector component created and working
- [ ] Methodologies grouped by category in dropdown
- [ ] System defaults clearly indicated
- [ ] Coach invite page includes methodology selection
- [ ] Methodology list page accessible and functional
- [ ] Clone and delete operations work
- [ ] Navigation item added for coaches
- [ ] All UI follows existing patterns
