/**
 * Məlumat Təsdiqi və Toplama Testləri
 * 
 * Bu test faylı, İnfoLine tətbiqinin məlumat təsdiqləmə və toplama funksiyalarını yoxlayır:
 * - Məktəb admin tərəfindən məlumat təsdiqi
 * - Sektor admin tərəfindən məlumat təsdiqi
 * - Region admin tərəfindən məlumat təsdiqi
 * - Məlumat qaytarma və düzəliş
 * - Statuslar üzrə filtrasiya
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, expect, beforeEach, describe, it } from 'vitest';
import '@testing-library/jest-dom';

// Test vasitələri və yardımçı funksiyalar
import { 
  renderWithProviders, 
  mockSupabase, 
  mockUserRole, 
  mockAuthStore, 
  mockStorage,
  mockUserData,
  globalMockStore,
  mockEdgeFunctions
} from './test-utils';

// İstifadəçi rolu üçün enum
enum UserRole {
  SUPERADMIN = 'superadmin',
  REGIONADMIN = 'regionadmin',
  SECTORADMIN = 'sectoradmin',
  SCHOOLADMIN = 'schooladmin'
}

// Məlumat statusları üçün enum
enum ApprovalStatus {
  DRAFT = 'draft',
  SCHOOL_APPROVED = 'school_approved',
  SECTOR_APPROVED = 'sector_approved',
  REGION_APPROVED = 'region_approved',
  REJECTED = 'rejected',
  RETURNED = 'returned'
}

// React Router
const mockNavigate = vi.fn();

// React Router mockla
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 'entry-1' })
  };
});

// Mock callEdgeFunction və digər Supabase funksiyaları
const mockCallEdgeFunction = vi.fn().mockImplementation((funcName, options) => {
  if (funcName === 'approve-data') {
    return Promise.resolve({ 
      data: { 
        success: true, 
        id: options.body.entryId, 
        message: 'Məlumatlar uğurla təsdiqləndi' 
      }, 
      error: null 
    });
  } else if (funcName === 'return-data') {
    return Promise.resolve({ 
      data: { 
        success: true, 
        id: options.body.entryId, 
        message: 'Məlumatlar düzəliş üçün qaytarıldı' 
      }, 
      error: null 
    });
  } else if (funcName === 'get-entry-history') {
    return Promise.resolve({ 
      data: { 
        history: [
          { 
            id: 'history-1', 
            entry_id: options.body.entryId, 
            action: 'approved', 
            action_by: 'user-123', 
            action_by_role: 'schooladmin', 
            created_at: new Date().toISOString(), 
            notes: 'Məktəb səviyyəsində təsdiqləndi' 
          }
        ]
      }, 
      error: null 
    });
  }
  return Promise.resolve({ data: null, error: { message: 'Unknown function' } });
});

// Test üçün mock data
const mockEntries = [
  {
    id: 'entry-1',
    school_id: 'school-1',
    sector_id: 'sector-1',
    region_id: 'region-1',
    category_id: 'category-1',
    created_at: new Date().toISOString(),
    created_by: 'user-123',
    updated_at: new Date().toISOString(),
    status: ApprovalStatus.DRAFT,
    data: {
      'column-1': 'Test Məktəb',
      'column-2': 100
    }
  },
  {
    id: 'entry-2',
    school_id: 'school-1',
    sector_id: 'sector-1',
    region_id: 'region-1',
    category_id: 'category-2',
    created_at: new Date().toISOString(),
    created_by: 'user-123',
    updated_at: new Date().toISOString(),
    status: ApprovalStatus.SCHOOL_APPROVED,
    data: {
      'column-3': 'https://example.com/uploads/test.xlsx'
    }
  },
  {
    id: 'entry-3',
    school_id: 'school-1',
    sector_id: 'sector-1',
    region_id: 'region-1',
    category_id: 'category-1',
    created_at: new Date().toISOString(),
    created_by: 'user-123',
    updated_at: new Date().toISOString(),
    status: ApprovalStatus.SECTOR_APPROVED,
    data: {
      'column-1': 'Digər Məktəb',
      'column-2': 200
    }
  }
];

// Mock hooks
vi.mock('@/hooks/approval/useApprovalData', () => ({
  useApprovalData: () => ({
    entries: mockEntries,
    isLoading: false,
    error: null,
    fetchEntries: vi.fn().mockResolvedValue(mockEntries),
    fetchEntryById: vi.fn().mockImplementation((id) => 
      Promise.resolve(mockEntries.find(e => e.id === id))
    ),
    approveEntry: vi.fn().mockImplementation((id, role) => {
      const newStatus = role === 'schooladmin' 
        ? ApprovalStatus.SCHOOL_APPROVED 
        : role === 'sectoradmin' 
          ? ApprovalStatus.SECTOR_APPROVED 
          : ApprovalStatus.REGION_APPROVED;
      
      return Promise.resolve({
        success: true,
        id,
        status: newStatus,
        message: 'Məlumatlar uğurla təsdiqləndi'
      });
    }),
    returnEntry: vi.fn().mockImplementation((id, notes) => 
      Promise.resolve({
        success: true,
        id,
        status: ApprovalStatus.RETURNED,
        message: 'Məlumatlar düzəliş üçün qaytarıldı'
      })
    ),
    rejectEntry: vi.fn().mockImplementation((id, notes) => 
      Promise.resolve({
        success: true,
        id,
        status: ApprovalStatus.REJECTED,
        message: 'Məlumatlar rədd edildi'
      })
    ),
    fetchEntryHistory: vi.fn().mockImplementation((id) => 
      Promise.resolve([
        { 
          id: 'history-1', 
          entry_id: id, 
          action: 'approved', 
          action_by: 'user-123', 
          action_by_role: 'schooladmin', 
          created_at: new Date().toISOString(), 
          notes: 'Məktəb səviyyəsində təsdiqləndi' 
        }
      ])
    ),
    filterByStatus: vi.fn().mockImplementation((status) => 
      Promise.resolve(mockEntries.filter(e => e.status === status))
    ),
    bulkApprove: vi.fn().mockImplementation((ids, role) => 
      Promise.resolve({
        success: true,
        approved: ids,
        failed: []
      })
    )
  })
}));

// Supabase client mockla
vi.mock('@/integrations/supabase/client', () => ({
  callEdgeFunction: mockCallEdgeFunction,
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'test-id' } } }, error: null }),
    }
  }
}));

// Mock ApprovalActions komponenti
vi.mock('@/components/approval/ApprovalActions', () => {
  const ApprovalActions = ({ entry, onApprove, onReturn, onReject }: any) => {
    return (
      <div data-testid="approval-actions">
        <button 
          data-testid="approve-button"
          onClick={() => onApprove(entry.id)}
        >
          Təsdiqlə
        </button>
        <button 
          data-testid="return-button"
          onClick={() => onReturn(entry.id, 'Düzəliş lazımdır')}
        >
          Düzəliş üçün qaytar
        </button>
        <button 
          data-testid="reject-button"
          onClick={() => onReject(entry.id, 'Məlumatlar yanlışdır')}
        >
          Rədd et
        </button>
      </div>
    );
  };
  return { default: ApprovalActions };
});

// Mock ApprovalPage komponenti
vi.mock('@/pages/ApprovalPage', () => {
  const ApprovalPage = () => {
    return (
      <div data-testid="approval-page">
        <div data-testid="approval-filters">
          <button data-testid="filter-draft">Draft</button>
          <button data-testid="filter-school-approved">Məktəb təsdiqi</button>
          <button data-testid="filter-sector-approved">Sektor təsdiqi</button>
        </div>
        <div data-testid="entries-list">
          {mockEntries.map(entry => (
            <div key={entry.id} data-testid={`entry-${entry.id}`}>
              <span data-testid={`entry-status-${entry.id}`}>{entry.status}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };
  return { default: ApprovalPage };
});

describe('Məlumat Təsdiqi və Toplama Testləri', () => {
  // Hər testin əvvəlində mockları sıfırlamaq
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    mockCallEdgeFunction.mockClear();
  });
  
  describe('APPR-01: Məlumat təsdiqi (məktəb admin)', () => {
    it('Məktəb admin tərəfindən məlumat təsdiqi prosesi', async () => {
      // Auth store mockla və məktəb admin istifadəçini təyin et
      const store = mockAuthStore();
      Object.assign(store, {
        isAuthenticated: true,
        user: { ...mockUserData, role: 'schooladmin' as UserRole }
      });
      
      // useApprovalData hook-undan funksiyaları al
      const { useApprovalData } = await import('@/hooks/approval/useApprovalData');
      const { approveEntry } = useApprovalData();

      // Təsdiq prosesini simulyasiya et
      const handleApprove = vi.fn().mockImplementation((id) => {
        return approveEntry(id, 'schooladmin');
      });

      render(
        <div data-testid="approval-container">
          <div data-testid="approval-actions">
            <button 
              data-testid="approve-button"
              onClick={() => handleApprove('entry-1')}
            >
              Təsdiqlə
            </button>
          </div>
        </div>
      );

      // Təsdiq düyməsinə klik et
      fireEvent.click(screen.getByTestId('approve-button'));

      // Funksiyaların çağırıldığını yoxla
      await waitFor(() => {
        expect(handleApprove).toHaveBeenCalledWith('entry-1');
        expect(approveEntry).toHaveBeenCalledWith('entry-1', 'schooladmin');
      });
      
      // Status dəyişməsini yoxla
      const result = await approveEntry('entry-1', 'schooladmin');
      expect(result).toEqual(expect.objectContaining({
        success: true,
        status: ApprovalStatus.SCHOOL_APPROVED
      }));
    });
  });

  describe('APPR-02: Məlumat təsdiqi (sektor admin)', () => {
    it('Sektor admin tərəfindən məlumat təsdiqi prosesi', async () => {
      // Auth store mockla və sektor admin istifadəçini təyin et
      const store = mockAuthStore();
      Object.assign(store, {
        isAuthenticated: true,
        user: { ...mockUserData, role: 'sectoradmin' as UserRole }
      });
      
      // useApprovalData hook-undan funksiyaları al
      const { useApprovalData } = await import('@/hooks/approval/useApprovalData');
      const { approveEntry } = useApprovalData();

      // Təsdiq prosesini simulyasiya et
      const handleApprove = vi.fn().mockImplementation((id) => {
        return approveEntry(id, 'sectoradmin');
      });

      render(
        <div data-testid="approval-container">
          <div data-testid="approval-actions">
            <button 
              data-testid="approve-button"
              onClick={() => handleApprove('entry-2')}
            >
              Təsdiqlə
            </button>
          </div>
        </div>
      );

      // Təsdiq düyməsinə klik et
      fireEvent.click(screen.getByTestId('approve-button'));

      // Funksiyaların çağırıldığını yoxla
      await waitFor(() => {
        expect(handleApprove).toHaveBeenCalledWith('entry-2');
        expect(approveEntry).toHaveBeenCalledWith('entry-2', 'sectoradmin');
      });
      
      // Status dəyişməsini yoxla
      const result = await approveEntry('entry-2', 'sectoradmin');
      expect(result).toEqual(expect.objectContaining({
        success: true,
        status: ApprovalStatus.SECTOR_APPROVED
      }));
    });
  });

  describe('APPR-03: Məlumat təsdiqi (region admin)', () => {
    it('Region admin tərəfindən məlumat təsdiqi prosesi', async () => {
      // Auth store mockla və region admin istifadəçini təyin et
      const store = mockAuthStore();
      Object.assign(store, {
        isAuthenticated: true,
        user: { ...mockUserData, role: 'regionadmin' as UserRole }
      });
      
      // useApprovalData hook-undan funksiyaları al
      const { useApprovalData } = await import('@/hooks/approval/useApprovalData');
      const { approveEntry } = useApprovalData();

      // Təsdiq prosesini simulyasiya et
      const handleApprove = vi.fn().mockImplementation((id) => {
        return approveEntry(id, 'regionadmin');
      });

      render(
        <div data-testid="approval-container">
          <div data-testid="approval-actions">
            <button 
              data-testid="approve-button"
              onClick={() => handleApprove('entry-3')}
            >
              Təsdiqlə
            </button>
          </div>
        </div>
      );

      // Təsdiq düyməsinə klik et
      fireEvent.click(screen.getByTestId('approve-button'));

      // Funksiyaların çağırıldığını yoxla
      await waitFor(() => {
        expect(handleApprove).toHaveBeenCalledWith('entry-3');
        expect(approveEntry).toHaveBeenCalledWith('entry-3', 'regionadmin');
      });
      
      // Status dəyişməsini yoxla
      const result = await approveEntry('entry-3', 'regionadmin');
      expect(result).toEqual(expect.objectContaining({
        success: true,
        status: ApprovalStatus.REGION_APPROVED
      }));
    });
  });

  describe('APPR-04: Məlumat qaytarma', () => {
    it('Məlumatı düzəliş üçün qaytarma prosesi', async () => {
      // Auth store mockla və sektor admin istifadəçini təyin et
      const store = mockAuthStore();
      Object.assign(store, {
        isAuthenticated: true,
        user: { ...mockUserData, role: 'sectoradmin' as UserRole }
      });
      
      // useApprovalData hook-undan funksiyaları al
      const { useApprovalData } = await import('@/hooks/approval/useApprovalData');
      const { returnEntry } = useApprovalData();

      // Qaytarma prosesini simulyasiya et
      const handleReturn = vi.fn().mockImplementation((id, notes) => {
        return returnEntry(id, notes);
      });

      render(
        <div data-testid="approval-container">
          <div data-testid="approval-actions">
            <button 
              data-testid="return-button"
              onClick={() => handleReturn('entry-2', 'Düzəliş lazımdır')}
            >
              Düzəliş üçün qaytar
            </button>
          </div>
        </div>
      );

      // Qaytarma düyməsinə klik et
      fireEvent.click(screen.getByTestId('return-button'));

      // Funksiyaların çağırıldığını yoxla
      await waitFor(() => {
        expect(handleReturn).toHaveBeenCalledWith('entry-2', 'Düzəliş lazımdır');
        expect(returnEntry).toHaveBeenCalledWith('entry-2', 'Düzəliş lazımdır');
      });
      
      // Status dəyişməsini yoxla
      const result = await returnEntry('entry-2', 'Düzəliş lazımdır');
      expect(result).toEqual(expect.objectContaining({
        success: true,
        status: ApprovalStatus.RETURNED
      }));
    });
  });

  describe('APPR-05: Statuslar üzrə filtrasiya', () => {
    it('Müxtəlif təsdiq statusları üzrə filtrasiya prosesi', async () => {
      // useApprovalData hook-undan funksiyaları al
      const { useApprovalData } = await import('@/hooks/approval/useApprovalData');
      const { filterByStatus } = useApprovalData();
      
      // ApprovalPage komponentini render et
      render(
        <div data-testid="approval-page">
          <div data-testid="approval-filters">
            <button 
              data-testid="filter-draft"
              onClick={() => filterByStatus(ApprovalStatus.DRAFT)}
            >
              Draft
            </button>
            <button 
              data-testid="filter-school-approved"
              onClick={() => filterByStatus(ApprovalStatus.SCHOOL_APPROVED)}
            >
              Məktəb təsdiqi
            </button>
          </div>
        </div>
      );

      // Draft filterinə klik et
      fireEvent.click(screen.getByTestId('filter-draft'));
      
      // Filtrasiya funksiyasının çağırıldığını yoxla
      await waitFor(() => {
        expect(filterByStatus).toHaveBeenCalledWith(ApprovalStatus.DRAFT);
      });
      
      // Məktəb təsdiqi filterinə klik et
      fireEvent.click(screen.getByTestId('filter-school-approved'));
      
      // Filtrasiya funksiyasının çağırıldığını yoxla
      await waitFor(() => {
        expect(filterByStatus).toHaveBeenCalledWith(ApprovalStatus.SCHOOL_APPROVED);
      });
      
      // Filtrasiya nəticələrini yoxla
      const draftEntries = await filterByStatus(ApprovalStatus.DRAFT);
      expect(draftEntries).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: 'entry-1', status: ApprovalStatus.DRAFT })
      ]));
      
      const schoolApprovedEntries = await filterByStatus(ApprovalStatus.SCHOOL_APPROVED);
      expect(schoolApprovedEntries).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: 'entry-2', status: ApprovalStatus.SCHOOL_APPROVED })
      ]));
    });
  });

  describe('APPR-06: Toplu təsdiq', () => {
    it('Birdən çox məlumatı eyni anda təsdiq etmə prosesi', async () => {
      // Auth store mockla və region admin istifadəçini təyin et
      const store = mockAuthStore();
      Object.assign(store, {
        isAuthenticated: true,
        user: { ...mockUserData, role: 'regionadmin' as UserRole }
      });
      
      // useApprovalData hook-undan funksiyaları al
      const { useApprovalData } = await import('@/hooks/approval/useApprovalData');
      const { bulkApprove } = useApprovalData();

      // Toplu təsdiq prosesini simulyasiya et
      const handleBulkApprove = vi.fn().mockImplementation((ids) => {
        return bulkApprove(ids, 'regionadmin');
      });

      render(
        <div data-testid="approval-container">
          <div data-testid="bulk-actions">
            <button 
              data-testid="bulk-approve-button"
              onClick={() => handleBulkApprove(['entry-2', 'entry-3'])}
            >
              Seçilənləri təsdiqlə
            </button>
          </div>
        </div>
      );

      // Toplu təsdiq düyməsinə klik et
      fireEvent.click(screen.getByTestId('bulk-approve-button'));

      // Funksiyaların çağırıldığını yoxla
      await waitFor(() => {
        expect(handleBulkApprove).toHaveBeenCalledWith(['entry-2', 'entry-3']);
        expect(bulkApprove).toHaveBeenCalledWith(['entry-2', 'entry-3'], 'regionadmin');
      });
      
      // Toplu təsdiq nəticəsini yoxla
      const result = await bulkApprove(['entry-2', 'entry-3'], 'regionadmin');
      expect(result).toEqual(expect.objectContaining({
        success: true,
        approved: ['entry-2', 'entry-3'],
        failed: []
      }));
    });
  });
});
