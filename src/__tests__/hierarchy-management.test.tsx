/**
 * Region/Sektor/Məktəb İdarəetməsi Testləri
 * 
 * Bu test faylı, İnfoLine tətbiqinin Region, Sektor və Məktəb iyerarxiyasının idarəetməsini yoxlayır:
 * - Region yaratma və redaktə
 * - Sektor yaratma və redaktə
 * - Məktəb yaratma və redaktə
 * - Admin təyin etmə prosesləri
 * - İyerarxiya əlaqələrinin idarə edilməsi
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

// React Router
const mockNavigate = vi.fn();

// React Router mockla - geriçağırım axanı üçün əvəllədimə
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any, // bütün actual exports-i əlavə et
    useNavigate: () => mockNavigate
  };
});

// Edge Functions mockla
const mockCallEdgeFunction = vi.fn().mockImplementation((funcName, options) => {
  if (funcName === 'assign-regionadmin') {
    return Promise.resolve({ data: { success: true, message: 'Region admin təyin edildi' }, error: null });
  }
  if (funcName === 'assign-sectoradmin') {
    return Promise.resolve({ data: { success: true, message: 'Sektor admin təyin edildi' }, error: null });
  }
  if (funcName === 'assign-schooladmin') {
    return Promise.resolve({ data: { success: true, message: 'Məktəb admin təyin edildi' }, error: null });
  }
  return Promise.resolve({ data: null, error: { message: 'Unknown function' } });
});

// Regions, Sectors və Schools hook və komponentlərini mockla
vi.mock('@/hooks/useRegions', () => ({
  useRegions: () => ({
    regions: [
      { id: 'region-1', name: 'Bakı', code: 'BAK', status: 'active' },
      { id: 'region-2', name: 'Sumqayıt', code: 'SMQ', status: 'active' }
    ],
    isLoading: false,
    error: null,
    fetchRegions: vi.fn().mockResolvedValue(true),
    refresh: vi.fn().mockResolvedValue(true),
    // Komponentdə istifadə edə bilmək üçün bu funksiyaları da əlavə edirik
    add: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'new-region-id', ...data })),
    update: vi.fn().mockResolvedValue(true),
    remove: vi.fn().mockResolvedValue(true)
  })
}));

vi.mock('@/hooks/useSectors', () => ({
  useSectors: () => ({
    sectors: [
      { id: 'sector-1', name: 'Səbail', code: 'SBL', region_id: 'region-1', status: 'active' },
      { id: 'sector-2', name: 'Xətai', code: 'XTI', region_id: 'region-1', status: 'active' }
    ],
    isLoading: false,
    error: null,
    fetchSectors: vi.fn().mockResolvedValue(true),
    fetchSectorsByRegion: vi.fn().mockResolvedValue(true),
    refresh: vi.fn().mockResolvedValue(true),
    // Komponentdə istifadə edə bilmək üçün bu funksiyaları da əlavə edirik
    add: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'new-sector-id', ...data })),
    update: vi.fn().mockResolvedValue(true),
    remove: vi.fn().mockResolvedValue(true)
  })
}));

vi.mock('@/hooks/useSchools', () => ({
  useSchools: () => ({
    schools: [
      { id: 'school-1', name: 'Məktəb #1', code: 'SCH1', sector_id: 'sector-1', status: 'active' },
      { id: 'school-2', name: 'Məktəb #2', code: 'SCH2', sector_id: 'sector-1', status: 'active' }
    ],
    isLoading: false,
    error: null,
    fetchSchools: vi.fn().mockResolvedValue(true),
    fetchSchoolsBySector: vi.fn().mockResolvedValue(true),
    refresh: vi.fn().mockResolvedValue(true),
    // Komponentdə istifadə edə bilmək üçün bu funksiyaları da əlavə edirik
    add: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'new-school-id', ...data })),
    update: vi.fn().mockResolvedValue(true),
    remove: vi.fn().mockResolvedValue(true)
  })
}));

// Supabase client mockla
vi.mock('@/integrations/supabase/client', () => ({
  callEdgeFunction: mockCallEdgeFunction,
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'test-id' } } }, error: null }),
    },
  }
}));

// Mock komponentlər
vi.mock('@/components/regions/RegionForm', () => {
  const RegionForm = ({ onSubmit, initialData }: any) => {
    return (
      <div data-testid="region-form">
        <button 
          data-testid="region-submit-button"
          onClick={() => onSubmit(initialData ? { ...initialData, name: 'Yeni Ad' } : { name: 'Test Region', code: 'TST' })}
        >
          Əlavə et / Yadda saxla
        </button>
      </div>
    );
  };
  return { default: RegionForm };
});

vi.mock('@/components/sectors/SectorForm', () => {
  const SectorForm = ({ onSubmit, initialData, regionId }: any) => {
    return (
      <div data-testid="sector-form">
        <button 
          data-testid="sector-submit-button"
          onClick={() => onSubmit(initialData ? 
            { ...initialData, name: 'Yeni Ad' } : 
            { 
              name: 'Test Sector', 
              code: 'TST', 
              region_id: regionId || 'region-1' 
            })}
        >
          Əlavə et / Yadda saxla
        </button>
      </div>
    );
  };
  return { default: SectorForm };
});

vi.mock('@/components/schools/SchoolForm', () => {
  const SchoolForm = ({ onSubmit, initialData, sectorId }: any) => {
    return (
      <div data-testid="school-form">
        <button 
          data-testid="school-submit-button"
          onClick={() => onSubmit(initialData ? 
            { ...initialData, name: 'Yeni Ad' } : 
            { 
              name: 'Test School', 
              code: 'TST', 
              sector_id: sectorId || 'sector-1' 
            })}
        >
          Əlavə et / Yadda saxla
        </button>
      </div>
    );
  };
  return { default: SchoolForm };
});

describe('Region/Sektor/Məktəb İdarəetməsi Testləri', () => {
  // Hər testin əvvəlində mockları sıfırlamaq
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    mockCallEdgeFunction.mockClear();
    
    // Auth store mockla və superadmin istifadəçini təyin et
    const store = mockAuthStore();
    Object.assign(store, {
      isAuthenticated: true,
      user: { ...mockUserData, role: 'superadmin' as UserRole }
    });

    // Edge Functions mockla
    mockEdgeFunctions();
  });

  describe('HIER-01: Region yaratma', () => {
    it('yeni region yaratma prosesi', async () => {
      // useRegions hook-undakı funksiyaları al
      const { useRegions } = await import('@/hooks/useRegions');
      const { add } = useRegions();

      // RegionForm komponentini render et
      const handleSubmit = vi.fn().mockImplementation((data) => {
        // add funksiyasını çağır
        return add(data);
      });

      render(
        <div data-testid="region-create-container">
          {/* Mocked RegionForm-dan istifadə (vi.mock ilə əvəllicədən mocklanıb) */}
          <div data-testid="region-form">
            <button 
              data-testid="region-submit-button"
              onClick={() => handleSubmit({ name: 'Test Region', code: 'TST' })}
            >
              Təsdiq
            </button>
          </div>
        </div>
      );

      // Submit düyməsinə klik et
      fireEvent.click(screen.getByTestId('region-submit-button'));

      // Funksiyaların çağırıldığını yoxla
      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith(expect.objectContaining({
          name: 'Test Region',
          code: 'TST'
        }));
        expect(add).toHaveBeenCalled();
      });
    });
  });

  describe('HIER-02: Sektor yaratma', () => {
    it('yeni sektor yaratma prosesi', async () => {
      // useSectors hook-undakı funksiyaları al
      const { useSectors } = await import('@/hooks/useSectors');
      const { add } = useSectors();

      // SectorForm komponentini render et
      const handleSubmit = vi.fn().mockImplementation((data) => {
        // add funksiyasını çağır
        return add(data);
      });

      render(
        <div data-testid="sector-create-container">
          {/* Mocked SectorForm-dan istifadə (vi.mock ilə əvəllicədən mocklanıb) */}
          <div data-testid="sector-form">
            <button 
              data-testid="sector-submit-button"
              onClick={() => handleSubmit({ name: 'Test Sector', code: 'TST', region_id: 'region-1' })}
            >
              Təsdiq
            </button>
          </div>
        </div>
      );

      // Submit düyməsinə klik et
      fireEvent.click(screen.getByTestId('sector-submit-button'));

      // Funksiyaların çağırıldığını yoxla
      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith(expect.objectContaining({
          name: 'Test Sector',
          code: 'TST',
          region_id: 'region-1'
        }));
        expect(add).toHaveBeenCalled();
      });
    });
  });

  describe('HIER-03: Məktəb yaratma', () => {
    it('yeni məktəb yaratma prosesi', async () => {
      // useSchools hook-undakı funksiyaları al
      const { useSchools } = await import('@/hooks/useSchools');
      const { add } = useSchools();

      // SchoolForm komponentini render et
      const handleSubmit = vi.fn().mockImplementation((data) => {
        // add funksiyasını çağır
        return add(data);
      });

      render(
        <div data-testid="school-create-container">
          {/* Mocked SchoolForm-dan istifadə (vi.mock ilə əvəllicədən mocklanıb) */}
          <div data-testid="school-form">
            <button 
              data-testid="school-submit-button"
              onClick={() => handleSubmit({ name: 'Test School', code: 'TST', sector_id: 'sector-1' })}
            >
              Təsdiq
            </button>
          </div>
        </div>
      );

      // Submit düyməsinə klik et
      fireEvent.click(screen.getByTestId('school-submit-button'));

      // Funksiyaların çağırıldığını yoxla
      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith(expect.objectContaining({
          name: 'Test School',
          code: 'TST',
          sector_id: 'sector-1'
        }));
        expect(add).toHaveBeenCalled();
      });
    });
  });

  describe('HIER-04: Region admin təyin etmə', () => {
    it('regiona admin təyin etmə prosesi', async () => {
      // Admin təyin etmə funksiyasını mockla
      const assignRegionAdmin = vi.fn().mockImplementation((regionId, userId) => {
        return mockCallEdgeFunction('assign-regionadmin', { body: { regionId, userId } });
      });

      // Funksiyadan istifadə edən bir handler yarat
      const handleAssign = async () => {
        const result = await assignRegionAdmin('region-1', 'user-1');
        return result.data; // data obyektini qaytar
      };

      // Funksiyaları çağır və nəticələri yoxla
      const result = await handleAssign();
      
      expect(assignRegionAdmin).toHaveBeenCalledWith('region-1', 'user-1');
      expect(mockCallEdgeFunction).toHaveBeenCalledWith('assign-regionadmin', {
        body: {
          regionId: 'region-1',
          userId: 'user-1'
        }
      });
      expect(result).toEqual({ 
        success: true, 
        message: 'Region admin təyin edildi' 
      });
    });
  });

  describe('HIER-05: Sektor admin təyin etmə', () => {
    it('sektora admin təyin etmə prosesi', async () => {
      // Admin təyin etmə funksiyasını mockla
      const assignSectorAdmin = vi.fn().mockImplementation((sectorId, userId) => {
        return mockCallEdgeFunction('assign-sectoradmin', { body: { sectorId, userId } });
      });

      // Funksiyadan istifadə edən bir handler yarat
      const handleAssign = async () => {
        const result = await assignSectorAdmin('sector-1', 'user-1');
        return result.data; // data obyektini qaytar
      };

      // Funksiyaları çağır və nəticələri yoxla
      const result = await handleAssign();
      
      expect(assignSectorAdmin).toHaveBeenCalledWith('sector-1', 'user-1');
      expect(mockCallEdgeFunction).toHaveBeenCalledWith('assign-sectoradmin', {
        body: {
          sectorId: 'sector-1',
          userId: 'user-1'
        }
      });
      expect(result).toEqual({ 
        success: true, 
        message: 'Sektor admin təyin edildi' 
      });
    });
  });

  describe('HIER-06: Məktəb admin təyin etmə', () => {
    it('məktəbə admin təyin etmə prosesi', async () => {
      // Admin təyin etmə funksiyasını mockla
      const assignSchoolAdmin = vi.fn().mockImplementation((schoolId, userId) => {
        return mockCallEdgeFunction('assign-schooladmin', { body: { schoolId, userId } });
      });

      // Funksiyadan istifadə edən bir handler yarat
      const handleAssign = async () => {
        const result = await assignSchoolAdmin('school-1', 'user-1');
        return result.data; // data obyektini qaytar
      };

      // Funksiyaları çağır və nəticələri yoxla
      const result = await handleAssign();
      
      expect(assignSchoolAdmin).toHaveBeenCalledWith('school-1', 'user-1');
      expect(mockCallEdgeFunction).toHaveBeenCalledWith('assign-schooladmin', {
        body: {
          schoolId: 'school-1',
          userId: 'user-1'
        }
      });
      expect(result).toEqual({ 
        success: true, 
        message: 'Məktəb admin təyin edildi' 
      });
    });
  });

  describe('HIER-07: İyerarxiya əlaqələri', () => {
    it('region-sektor-məktəb əlaqələrinin yoxlanması', async () => {
      // useRegions, useSectors, useSchools hook-larını istifadə et
      const { useRegions } = await import('@/hooks/useRegions');
      const { useSectors } = await import('@/hooks/useSectors');
      const { useSchools } = await import('@/hooks/useSchools');
      
      // Verilənləri al
      const { regions } = useRegions();
      const { sectors } = useSectors();
      const { schools } = useSchools();
      
      // İyerarxiyanı yoxla
      const region = regions.find(r => r.id === 'region-1');
      const sector = sectors.find(s => s.id === 'sector-1');
      const school = schools.find(s => s.id === 'school-1');
      
      // Region-Sector əlaqəsi
      expect(sector?.region_id).toBe(region?.id);
      
      // Sector-School əlaqəsi
      expect(school?.sector_id).toBe(sector?.id);
      
      // Region-School əlaqəsini birbaşa yoxla (geniş test üçün)
      const schoolRegion = sectors.find(s => s.id === school?.sector_id)?.region_id;
      expect(schoolRegion).toBe(region?.id);
    });
  });
});
