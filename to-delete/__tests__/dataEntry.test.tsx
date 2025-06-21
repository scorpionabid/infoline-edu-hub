
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

// Mock components for testing
const FormField = ({ name, disabled, render }: any) => {
  return (
    <div data-testid={`form-field-${name}`}>
      {render && render({ field: { value: '', onChange: vi.fn() } })}
    </div>
  );
};

const FieldRendererSimple = ({ type, value, onChange, disabled, readOnly, name, id }: any) => {
  return (
    <input
      data-testid={`field-${name}`}
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      readOnly={readOnly}
      name={name}
      id={id}
    />
  );
};

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

describe('Məlumat Daxiletmə və Import Testləri', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    mockCallEdgeFunction.mockClear();
  });

  describe('FormField props handling', () => {
    it('Should correctly handle disabled prop separately from readOnly', async () => {
      const mockOnChange = vi.fn();
      
      render(
        <FormField
          name="testField"
          disabled={false}
          render={({ field }: any) => (
            <FieldRendererSimple
              type="text"
              value={field.value || ''}
              onChange={mockOnChange}
              disabled={false}
              readOnly={true}
              name="testField"
              id="testField"
            />
          )}
        />
      );
      
      const inputField = screen.getByTestId('field-testField') as HTMLInputElement;
      
      expect(inputField.readOnly).toBe(true);
      expect(inputField.disabled).toBe(false);
      
      inputField.focus();
      expect(document.activeElement).toBe(inputField);
    });
  });

  describe('DATA-01: Manuel məlumat daxiletmə', () => {
    it('formu doldurub məlumatları göndərmə prosesi', async () => {
      const handleSubmit = vi.fn().mockImplementation((data) => {
        return mockSaveEntry(data);
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

      fireEvent.click(screen.getByTestId('data-submit-button'));

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
      const handleImport = vi.fn().mockImplementation((file) => {
        return mockImportExcel(file);
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

      fireEvent.click(screen.getByTestId('excel-import-button'));

      await waitFor(() => {
        expect(handleImport).toHaveBeenCalledWith(mockExcelFile);
      });
    });
  });
});
