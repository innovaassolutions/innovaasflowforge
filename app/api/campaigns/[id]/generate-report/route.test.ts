/**
 * Report Generation API Route Tests
 *
 * Unit tests for POST /api/campaigns/[id]/generate-report
 *
 * Test Coverage:
 * - Campaign ID validation
 * - Authentication checks
 * - Authorization (organization access)
 * - Synthesis data validation
 * - Token generation and UPSERT logic
 * - Regeneration count incrementing
 * - Error cases and status codes
 *
 * Story: 1.1 - Database & API Foundation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
};

// Mock token generator
vi.mock('@/lib/utils/token-generator', () => ({
  generateAccessToken: vi.fn(() => 'mock-token-abc123xyz'),
}));

// Mock Supabase server
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

describe('POST /api/campaigns/[id]/generate-report', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // VALIDATION TESTS
  // ============================================================================

  it('should return 400 for invalid campaign ID format', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/campaigns/invalid-id/generate-report',
      { method: 'POST' }
    );

    const response = await POST(request, { params: { id: 'invalid-id' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid campaign ID format');
  });

  it('should return 400 for empty campaign ID', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/campaigns//generate-report',
      { method: 'POST' }
    );

    const response = await POST(request, { params: { id: '' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid campaign ID format');
  });

  // ============================================================================
  // AUTHENTICATION TESTS
  // ============================================================================

  it('should return 401 when user is not authenticated', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' },
    });

    const request = new NextRequest(
      'http://localhost:3000/api/campaigns/550e8400-e29b-41d4-a716-446655440000/generate-report',
      { method: 'POST' }
    );

    const response = await POST(request, {
      params: { id: '550e8400-e29b-41d4-a716-446655440000' },
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Authentication required');
  });

  // ============================================================================
  // AUTHORIZATION TESTS
  // ============================================================================

  it('should return 404 when campaign does not exist', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Not found' },
    });

    mockSupabaseClient.from.mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      single: mockSingle,
    });

    const request = new NextRequest(
      'http://localhost:3000/api/campaigns/550e8400-e29b-41d4-a716-446655440000/generate-report',
      { method: 'POST' }
    );

    const response = await POST(request, {
      params: { id: '550e8400-e29b-41d4-a716-446655440000' },
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Campaign not found or access denied');
  });

  it('should return 404 when user does not have access to campaign', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Access denied' },
    });

    mockSupabaseClient.from.mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      single: mockSingle,
    });

    const request = new NextRequest(
      'http://localhost:3000/api/campaigns/550e8400-e29b-41d4-a716-446655440000/generate-report',
      { method: 'POST' }
    );

    const response = await POST(request, {
      params: { id: '550e8400-e29b-41d4-a716-446655440000' },
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Campaign not found or access denied');
  });

  // ============================================================================
  // SYNTHESIS VALIDATION TESTS
  // ============================================================================

  it('should return 400 when campaign has no synthesis data', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Test Campaign',
        synthesis: null,
        report_tier: 'standard',
        created_by: 'user-123',
        company_profile_id: 'company-456',
      },
      error: null,
    });

    mockSupabaseClient.from.mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      single: mockSingle,
    });

    const request = new NextRequest(
      'http://localhost:3000/api/campaigns/550e8400-e29b-41d4-a716-446655440000/generate-report',
      { method: 'POST' }
    );

    const response = await POST(request, {
      params: { id: '550e8400-e29b-41d4-a716-446655440000' },
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Campaign synthesis not yet generated');
  });

  it('should return 400 when campaign synthesis is empty object', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Test Campaign',
        synthesis: {},
        report_tier: 'standard',
        created_by: 'user-123',
        company_profile_id: 'company-456',
      },
      error: null,
    });

    mockSupabaseClient.from.mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      single: mockSingle,
    });

    const request = new NextRequest(
      'http://localhost:3000/api/campaigns/550e8400-e29b-41d4-a716-446655440000/generate-report',
      { method: 'POST' }
    );

    const response = await POST(request, {
      params: { id: '550e8400-e29b-41d4-a716-446655440000' },
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Campaign synthesis not yet generated');
  });

  // ============================================================================
  // SUCCESS TESTS - NEW REPORT
  // ============================================================================

  it('should create new report with 201 status when no existing report', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    const mockCampaignQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Test Campaign',
          synthesis: { technology: 3, process: 4, organization: 2 },
          report_tier: 'standard',
          created_by: 'user-123',
          company_profile_id: 'company-456',
        },
        error: null,
      }),
    };

    const mockExistingReportQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    };

    const mockUpsertQuery = {
      upsert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'report-789',
          access_token: 'mock-token-abc123xyz',
          regeneration_count: 0,
        },
        error: null,
      }),
    };

    mockSupabaseClient.from
      .mockReturnValueOnce(mockCampaignQuery)
      .mockReturnValueOnce(mockExistingReportQuery)
      .mockReturnValueOnce(mockUpsertQuery);

    const request = new NextRequest(
      'http://localhost:3000/api/campaigns/550e8400-e29b-41d4-a716-446655440000/generate-report',
      { method: 'POST' }
    );

    const response = await POST(request, {
      params: { id: '550e8400-e29b-41d4-a716-446655440000' },
    });
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.report.access_token).toBe('mock-token-abc123xyz');
    expect(data.report.is_regeneration).toBe(false);
    expect(data.report.regeneration_count).toBe(0);
    expect(data.report.url).toContain('/reports/mock-token-abc123xyz');
  });

  // ============================================================================
  // SUCCESS TESTS - REPORT REGENERATION
  // ============================================================================

  it('should update existing report with 200 status and increment regeneration count', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    const mockCampaignQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Test Campaign',
          synthesis: { technology: 3, process: 4, organization: 2 },
          report_tier: 'premium',
          created_by: 'user-123',
          company_profile_id: 'company-456',
        },
        error: null,
      }),
    };

    const mockExistingReportQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: {
          id: 'existing-report-789',
          regeneration_count: 2,
        },
        error: null,
      }),
    };

    const mockUpsertQuery = {
      upsert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'existing-report-789',
          access_token: 'mock-token-abc123xyz',
          regeneration_count: 3,
        },
        error: null,
      }),
    };

    mockSupabaseClient.from
      .mockReturnValueOnce(mockCampaignQuery)
      .mockReturnValueOnce(mockExistingReportQuery)
      .mockReturnValueOnce(mockUpsertQuery);

    const request = new NextRequest(
      'http://localhost:3000/api/campaigns/550e8400-e29b-41d4-a716-446655440000/generate-report',
      { method: 'POST' }
    );

    const response = await POST(request, {
      params: { id: '550e8400-e29b-41d4-a716-446655440000' },
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.report.is_regeneration).toBe(true);
    expect(data.report.regeneration_count).toBe(3);
  });

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================

  it('should return 500 when upsert operation fails', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    const mockCampaignQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Test Campaign',
          synthesis: { technology: 3, process: 4, organization: 2 },
          report_tier: 'standard',
          created_by: 'user-123',
          company_profile_id: 'company-456',
        },
        error: null,
      }),
    };

    const mockExistingReportQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    };

    const mockUpsertQuery = {
      upsert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database constraint violation' },
      }),
    };

    mockSupabaseClient.from
      .mockReturnValueOnce(mockCampaignQuery)
      .mockReturnValueOnce(mockExistingReportQuery)
      .mockReturnValueOnce(mockUpsertQuery);

    const request = new NextRequest(
      'http://localhost:3000/api/campaigns/550e8400-e29b-41d4-a716-446655440000/generate-report',
      { method: 'POST' }
    );

    const response = await POST(request, {
      params: { id: '550e8400-e29b-41d4-a716-446655440000' },
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to generate report');
  });
});
