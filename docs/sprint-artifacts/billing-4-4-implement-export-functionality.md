# Story 4.4: Implement Export Functionality

**Epic:** billing-epic-4-admin-dashboard (Admin Dashboard Enhancement)
**Story ID:** billing-4-4-implement-export-functionality
**Status:** done
**Created:** 2026-01-13

---

## Story

**As a** platform admin,
**I want** to export usage and cost data,
**So that** I can analyze it externally or share with accounting.

---

## Acceptance Criteria

### AC1: Export Button
**Given** the admin is on the billing dashboard
**When** they click "Export"
**Then** a modal appears with export options

### AC2: Export Options
**Given** the export modal is open
**When** configuring export
**Then** options include:
- Format: CSV (default), JSON
- Date range: pre-filled with current filter
- Data scope: All events, By tenant, By model

### AC3: CSV Export
**Given** CSV format is selected
**When** export is confirmed
**Then** a CSV file downloads with columns:
- date, tenant_name, model_used, input_tokens, output_tokens, cost_cents

### AC4: JSON Export
**Given** JSON format is selected
**When** export is confirmed
**Then** a JSON file downloads with structured data

### AC5: Large Export Handling
**Given** the export contains > 10,000 records
**When** exporting
**Then** the export streams efficiently
**And** doesn't timeout

---

## Tasks / Subtasks

- [x] **1. Create export API endpoint**
  - [x] 1.1 Create GET `/api/admin/billing/export`
  - [x] 1.2 Accept format, dateRange parameters
  - [x] 1.3 Return appropriate content type

- [x] **2. Implement CSV generation**
  - [x] 2.1 Create CSV formatter
  - [x] 2.2 Include all required columns
  - [x] 2.3 Proper CSV escaping

- [x] **3. Implement JSON generation**
  - [x] 3.1 Structure data appropriately
  - [x] 3.2 Include metadata
  - [x] 3.3 Format for readability

- [x] **4. Create export modal UI**
  - [x] 4.1 Create modal component
  - [x] 4.2 Format selection (CSV/JSON)
  - [x] 4.3 Date range info display
  - [x] 4.4 Export contents preview

- [x] **5. Handle file download**
  - [x] 5.1 Trigger browser download
  - [x] 5.2 Use appropriate filename
  - [x] 5.3 Show loading state

---

## Implementation Details

### API Endpoint Created
- `app/api/admin/billing/export/route.ts`
- GET endpoint accepting `format` (csv|json), `startDate`, `endDate` parameters
- Returns file with proper Content-Type and Content-Disposition headers

### CSV Export Format
```csv
date,time,tenant_id,tenant_name,model_used,event_type,input_tokens,output_tokens,total_tokens,cost_cents,cost_dollars
2026-01-15,14:30:25,abc123,Acme Corp,claude-sonnet-4-20250514,llm_call,1500,800,2300,5,0.0500
```

### JSON Export Format
```json
{
  "metadata": {
    "exportedAt": "2026-01-13T12:00:00Z",
    "dateRange": { "start": "2026-01-01", "end": "2026-01-13" },
    "totalRecords": 1500
  },
  "data": [...]
}
```

### UI Changes
- Added Export button to dashboard header
- Added export modal with:
  - Format selection (radio buttons)
  - Date range info (uses current filter)
  - Export contents preview
  - Cancel and Export buttons
  - Loading state during export

### Filename Format
- `billing-export-YYYY-MM-DD.csv`
- `billing-export-YYYY-MM-DD.json`

---

## Dev Notes

### Export Function

```typescript
async function handleExport() {
  const params = new URLSearchParams()
  params.set('format', exportFormat)
  if (startDate) params.set('startDate', startDate)
  if (endDate) params.set('endDate', endDate)

  const response = await fetch(`/api/admin/billing/export?${params.toString()}`)
  const blob = await response.blob()

  // Trigger download
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
}
```

### CSV Escaping

```typescript
const escapeCsv = (val: string) =>
  val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val
```

---

## Definition of Done

- [x] Export button on dashboard
- [x] Modal with format options
- [x] CSV export works
- [x] JSON export works
- [x] Date range filter respected
- [x] File downloads correctly
- [x] Loading state shown

---

_Story Version 1.1 | Created 2026-01-13 | Completed 2026-01-13_
