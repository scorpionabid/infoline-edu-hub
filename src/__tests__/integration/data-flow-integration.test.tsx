import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { Report, ReportTypeValues, REPORT_TYPE_VALUES } from '@/types/report';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    match: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    filter: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation(callback => Promise.resolve(callback({ data: [], error: null }))),
  }
}));

// Test utilities
const mockDataEntry = {
  id: 'test-entry-id',
  school_id: 'test-school-id',
  category_id: 'test-category-id',
  column_id: 'test-column-id',
  value: 'Test Value',
  status: 'pending',
  created_at: '2025-05-20T10:00:00Z',
  updated_at: '2025-05-20T10:00:00Z',
  created_by: 'test-user-id',
  approved_by: null,
  approved_at: null,
  rejected_by: null,
  rejection_reason: null
};

const mockSchool = {
  id: 'test-school-id',
  name: 'Test School',
  region_id: 'test-region-id',
  sector_id: 'test-sector-id',
  status: 'active'
};

const mockReport: Report = {
  id: 'test-report-id',
  title: 'Test Report',
  description: 'Test Description',
  type: REPORT_TYPE_VALUES.BAR as ReportTypeValues,
  content: {},
  created_at: '2025-05-20T10:00:00Z',
  updated_at: '2025-05-20T10:00:00Z',
  created_by: 'test-user-id',
  status: 'draft'
};

// Mock response setup
const setupMockResponse = (data: any) => {
  vi.mocked(supabase.from).mockImplementation(() => ({
    ...supabase,
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation(callback => Promise.resolve(callback({ data, error: null })))
  }));
};

describe('Data Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Data Entry Flow', () => {
    it('INT-SIMPLE-01: Should handle data entry creation and approval flow', async () => {
      // Setup mock responses
      let currentEntryStatus = 'pending';
      
      vi.mocked(supabase.from).mockImplementation((table) => {
        if (table === 'data_entries') {
          return {
            ...supabase,
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockReturnThis(),
            insert: vi.fn().mockImplementation((data) => {
              return {
                ...supabase,
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockReturnThis(),
                then: vi.fn().mockImplementation(callback => 
                  Promise.resolve(callback({ 
                    data: { ...mockDataEntry, ...data[0] }, 
                    error: null 
                  }))
                )
              };
            }),
            update: vi.fn().mockImplementation((updateData) => {
              if (updateData.status) {
                currentEntryStatus = updateData.status;
              }
              
              return {
                ...supabase,
                eq: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockReturnThis(),
                then: vi.fn().mockImplementation(callback => 
                  Promise.resolve(callback({ 
                    data: { 
                      ...mockDataEntry, 
                      ...updateData,
                      status: currentEntryStatus 
                    }, 
                    error: null 
                  }))
                )
              };
            }),
            then: vi.fn().mockImplementation(callback => 
              Promise.resolve(callback({ 
                data: [{ ...mockDataEntry, status: currentEntryStatus }], 
                error: null 
              }))
            )
          };
        }
        
        if (table === 'schools') {
          return {
            ...supabase,
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockReturnThis(),
            then: vi.fn().mockImplementation(callback => 
              Promise.resolve(callback({ 
                data: mockSchool, 
                error: null 
              }))
            )
          };
        }
        
        return supabase;
      });

      // Test data entry creation
      const createDataEntryResponse = await supabase
        .from('data_entries')
        .insert([{
          school_id: 'test-school-id',
          category_id: 'test-category-id',
          column_id: 'test-column-id',
          value: 'New Test Value',
          status: 'pending'
        }])
        .select()
        .single()
        .then(response => response);

      expect(createDataEntryResponse.data).toBeDefined();
      expect(createDataEntryResponse.data.status).toBe('pending');
      expect(createDataEntryResponse.data.value).toBe('New Test Value');

      // Test data entry approval
      const approveDataEntryResponse = await supabase
        .from('data_entries')
        .update({
          status: 'approved',
          approved_by: 'approver-user-id',
          approved_at: new Date().toISOString()
        })
        .eq('id', 'test-entry-id')
        .select()
        .single()
        .then(response => response);

      expect(approveDataEntryResponse.data).toBeDefined();
      expect(approveDataEntryResponse.data.status).toBe('approved');
      expect(approveDataEntryResponse.data.approved_by).toBe('approver-user-id');

      // Verify the status was updated
      const getDataEntryResponse = await supabase
        .from('data_entries')
        .select()
        .eq('id', 'test-entry-id')
        .then(response => response);

      expect(getDataEntryResponse.data[0].status).toBe('approved');
    });

    it('INT-SIMPLE-02: Should handle data entry rejection flow', async () => {
      // Setup mock responses
      let currentEntryStatus = 'pending';
      
      vi.mocked(supabase.from).mockImplementation((table) => {
        if (table === 'data_entries') {
          return {
            ...supabase,
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockReturnThis(),
            update: vi.fn().mockImplementation((updateData) => {
              if (updateData.status) {
                currentEntryStatus = updateData.status;
              }
              
              return {
                ...supabase,
                eq: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockReturnThis(),
                then: vi.fn().mockImplementation(callback => 
                  Promise.resolve(callback({ 
                    data: { 
                      ...mockDataEntry, 
                      ...updateData,
                      status: currentEntryStatus 
                    }, 
                    error: null 
                  }))
                )
              };
            }),
            then: vi.fn().mockImplementation(callback => 
              Promise.resolve(callback({ 
                data: [{ ...mockDataEntry, status: currentEntryStatus }], 
                error: null 
              }))
            )
          };
        }
        
        return supabase;
      });

      // Test data entry rejection
      const rejectDataEntryResponse = await supabase
        .from('data_entries')
        .update({
          status: 'rejected',
          rejected_by: 'rejector-user-id',
          rejection_reason: 'Invalid data provided'
        })
        .eq('id', 'test-entry-id')
        .select()
        .single()
        .then(response => response);

      expect(rejectDataEntryResponse.data).toBeDefined();
      expect(rejectDataEntryResponse.data.status).toBe('rejected');
      expect(rejectDataEntryResponse.data.rejected_by).toBe('rejector-user-id');
      expect(rejectDataEntryResponse.data.rejection_reason).toBe('Invalid data provided');

      // Verify the status was updated
      const getDataEntryResponse = await supabase
        .from('data_entries')
        .select()
        .eq('id', 'test-entry-id')
        .then(response => response);

      expect(getDataEntryResponse.data[0].status).toBe('rejected');
    });
  });

  describe('Report Flow', () => {
    it('INT-REPORT-01: Should handle report creation and update flow', async () => {
      // Setup mock responses for report operations
      vi.mocked(supabase.from).mockImplementation((table) => {
        if (table === 'reports') {
          return {
            ...supabase,
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockReturnThis(),
            insert: vi.fn().mockImplementation((data) => {
              return {
                ...supabase,
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockReturnThis(),
                then: vi.fn().mockImplementation(callback => 
                  Promise.resolve(callback({ 
                    data: { ...mockReport, ...data[0] }, 
                    error: null 
                  }))
                )
              };
            }),
            update: vi.fn().mockImplementation((updateData) => {
              return {
                ...supabase,
                eq: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockReturnThis(),
                then: vi.fn().mockImplementation(callback => 
                  Promise.resolve(callback({ 
                    data: { ...mockReport, ...updateData }, 
                    error: null 
                  }))
                )
              };
            }),
            then: vi.fn().mockImplementation(callback => 
              Promise.resolve(callback({ 
                data: [mockReport], 
                error: null 
              }))
            )
          };
        }
        
        return supabase;
      });

      // Test report creation
      const createReportResponse = await supabase
        .from('reports')
        .insert([{
          title: 'New Test Report',
          description: 'New Test Description',
          type: REPORT_TYPE_VALUES.PIE,
          content: { testData: true }
        }])
        .select()
        .single()
        .then(response => response);

      expect(createReportResponse.data).toBeDefined();
      expect(createReportResponse.data.title).toBe('New Test Report');
      expect(createReportResponse.data.type).toBe(REPORT_TYPE_VALUES.PIE);

      // Test report update
      const updateReportResponse = await supabase
        .from('reports')
        .update({
          title: 'Updated Test Report',
          status: 'published'
        })
        .eq('id', 'test-report-id')
        .select()
        .single()
        .then(response => response);

      expect(updateReportResponse.data).toBeDefined();
      expect(updateReportResponse.data.title).toBe('Updated Test Report');
      expect(updateReportResponse.data.status).toBe('published');
    });

    it('INT-REPORT-02: Should handle report sharing flow', async () => {
      // Setup mock responses for report sharing
      let sharedWith: string[] = [];
      
      vi.mocked(supabase.from).mockImplementation((table) => {
        if (table === 'reports') {
          return {
            ...supabase,
            select: vi.fn().mockImplementation(() => {
              return {
                ...supabase,
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockReturnThis(),
                then: vi.fn().mockImplementation(callback => 
                  Promise.resolve(callback({ 
                    data: { ...mockReport, shared_with: sharedWith }, 
                    error: null 
                  }))
                )
              };
            }),
            update: vi.fn().mockImplementation((updateData) => {
              if (updateData.shared_with) {
                sharedWith = updateData.shared_with;
              }
              
              return {
                ...supabase,
                eq: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockReturnThis(),
                then: vi.fn().mockImplementation(callback => 
                  Promise.resolve(callback({ 
                    data: { ...mockReport, shared_with: sharedWith }, 
                    error: null 
                  }))
                )
              };
            })
          };
        }
        
        return supabase;
      });

      // Test getting report before sharing
      const getReportResponse = await supabase
        .from('reports')
        .select()
        .eq('id', 'test-report-id')
        .single()
        .then(response => response);

      expect(getReportResponse.data).toBeDefined();
      expect(getReportResponse.data.shared_with).toEqual([]);

      // Test sharing report with users
      const shareReportResponse = await supabase
        .from('reports')
        .update({
          shared_with: ['user-1', 'user-2']
        })
        .eq('id', 'test-report-id')
        .select()
        .single()
        .then(response => response);

      expect(shareReportResponse.data).toBeDefined();
      expect(shareReportResponse.data.shared_with).toEqual(['user-1', 'user-2']);

      // Test getting report after sharing
      const getUpdatedReportResponse = await supabase
        .from('reports')
        .select()
        .eq('id', 'test-report-id')
        .single()
        .then(response => response);

      expect(getUpdatedReportResponse.data).toBeDefined();
      expect(getUpdatedReportResponse.data.shared_with).toEqual(['user-1', 'user-2']);
    });
  });
});
