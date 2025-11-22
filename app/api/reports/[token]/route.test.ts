/**
 * Report Access API Route Tests
 *
 * Unit tests for GET /api/reports/[token]
 *
 * Test Coverage:
 * - Token format validation
 * - Active report retrieval
 * - Inactive report rejection
 * - Access tracking (count increment, timestamp update)
 * - Error cases and status codes
 *
 * Story: 1.1 - Database & API Foundation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(),
};

// Mock Supabase server
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

// Mock token generator (isValidTokenFormat)
vi.mock('@/lib/utils/token-generator', () => ({
  isValidTokenFormat: vi.fn((token: string) => {
    // Valid format: exactly 43 base64url characters
    const base64urlPattern = /^[A-Za-z0-9_-]{43}$/;
    return base64urlPattern.test(token);
  }),
}));

describe('GET /api/reports/[token]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // TOKEN VALIDATION TESTS
  // ============================================================================

  it('should return 400 for invalid token format (too short)', async () => {
    const request = new NextRequest('http://localhost:3000/api/reports/short');

    const response = await GET(request, { params: { token: 'short' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid access token format');
  });

  it('should return 400 for invalid token format (too long)', async () => {
    const longToken = 'a'.repeat(50);
    const request = new NextRequest(
      `http://localhost:3000/api/reports/${longToken}`
    );

    const response = await GET(request, { params: { token: longToken } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid access token format');
  });

  it('should return 400 for token with invalid characters', async () => {
    const invalidToken = 'kJ8x3vL2mN9qR5tY7wZ1aB4cD6eF8gH0iK2lM4nO+pQ'; // Contains +
    const request = new NextRequest(
      `http://localhost:3000/api/reports/${invalidToken}`
    );

    const response = await GET(request, { params: { token: invalidToken } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid access token format');
  });

  it('should return 400 for empty token', async () => {
    const request = new NextRequest('http://localhost:3000/api/reports/');

    const response = await GET(request, { params: { token: '' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid access token format');
  });

  // ============================================================================
  // REPORT RETRIEVAL TESTS
  // ============================================================================

  it('should return 404 when report does not exist', async () => {
    const validToken = 'kJ8x3vL2mN9qR5tY7wZ1aB4cD6eF8gH0iK2lM4nO6pQ';

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
      `http://localhost:3000/api/reports/${validToken}`
    );

    const response = await GET(request, { params: { token: validToken } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Report not found or access denied');
  });

  it('should return 404 when report is inactive', async () => {
    const validToken = 'kJ8x3vL2mN9qR5tY7wZ1aB4cD6eF8gH0iK2lM4nO6pQ';

    // Query filters by is_active=true, so inactive reports return no results
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: null,
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
      `http://localhost:3000/api/reports/${validToken}`
    );

    const response = await GET(request, { params: { token: validToken } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Report not found or access denied');
  });

  // ============================================================================
  // SUCCESS TESTS
  // ============================================================================

  it('should successfully retrieve active report with all data', async () => {
    const validToken = 'kJ8x3vL2mN9qR5tY7wZ1aB4cD6eF8gH0iK2lM4nO6pQ';

    const mockReportData = {
      id: 'report-123',
      campaign_id: 'campaign-456',
      report_tier: 'premium',
      synthesis_snapshot: {
        technology: { score: 3, insights: ['AI usage'] },
        process: { score: 4, insights: ['Lean manufacturing'] },
        organization: { score: 2, insights: ['Training needs'] },
      },
      consultant_observations: 'Company shows strong process maturity.',
      supporting_documents: [
        {
          name: 'architecture-diagram.pdf',
          url: 'https://storage/docs/arch.pdf',
          uploaded_at: '2025-11-22T10:00:00Z',
          file_type: 'pdf',
        },
      ],
      created_at: '2025-11-22T09:00:00Z',
      regenerated_at: '2025-11-22T15:00:00Z',
      regeneration_count: 2,
      access_count: 5,
      campaigns: {
        name: 'Digital Transformation Assessment',
        description: 'Industry 4.0 readiness for manufacturing',
        company_name: 'Acme Manufacturing',
        company_industry: 'Automotive',
      },
    };

    const mockSelectQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockReportData,
        error: null,
      }),
    };

    const mockUpdateQuery = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    };

    mockSupabaseClient.from
      .mockReturnValueOnce(mockSelectQuery)
      .mockReturnValueOnce(mockUpdateQuery);

    const request = new NextRequest(
      `http://localhost:3000/api/reports/${validToken}`
    );

    const response = await GET(request, { params: { token: validToken } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.report.id).toBe('report-123');
    expect(data.report.tier).toBe('premium');
    expect(data.report.campaign.name).toBe(
      'Digital Transformation Assessment'
    );
    expect(data.report.campaign.company_name).toBe('Acme Manufacturing');
    expect(data.report.synthesis).toEqual(mockReportData.synthesis_snapshot);
    expect(data.report.consultant_observations).toBe(
      'Company shows strong process maturity.'
    );
    expect(data.report.supporting_documents).toHaveLength(1);
    expect(data.report.regeneration_count).toBe(2);
  });

  it('should return report with empty supporting_documents array when null', async () => {
    const validToken = 'kJ8x3vL2mN9qR5tY7wZ1aB4cD6eF8gH0iK2lM4nO6pQ';

    const mockReportData = {
      id: 'report-789',
      campaign_id: 'campaign-101',
      report_tier: 'basic',
      synthesis_snapshot: {
        technology: { score: 2 },
      },
      consultant_observations: null,
      supporting_documents: null, // null in database
      created_at: '2025-11-22T09:00:00Z',
      regenerated_at: null,
      regeneration_count: 0,
      access_count: 0,
      campaigns: {
        name: 'Basic Assessment',
        description: null,
        company_name: 'Small Co',
        company_industry: 'Manufacturing',
      },
    };

    const mockSelectQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockReportData,
        error: null,
      }),
    };

    const mockUpdateQuery = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    };

    mockSupabaseClient.from
      .mockReturnValueOnce(mockSelectQuery)
      .mockReturnValueOnce(mockUpdateQuery);

    const request = new NextRequest(
      `http://localhost:3000/api/reports/${validToken}`
    );

    const response = await GET(request, { params: { token: validToken } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.report.supporting_documents).toEqual([]);
    expect(data.report.consultant_observations).toBeNull();
  });

  // ============================================================================
  // ACCESS TRACKING TESTS
  // ============================================================================

  it('should increment access_count on successful retrieval', async () => {
    const validToken = 'kJ8x3vL2mN9qR5tY7wZ1aB4cD6eF8gH0iK2lM4nO6pQ';

    const mockReportData = {
      id: 'report-123',
      campaign_id: 'campaign-456',
      report_tier: 'informative',
      synthesis_snapshot: {},
      consultant_observations: null,
      supporting_documents: [],
      created_at: '2025-11-22T09:00:00Z',
      regenerated_at: null,
      regeneration_count: 0,
      access_count: 10,
      campaigns: {
        name: 'Test Campaign',
        company_name: 'Test Co',
      },
    };

    const mockSelectQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockReportData,
        error: null,
      }),
    };

    const mockUpdate = vi.fn().mockReturnThis();
    const mockUpdateEq = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    const mockUpdateQuery = {
      update: mockUpdate,
      eq: mockUpdateEq,
    };

    mockSupabaseClient.from
      .mockReturnValueOnce(mockSelectQuery)
      .mockReturnValueOnce(mockUpdateQuery);

    const request = new NextRequest(
      `http://localhost:3000/api/reports/${validToken}`
    );

    await GET(request, { params: { token: validToken } });

    // Verify access tracking was attempted
    expect(mockUpdate).toHaveBeenCalledWith({
      access_count: 11, // Incremented from 10
      last_accessed_at: expect.any(String),
    });
  });

  it('should handle access_count being null (first access)', async () => {
    const validToken = 'kJ8x3vL2mN9qR5tY7wZ1aB4cD6eF8gH0iK2lM4nO6pQ';

    const mockReportData = {
      id: 'report-new',
      campaign_id: 'campaign-new',
      report_tier: 'basic',
      synthesis_snapshot: {},
      consultant_observations: null,
      supporting_documents: [],
      created_at: '2025-11-22T09:00:00Z',
      regenerated_at: null,
      regeneration_count: 0,
      access_count: null, // First access
      campaigns: {
        name: 'New Campaign',
        company_name: 'New Co',
      },
    };

    const mockSelectQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockReportData,
        error: null,
      }),
    };

    const mockUpdate = vi.fn().mockReturnThis();
    const mockUpdateEq = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    const mockUpdateQuery = {
      update: mockUpdate,
      eq: mockUpdateEq,
    };

    mockSupabaseClient.from
      .mockReturnValueOnce(mockSelectQuery)
      .mockReturnValueOnce(mockUpdateQuery);

    const request = new NextRequest(
      `http://localhost:3000/api/reports/${validToken}`
    );

    await GET(request, { params: { token: validToken } });

    // Verify access_count set to 1 for first access
    expect(mockUpdate).toHaveBeenCalledWith({
      access_count: 1,
      last_accessed_at: expect.any(String),
    });
  });

  it('should still return report even if access tracking update fails', async () => {
    const validToken = 'kJ8x3vL2mN9qR5tY7wZ1aB4cD6eF8gH0iK2lM4nO6pQ';

    const mockReportData = {
      id: 'report-123',
      campaign_id: 'campaign-456',
      report_tier: 'premium',
      synthesis_snapshot: {},
      consultant_observations: null,
      supporting_documents: [],
      created_at: '2025-11-22T09:00:00Z',
      regenerated_at: null,
      regeneration_count: 0,
      access_count: 5,
      campaigns: {
        name: 'Test Campaign',
        company_name: 'Test Co',
      },
    };

    const mockSelectQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockReportData,
        error: null,
      }),
    };

    const mockUpdateQuery = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Update failed' }, // Simulate update error
      }),
    };

    mockSupabaseClient.from
      .mockReturnValueOnce(mockSelectQuery)
      .mockReturnValueOnce(mockUpdateQuery);

    const request = new NextRequest(
      `http://localhost:3000/api/reports/${validToken}`
    );

    const response = await GET(request, { params: { token: validToken } });
    const data = await response.json();

    // Should still return 200 even if tracking failed
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.report.id).toBe('report-123');
  });

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================

  it('should return 500 for unexpected database errors', async () => {
    const validToken = 'kJ8x3vL2mN9qR5tY7wZ1aB4cD6eF8gH0iK2lM4nO6pQ';

    mockSupabaseClient.from.mockImplementation(() => {
      throw new Error('Database connection failed');
    });

    const request = new NextRequest(
      `http://localhost:3000/api/reports/${validToken}`
    );

    const response = await GET(request, { params: { token: validToken } });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
    expect(data.details).toBe('Database connection failed');
  });
});
