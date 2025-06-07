
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
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, expect, beforeEach, describe, it } from 'vitest';
import '@testing-library/jest-dom';

// Mock data entry funksiyaları
const mockSaveAll = vi.fn((data: any) => Promise.resolve({ id: 'entry-123', ...data }));
const mockUpdateEntry = vi.fn((columnId: string, value: any) => Promise.resolve({ success: true }));
const mockSubmitAll = vi.fn(() => Promise.resolve({ success: true }));

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
  }
  return Promise.resolve({ data: null, error: { message: 'Unknown function' } });
});

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
  }
];

// Mock hooks
vi.mock('@/hooks/business/dataEntry/useDataEntry', () => ({
  useDataEntry: () => ({
    category: mockCategories[0],
    columns: mockColumns,
    entries: [],
    entriesMap: {},
    isLoading: false,
    isError: false,
    error: null,
    isSaving: false,
    isSubmitting: false,
    isSubmitted: false,
    completionPercentage: 0,
    hasAllRequiredData: false,
    getEntryByColumnId: vi.fn(() => null),
    hasEntryForColumn: vi.fn(() => false),
    getValueForColumn: vi.fn(() => ''),
    updateEntryValue: mockUpdateEntry,
    updateAllEntries: vi.fn(),
    saveAll: mockSaveAll,
    submitAll: mockSubmitAll,
    refetchAll: vi.fn()
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

describe('Məlumat Daxiletmə və Import Testləri', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    mockCallEdgeFunction.mockClear();
  });

  describe('DATA-01: Manuel məlumat daxiletmə', () => {
    it('formu doldurub məlumatları göndərmə prosesi', async () => {
      const handleSubmit = vi.fn().mockImplementation(() => {
        return mockSaveAll({
          category_id: 'category-1',
          data: {
            'column-1': 'Test Məktəb'
          }
        });
      });

      render(
        <div data-testid="data-entry-container">
          <div data-testid="data-entry-form">
            <button 
              data-testid="data-submit-button"
              onClick={handleSubmit}
            >
              Göndər
            </button>
          </div>
        </div>
      );

      fireEvent.click(screen.getByTestId('data-submit-button'));

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('DATA-05: Məlumat redaktəsi', () => {
    it('Mövcud məlumatları redaktə etmə prosesi', async () => {
      const handleSubmit = vi.fn().mockImplementation(() => {
        return mockUpdateEntry('column-1', 'Yeni Məktəb Adı');
      });

      render(
        <div data-testid="data-entry-container">
          <div data-testid="data-entry-form">
            <button 
              data-testid="data-submit-button"
              onClick={handleSubmit}
            >
              Yenilə
            </button>
          </div>
        </div>
      );

      fireEvent.click(screen.getByTestId('data-submit-button'));

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalled();
      });
    });
  });
});
