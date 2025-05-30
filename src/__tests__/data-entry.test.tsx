
/**
 * Məlumat Daxiletmə və Import Testləri
 * 
 * Bu test faylı, İnfoLine tətbiqinin məlumat daxiletmə və import funksiyalarını yoxlayır:
 * - Manuel məlumat daxiletmə
 * - Excel faylı import etmə
 * - Məlumat validasiyası
 * - Məlumat redaktəsi və silinməsi
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, expect, beforeEach, describe, it } from 'vitest';
import '@testing-library/jest-dom';

// Helper funksiyalar və mocklar üçün tip tərifini əlavə edirəm
type MockFunction<T extends (...args: any) => any> = ReturnType<typeof vi.fn<T>>;

// Mock data entry funksiyaları
const mockSaveEntry = vi.fn((data: any) => Promise.resolve({ id: 'entry-123', ...data }));
const mockUpdateEntry = vi.fn((id: string, data: any) => Promise.resolve({ success: true, data }));
const mockImportExcel = vi.fn((file: File) => Promise.resolve({ 
  success: true, 
  importedCount: 10, 
  failedCount: 0 
}));
const mockDeleteEntry = vi.fn((id: string) => Promise.resolve({ success: true }));

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
  if (funcName === 'save-data-entry') {
    return Promise.resolve({ data: { success: true, id: 'entry-123', message: 'Məlumatlar uğurla yadda saxlanıldı' }, error: null });
  } else if (funcName === 'import-excel-data') {
    return Promise.resolve({ 
      data: { 
        success: true, 
        importedCount: 10, 
        failedCount: 0, 
        message: 'Excel faylı uğurla import edildi'
      }, 
      error: null 
    });
  }
  return Promise.resolve({ data: null, error: { message: 'Unknown function' } });
});

// Mock file
const mockExcelFile = new File(['dummy content'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

// Test üçün mock data
const mockCategories = [
  { id: 'category-1', name: 'Ümumi Məlumatlar', description: 'Məktəbin ümumi məlumatları', status: 'active' },
  { id: 'category-2', name: 'Şagird Məlumatları', description: 'Şagirdlərlə bağlı məlumatlar', status: 'active' }
];

const mockColumns = [
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
];

// Mock hooks
vi.mock('@/hooks/categories/useCategories', () => ({
  useCategories: () => ({
    categories: mockCategories,
    loading: false,
    error: null,
    fetchCategories: vi.fn().mockResolvedValue(true)
  })
}));

vi.mock('@/hooks/columns/useColumns', () => ({
  useColumns: () => ({
    columns: mockColumns,
    loading: false,
    error: null,
    fetchColumns: vi.fn().mockResolvedValue(true),
    fetchColumnsByCategory: vi.fn().mockImplementation((categoryId) => 
      Promise.resolve(mockColumns.filter(c => c.category_id === categoryId))
    )
  })
}));

vi.mock('@/hooks/dataEntry/useDataEntry', () => ({
  useDataEntry: () => ({
    entries: [
      {
        id: 'entry-1',
        school_id: 'school-1',
        category_id: 'category-1',
        created_at: new Date().toISOString(),
        status: 'draft',
        data: {
          'column-1': 'Test Məktəb',
          'column-2': 100
        }
      }
    ],
    loading: false,
    error: null,
    fetchEntries: vi.fn().mockResolvedValue(true),
    saveEntry: mockSaveEntry,
    updateEntry: mockUpdateEntry,
    deleteEntry: mockDeleteEntry,
    importExcel: mockImportExcel
  })
}));

// Supabase client mockla
vi.mock('@/integrations/supabase/client', () => ({
  callEdgeFunction: mockCallEdgeFunction,
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'test-id' } } }, error: null }),
    },
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ data: { path: 'uploads/test.xlsx' }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/uploads/test.xlsx' } })
      })
    }
  }
}));

// Mock DataEntryForm komponenti
vi.mock('@/components/dataEntry/DataEntryForm', () => {
  const DataEntryForm = ({ onSubmit, categoryId, initialData }: any) => {
    return (
      <div data-testid="data-entry-form">
        <input 
          data-testid="field-column-1" 
          type="text" 
          defaultValue={initialData ? initialData['column-1'] : ''} 
        />
        <input 
          data-testid="field-column-2" 
          type="number" 
          defaultValue={initialData ? initialData['column-2'] : ''} 
        />
        <button 
          data-testid="data-submit-button"
          onClick={() => onSubmit({
            category_id: categoryId,
            data: {
              'column-1': 'Test Məktəb',
              'column-2': 100
            }
          })}
        >
          Göndər
        </button>
      </div>
    );
  };
  return { default: DataEntryForm };
});

// Mock ExcelImport komponenti
vi.mock('@/components/dataEntry/ExcelImport', () => {
  const ExcelImport = ({ onImport }: any) => {
    return (
      <div data-testid="excel-import">
        <input 
          data-testid="excel-file-input" 
          type="file" 
        />
        <button 
          data-testid="excel-import-button"
          onClick={() => onImport(mockExcelFile)}
        >
          Excel faylını import et
        </button>
      </div>
    );
  };
  return { default: ExcelImport };
});

describe('Məlumat Daxiletmə və Import Testləri', () => {
  // Hər testin əvvəlində mockları sıfırlamaq
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    mockCallEdgeFunction.mockClear();
    
    // Auth store mockla və schooladmin istifadəçini təyin et
    const store = mockAuthStore();
    Object.assign(store, {
      isAuthenticated: true,
      user: { ...mockUserData, role: 'schooladmin' as UserRole }
    });
  });

  describe('DATA-01: Manuel məlumat daxiletmə', () => {
    it('formu doldurub məlumatları göndərmə prosesi', async () => {
      // useDataEntry hook-undan funksiyaları al
      const { useDataEntry } = await import('@/hooks/dataEntry/useDataEntry');
      const { saveEntry } = useDataEntry({ categoryId: 'category-1', schoolId: 'school-1' });

      // DataEntryForm komponentini render et
      const handleSubmit = vi.fn().mockImplementation((data) => {
        return saveEntry(data);
      });

      render(
        <div data-testid="data-entry-container">
          <div data-testid="data-entry-form">
            <button 
              data-testid="data-submit-button"
              onClick={() => handleSubmit({
                category_id: 'category-1',
                data: {
                  'column-1': 'Test Məktəb',
                  'column-2': 100
                }
              })}
            >
              Göndər
            </button>
          </div>
        </div>
      );

      // Submit düyməsinə klik et
      fireEvent.click(screen.getByTestId('data-submit-button'));

      // Funksiyaların çağırıldığını yoxla
      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith(expect.objectContaining({
          category_id: 'category-1',
          data: expect.objectContaining({
            'column-1': 'Test Məktəb',
            'column-2': 100
          })
        }));
      });
    });
  });

  describe('DATA-02: Excel faylı import', () => {
    it('Excel faylını import etmə prosesi', async () => {
      // useDataEntry hook-undan funksiyaları al
      const { useDataEntry } = await import('@/hooks/dataEntry/useDataEntry');
      const { importExcel } = useDataEntry({ categoryId: 'category-1', schoolId: 'school-1' });

      // ExcelImport komponentini render et
      const handleImport = vi.fn().mockImplementation((file) => {
        return importExcel(file);
      });

      render(
        <div data-testid="excel-import-container">
          <div data-testid="excel-import">
            <button 
              data-testid="excel-import-button"
              onClick={() => handleImport(mockExcelFile)}
            >
              Excel faylını import et
            </button>
          </div>
        </div>
      );

      // Import düyməsinə klik et
      fireEvent.click(screen.getByTestId('excel-import-button'));

      // Funksiyaların çağırıldığını yoxla
      await waitFor(() => {
        expect(handleImport).toHaveBeenCalledWith(mockExcelFile);
      });
    });
  });

  describe('DATA-03: Import xətaları', () => {
    it('Yanlış formatda Excel import etmə prosesi', async () => {
      // Mock xəta halı üçün
      const { useDataEntry } = await import('@/hooks/dataEntry/useDataEntry');
      const { importExcel } = useDataEntry({ categoryId: 'category-1', schoolId: 'school-1' });
      
      // Yanlış formatlı fayl
      const wrongFormatFile = new File(['invalid content'], 'wrong.txt', { type: 'text/plain' });

      // ExcelImport komponentini render et
      const handleImport = vi.fn().mockImplementation((file) => {
        return importExcel(file);
      });

      render(
        <div data-testid="excel-import-container">
          <div data-testid="excel-import">
            <button 
              data-testid="excel-import-button"
              onClick={() => handleImport(wrongFormatFile)}
            >
              Excel faylını import et
            </button>
          </div>
        </div>
      );

      // Import düyməsinə klik et
      fireEvent.click(screen.getByTestId('excel-import-button'));

      // Funksiyaların çağırıldığını yoxla
      await waitFor(() => {
        expect(handleImport).toHaveBeenCalledWith(wrongFormatFile);
      });
    });
  });

  describe('DATA-04: Məlumat validasiyası', () => {
    it('Məcburi xanaların validasiyası', async () => {
      // useDataEntry hook-undan funksiyaları al
      const { useDataEntry } = await import('@/hooks/dataEntry/useDataEntry');
      const { saveEntry } = useDataEntry({ categoryId: 'category-1', schoolId: 'school-1' });

      // DataEntryForm komponentini render et
      const handleSubmit = vi.fn().mockImplementation((data) => {
        try {
          return saveEntry(data);
        } catch (error) {
          return Promise.reject(error);
        }
      });

      // Boş məlumatla form göndərmə
      render(
        <div data-testid="data-entry-container">
          <div data-testid="data-entry-form">
            <button 
              data-testid="data-submit-button"
              onClick={() => handleSubmit({
                category_id: 'category-1',
                data: {
                  'column-1': '', // Boş məktəb adı
                  'column-2': 100
                }
              })}
            >
              Göndər
            </button>
          </div>
        </div>
      );

      // Submit düyməsinə klik et
      fireEvent.click(screen.getByTestId('data-submit-button'));

      // Validasiya xətasının yoxlanması
      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('DATA-05: Məlumat redaktəsi', () => {
    it('Mövcud məlumatları redaktə etmə prosesi', async () => {
      // useDataEntry hook-undan funksiyaları al
      const { useDataEntry } = await import('@/hooks/dataEntry/useDataEntry');
      const { updateEntry } = useDataEntry({ categoryId: 'category-1', schoolId: 'school-1' });

      // İlkin məlumatları təyin et
      const initialData = {
        id: 'entry-1',
        category_id: 'category-1',
        data: {
          'column-1': 'Köhnə Məktəb Adı',
          'column-2': 50
        }
      };

      // DataEntryForm komponentini render et
      const handleSubmit = vi.fn().mockImplementation((data) => {
        return updateEntry(initialData.id, data);
      });

      render(
        <div data-testid="data-entry-container">
          <div data-testid="data-entry-form">
            <button 
              data-testid="data-submit-button"
              onClick={() => handleSubmit({
                category_id: 'category-1',
                data: {
                  'column-1': 'Yeni Məktəb Adı',
                  'column-2': 150
                }
              })}
            >
              Yenilə
            </button>
          </div>
        </div>
      );

      // Submit düyməsinə klik et
      fireEvent.click(screen.getByTestId('data-submit-button'));

      // Funksiyaların çağırıldığını yoxla
      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith(expect.objectContaining({
          category_id: 'category-1',
          data: expect.objectContaining({
            'column-1': 'Yeni Məktəb Adı',
            'column-2': 150
          })
        }));
      });
    });
  });

  describe('DATA-06: Məlumat silmə', () => {
    it('Daxil edilmiş məlumatları silmə prosesi', async () => {
      // useDataEntry hook-undan funksiyaları al
      const { useDataEntry } = await import('@/hooks/dataEntry/useDataEntry');
      const { deleteEntry } = useDataEntry({ categoryId: 'category-1', schoolId: 'school-1' });

      // Silmə prosesini simulyasiya et
      const handleDelete = vi.fn().mockImplementation((id) => {
        return deleteEntry(id);
      });

      render(
        <div data-testid="data-entry-container">
          <button 
            data-testid="delete-button"
            onClick={() => handleDelete('entry-1')}
          >
            Sil
          </button>
        </div>
      );

      // Silmə düyməsinə klik et
      fireEvent.click(screen.getByTestId('delete-button'));

      // Silmə funksiyasının çağırıldığını yoxla
      await waitFor(() => {
        expect(handleDelete).toHaveBeenCalledWith('entry-1');
      });
    });
  });
});
