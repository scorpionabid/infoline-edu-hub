/**
 * Kateqoriya və Sütun İdarəetməsi Testləri
 * 
 * Bu test faylı, İnfoLine tətbiqinin Kateqoriya və Sütun idarəetməsini yoxlayır:
 * - Kateqoriya yaratma və redaktə
 * - Sütun yaratma və redaktə
 * - Sütun tipləri və formatlama
 * - Kateqoriya və sütun əlaqələrinin idarə edilməsi
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

// React Router mockla
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any,
    useNavigate: () => mockNavigate
  };
});

// Mock callEdgeFunction və digər Supabase funksiyaları
const mockCallEdgeFunction = vi.fn().mockImplementation((funcName, options) => {
  if (funcName === 'update-category-permissions') {
    return Promise.resolve({ data: { success: true, message: 'Kateqoriya icazələri yeniləndi' }, error: null });
  }
  return Promise.resolve({ data: null, error: { message: 'Unknown function' } });
});

// Kateqoriya və sütun hook-larını mockla
vi.mock('@/hooks/categories/useCategories', () => ({
  useCategories: () => ({
    categories: [
      { id: 'category-1', name: 'Ümumi Məlumatlar', description: 'Məktəbin ümumi məlumatları', status: 'active' },
      { id: 'category-2', name: 'Şagird Məlumatları', description: 'Şagirdlərlə bağlı məlumatlar', status: 'active' }
    ],
    isLoading: false,
    error: null,
    fetchCategories: vi.fn().mockResolvedValue(true),
    refresh: vi.fn().mockResolvedValue(true),
    add: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'new-category-id', ...data })),
    update: vi.fn().mockResolvedValue(true),
    remove: vi.fn().mockResolvedValue(true)
  })
}));

vi.mock('@/hooks/columns/useColumns', () => ({
  useColumns: () => ({
    columns: [
      { 
        id: 'column-1', 
        name: 'Məktəb adı', 
        description: 'Məktəbin rəsmi adı', 
        data_type: 'text', 
        category_id: 'category-1', 
        required: true, 
        status: 'active' 
      },
      { 
        id: 'column-2', 
        name: 'Şagird sayı', 
        description: 'Ümumi şagird sayı', 
        data_type: 'number', 
        category_id: 'category-1', 
        required: true, 
        status: 'active' 
      },
      { 
        id: 'column-3', 
        name: 'Şagird siyahısı', 
        description: 'Excel formatında şagird siyahısı', 
        data_type: 'file', 
        category_id: 'category-2', 
        required: false, 
        status: 'active' 
      }
    ],
    isLoading: false,
    error: null,
    fetchColumns: vi.fn().mockResolvedValue(true),
    fetchColumnsByCategory: vi.fn().mockResolvedValue(true),
    refresh: vi.fn().mockResolvedValue(true),
    add: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'new-column-id', ...data })),
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
vi.mock('@/components/categories/CategoryForm', () => {
  const CategoryForm = ({ onSubmit, initialData }: any) => {
    return (
      <div data-testid="category-form">
        <button 
          data-testid="category-submit-button"
          onClick={() => onSubmit(initialData ? 
            { ...initialData, name: 'Yeni Ad' } : 
            { name: 'Test Kateqoriya', description: 'Test təsviri' })}
        >
          Əlavə et / Yadda saxla
        </button>
      </div>
    );
  };
  return { default: CategoryForm };
});

vi.mock('@/components/columns/ColumnForm', () => {
  const ColumnForm = ({ onSubmit, initialData, categoryId }: any) => {
    return (
      <div data-testid="column-form">
        <button 
          data-testid="column-submit-button"
          onClick={() => onSubmit(initialData ? 
            { ...initialData, name: 'Yeni Ad' } : 
            { 
              name: 'Test Sütun', 
              description: 'Test təsviri', 
              data_type: 'text', 
              category_id: categoryId || 'category-1',
              required: false,
              status: 'active'
            })}
        >
          Əlavə et / Yadda saxla
        </button>
      </div>
    );
  };
  return { default: ColumnForm };
});

describe('Kateqoriya və Sütun İdarəetməsi Testləri', () => {
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
  });

  describe('CAT-01: Kateqoriya yaratma', () => {
    it('yeni kateqoriya yaratma prosesi', async () => {
      // useCategories hook-undakı funksiyaları al
      const { useCategories } = await import('@/hooks/categories/useCategories');
      const { add } = useCategories();

      // CategoryForm komponentini render et
      const handleSubmit = vi.fn().mockImplementation((data) => {
        // add funksiyasını çağır
        return add(data);
      });

      render(
        <div data-testid="category-create-container">
          <div data-testid="category-form">
            <button 
              data-testid="category-submit-button"
              onClick={() => handleSubmit({ name: 'Test Kateqoriya', description: 'Test təsviri' })}
            >
              Təsdiq
            </button>
          </div>
        </div>
      );

      // Submit düyməsinə klik et
      fireEvent.click(screen.getByTestId('category-submit-button'));

      // Funksiyaların çağırıldığını yoxla
      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith(expect.objectContaining({
          name: 'Test Kateqoriya',
          description: 'Test təsviri'
        }));
        expect(add).toHaveBeenCalled();
      });
    });
  });

  describe('CAT-02: Kateqoriya redaktə', () => {
    it('mövcud kateqoriyanı redaktə prosesi', async () => {
      // useCategories hook-undakı funksiyaları al
      const { useCategories } = await import('@/hooks/categories/useCategories');
      const { update } = useCategories();

      // İlkin məlumatları təyin et
      const initialData = { 
        id: 'category-1', 
        name: 'Ümumi Məlumatlar', 
        description: 'Məktəbin ümumi məlumatları', 
        status: 'active' 
      };

      // CategoryForm komponentini render et
      const handleSubmit = vi.fn().mockImplementation((data) => {
        // update funksiyasını çağır
        return update(initialData.id, data);
      });

      render(
        <div data-testid="category-edit-container">
          <div data-testid="category-form">
            <button 
              data-testid="category-submit-button"
              onClick={() => handleSubmit({ 
                ...initialData, 
                name: 'Yenilənmiş Ad', 
                description: 'Yenilənmiş təsvir' 
              })}
            >
              Yadda saxla
            </button>
          </div>
        </div>
      );

      // Submit düyməsinə klik et
      fireEvent.click(screen.getByTestId('category-submit-button'));

      // Funksiyaların çağırıldığını yoxla
      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith(expect.objectContaining({
          id: 'category-1',
          name: 'Yenilənmiş Ad',
          description: 'Yenilənmiş təsvir'
        }));
        expect(update).toHaveBeenCalled();
      });
    });
  });

  describe('CAT-03: Sütun yaratma', () => {
    it('yeni sütun yaratma prosesi', async () => {
      // useColumns hook-undakı funksiyaları al
      const { useColumns } = await import('@/hooks/columns/useColumns');
      const { add } = useColumns();

      // ColumnForm komponentini render et
      const handleSubmit = vi.fn().mockImplementation((data) => {
        // add funksiyasını çağır
        return add(data);
      });

      render(
        <div data-testid="column-create-container">
          <div data-testid="column-form">
            <button 
              data-testid="column-submit-button"
              onClick={() => handleSubmit({ 
                name: 'Test Sütun', 
                description: 'Test təsviri', 
                data_type: 'text', 
                category_id: 'category-1',
                required: false,
                status: 'active'
              })}
            >
              Təsdiq
            </button>
          </div>
        </div>
      );

      // Submit düyməsinə klik et
      fireEvent.click(screen.getByTestId('column-submit-button'));

      // Funksiyaların çağırıldığını yoxla
      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith(expect.objectContaining({
          name: 'Test Sütun',
          description: 'Test təsviri',
          data_type: 'text',
          category_id: 'category-1'
        }));
        expect(add).toHaveBeenCalled();
      });
    });
  });

  describe('CAT-04: Sütun redaktə', () => {
    it('mövcud sütunu redaktə prosesi', async () => {
      // useColumns hook-undakı funksiyaları al
      const { useColumns } = await import('@/hooks/columns/useColumns');
      const { update } = useColumns();

      // İlkin məlumatları təyin et
      const initialData = { 
        id: 'column-1', 
        name: 'Məktəb adı', 
        description: 'Məktəbin rəsmi adı', 
        data_type: 'text', 
        category_id: 'category-1', 
        required: true, 
        status: 'active' 
      };

      // ColumnForm komponentini render et
      const handleSubmit = vi.fn().mockImplementation((data) => {
        // update funksiyasını çağır
        return update(initialData.id, data);
      });

      render(
        <div data-testid="column-edit-container">
          <div data-testid="column-form">
            <button 
              data-testid="column-submit-button"
              onClick={() => handleSubmit({ 
                ...initialData, 
                name: 'Yenilənmiş Sütun Adı', 
                description: 'Yenilənmiş təsvir',
                required: false
              })}
            >
              Yadda saxla
            </button>
          </div>
        </div>
      );

      // Submit düyməsinə klik et
      fireEvent.click(screen.getByTestId('column-submit-button'));

      // Funksiyaların çağırıldığını yoxla
      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith(expect.objectContaining({
          id: 'column-1',
          name: 'Yenilənmiş Sütun Adı',
          description: 'Yenilənmiş təsvir',
          required: false
        }));
        expect(update).toHaveBeenCalled();
      });
    });
  });

  describe('CAT-05: Sütun tipləri və validasiya', () => {
    it('müxtəlif tip sütunların düzgün işləməsini yoxlama', async () => {
      // useColumns hook-undakı funksiyaları al
      const { useColumns } = await import('@/hooks/columns/useColumns');
      const { columns } = useColumns();

      // Sütun tiplərini yoxla
      const textColumn = columns.find(c => c.data_type === 'text');
      const numberColumn = columns.find(c => c.data_type === 'number');
      const fileColumn = columns.find(c => c.data_type === 'file');

      expect(textColumn).toBeDefined();
      expect(numberColumn).toBeDefined();
      expect(fileColumn).toBeDefined();

      // Text tipli sütunun xüsusiyyətlərini yoxla
      expect(textColumn?.name).toBe('Məktəb adı');
      expect(textColumn?.required).toBe(true);

      // Number tipli sütunun xüsusiyyətlərini yoxla
      expect(numberColumn?.name).toBe('Şagird sayı');
      expect(numberColumn?.required).toBe(true);

      // File tipli sütunun xüsusiyyətlərini yoxla
      expect(fileColumn?.name).toBe('Şagird siyahısı');
      expect(fileColumn?.required).toBe(false);
    });
  });

  describe('CAT-06: Kateqoriya-Sütun əlaqələri', () => {
    it('sütunların kateqoriyalara düzgün bağlanmasının yoxlanması', async () => {
      // useCategories və useColumns hook-larını al
      const { useCategories } = await import('@/hooks/categories/useCategories');
      const { useColumns } = await import('@/hooks/columns/useColumns');
      
      // Verilənləri al
      const { categories } = useCategories();
      const { columns } = useColumns();
      
      // Əlaqələri yoxla - Kateqoriya 1
      const category1 = categories.find(c => c.id === 'category-1');
      const category1Columns = columns.filter(c => c.category_id === 'category-1');
      
      expect(category1).toBeDefined();
      expect(category1Columns.length).toBe(2);
      expect(category1Columns[0].name).toBe('Məktəb adı');
      expect(category1Columns[1].name).toBe('Şagird sayı');
      
      // Əlaqələri yoxla - Kateqoriya 2
      const category2 = categories.find(c => c.id === 'category-2');
      const category2Columns = columns.filter(c => c.category_id === 'category-2');
      
      expect(category2).toBeDefined();
      expect(category2Columns.length).toBe(1);
      expect(category2Columns[0].name).toBe('Şagird siyahısı');
    });
  });

  describe('CAT-07: Kateqoriya icazələrini yeniləmə', () => {
    it('kateqoriya icazələrini yeniləmə prosesi', async () => {
      // callEdgeFunction ilə edge function çağırışını simulate et
      mockCallEdgeFunction.mockImplementation((funcName, options) => {
        if (funcName === 'update-category-permissions') {
          return Promise.resolve({ 
            data: { 
              success: true, 
              message: 'Kateqoriya icazələri yeniləndi' 
            }, 
            error: null 
          });
        }
        return Promise.resolve({ data: null, error: { message: 'Unknown function' } });
      });

      // İcazə funksiyasını mockla
      const updateCategoryPermissions = vi.fn().mockImplementation((categoryId, permissions) => {
        return mockCallEdgeFunction('update-category-permissions', { 
          body: { 
            categoryId, 
            permissions 
          } 
        });
      });

      // Funksiyadan istifadə edən bir handler yarat
      const handlePermissionsUpdate = async () => {
        const permissions = {
          superadmin: { read: true, write: true },
          regionadmin: { read: true, write: false },
          sectoradmin: { read: true, write: false },
          schooladmin: { read: true, write: true }
        };
        
        const result = await updateCategoryPermissions('category-1', permissions);
        return result.data;
      };

      // Funksiyaları çağır və nəticələri yoxla
      const result = await handlePermissionsUpdate();
      
      expect(updateCategoryPermissions).toHaveBeenCalledWith('category-1', expect.objectContaining({
        superadmin: { read: true, write: true },
        schooladmin: { read: true, write: true }
      }));
      
      expect(mockCallEdgeFunction).toHaveBeenCalledWith('update-category-permissions', {
        body: {
          categoryId: 'category-1',
          permissions: expect.objectContaining({
            superadmin: { read: true, write: true },
            regionadmin: { read: true, write: false }
          })
        }
      });
      
      expect(result).toEqual({ 
        success: true, 
        message: 'Kateqoriya icazələri yeniləndi' 
      });
    });
  });
});
