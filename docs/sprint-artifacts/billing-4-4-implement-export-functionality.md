# Story 4.4: Implement Export Functionality

**Epic:** billing-epic-4-admin-dashboard (Admin Dashboard Enhancement)
**Story ID:** billing-4-4-implement-export-functionality
**Status:** drafted
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

- [ ] **1. Create export API endpoint**
  - [ ] 1.1 Create GET `/api/admin/billing/export`
  - [ ] 1.2 Accept format, dateRange, scope parameters
  - [ ] 1.3 Return appropriate content type

- [ ] **2. Implement CSV generation**
  - [ ] 2.1 Create CSV formatter
  - [ ] 2.2 Include all required columns
  - [ ] 2.3 Stream for large datasets

- [ ] **3. Implement JSON generation**
  - [ ] 3.1 Structure data appropriately
  - [ ] 3.2 Include metadata
  - [ ] 3.3 Stream for large datasets

- [ ] **4. Create export modal UI**
  - [ ] 4.1 Create ExportModal component
  - [ ] 4.2 Format selection
  - [ ] 4.3 Date range selection
  - [ ] 4.4 Scope selection

- [ ] **5. Handle file download**
  - [ ] 5.1 Trigger browser download
  - [ ] 5.2 Use appropriate filename
  - [ ] 5.3 Show progress for large exports

---

## Dev Notes

### API Endpoint

```typescript
// GET /api/admin/billing/export
interface ExportParams {
  format: 'csv' | 'json';
  startDate: string;
  endDate: string;
  scope: 'all' | 'by_tenant' | 'by_model';
}

// Response headers
Content-Type: 'text/csv' | 'application/json'
Content-Disposition: 'attachment; filename="billing-export-2026-01-13.csv"'
```

### CSV Format

```csv
date,tenant_name,model_used,input_tokens,output_tokens,cost_cents
2026-01-15,Acme Corp,claude-sonnet-4-20250514,1500,800,5
2026-01-15,Acme Corp,claude-sonnet-4-20250514,2000,1200,8
```

### JSON Format

```json
{
  "metadata": {
    "exportedAt": "2026-01-13T12:00:00Z",
    "dateRange": { "start": "2026-01-01", "end": "2026-01-13" },
    "totalRecords": 1500
  },
  "data": [
    {
      "date": "2026-01-15",
      "tenantName": "Acme Corp",
      "modelUsed": "claude-sonnet-4-20250514",
      "inputTokens": 1500,
      "outputTokens": 800,
      "costCents": 5
    }
  ]
}
```

### Streaming for Large Exports

```typescript
// Use streaming for large datasets
export async function GET(request: Request) {
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Write CSV header
  await writer.write('date,tenant_name,model_used,...\n');

  // Stream rows in batches
  for await (const batch of fetchBatches()) {
    for (const row of batch) {
      await writer.write(formatRow(row));
    }
  }

  await writer.close();

  return new Response(stream.readable, {
    headers: { 'Content-Type': 'text/csv' }
  });
}
```

### Prerequisites
- None (uses existing data)

---

## Definition of Done

- [ ] Export button on dashboard
- [ ] Modal with options
- [ ] CSV export works
- [ ] JSON export works
- [ ] Large exports don't timeout
- [ ] File downloads correctly

---

_Story Version 1.0 | Created 2026-01-13_
