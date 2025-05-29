/**
 * Test Vasitələri
 * 
 * Bu fayl, test prosesində istifadə edilən ümumi funksiyaları və komponentləri təmin edir:
 * - renderWithProviders: Testlərdə istifadə edilən ortaq mühiti təmin edir
 * - mockSupabase: Supabase sorğularını mocklamaq üçün funksiya
 * - mockUserRole: İstifadəçi rollarını mocklamaq üçün funksiya
 * - mockEdgeFunctions: Edge Functions sorğularını mocklamaq üçün funksiya
 */

import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Test üçün istifadəçi tipləri
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user';

// Test istifadəçi məlumatları
export const mockUserData = {
  id: 'test-user-id',
  email: 'test@example.com',
  full_name: 'Test User',
  language: 'az',
  role: 'superadmin' as UserRole,
  status: 'active',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
};

/**
 * Test komponentini bütün lazımi providerlərlə render edir
 */
export const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter>
      {/* Dil provideri əlavə edildi */}
      <MockLanguageProvider>
        {ui}
      </MockLanguageProvider>
    </MemoryRouter>
  );
};

export const MockLanguageProvider = ({ children }: { children: React.ReactNode }) => {
  return React.createElement('div', { 'data-testid': 'mock-language-provider', className: 'mock-language-provider' }, children);
};

/**
 * Supabase sorğularını mocklamaq üçün funksiya
 */
export const mockSupabase = () => {
  vi.mock('@/integrations/supabase/client', () => ({
    supabase: {
      auth: {
        getSession: vi.fn().mockResolvedValue({ 
          data: { session: { user: { id: mockUserData.id } } }, 
          error: null 
        }),
        signInWithPassword: vi.fn().mockResolvedValue({ 
          data: { user: mockUserData }, 
          error: null 
        }),
        signOut: vi.fn().mockResolvedValue({ error: null })
      },
      from: () => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: {}, error: null }),
        insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
        update: vi.fn().mockResolvedValue({ data: {}, error: null }),
        delete: vi.fn().mockResolvedValue({ data: {}, error: null })
      })
    }
  }));
};

/**
 * İstifadəçi rollarını mocklamaq üçün funksiya
 */
export const mockUserRole = (role: UserRole = 'superadmin') => {
  vi.mock('@/hooks/permissions/usePermissions', () => ({
    usePermissions: () => ({
      userRole: role,
      isAdmin: true,
      isSuperAdmin: role === 'superadmin',
      canManageUsers: ['superadmin', 'regionadmin'].includes(role),
      canManageRegions: role === 'superadmin',
      canManageSectors: ['superadmin', 'regionadmin'].includes(role),
      canManageSchools: ['superadmin', 'regionadmin', 'sectoradmin'].includes(role)
    })
  }));
};

/**
 * Edge Functions sorğularını mocklamaq üçün funksiya
 */
export const mockEdgeFunctions = () => {
  global.fetch = vi.fn().mockImplementation((url: string, options) => {
    if (url.includes('create-user')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 'new-user-id', success: true })
      });
    }
    
    if (url.includes('assign-region-admin')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
    }
    
    if (url.includes('create-region-admin')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 'new-region-id', success: true })
      });
    }
    
    if (options && (!options.headers || !options.headers['Authorization'])) {
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'No API key found in request' })
      });
    }
    
    return Promise.resolve({
      ok: false,
      json: () => Promise.resolve({ error: 'Unknown endpoint' })
    });
  }) as any;
};

// Global Auth Store mockları üçün shared store
export const globalMockStore = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  error: null,
  clearError: vi.fn(),
  initializeAuth: vi.fn(),
  login: vi.fn().mockResolvedValue(true),
  logout: vi.fn().mockResolvedValue(true),
  signIn: vi.fn().mockResolvedValue(true), // signIn funksiyasını əlavə etdik
  signOut: vi.fn().mockResolvedValue(true),
  initialized: true
};

// Language context-i mockla
vi.mock('@/context/LanguageContext', () => {
  // Mock dil funksiyaları və provideri
  const t = (key: string, options?: any) => {
    return key;
  };
  
  const mockLanguageContext = {
    language: 'az',
    setLanguage: vi.fn(),
    t,
    i18n: { t, changeLanguage: vi.fn() },
    isRtl: false,
    availableLanguages: ['az', 'en', 'ru'],
    currentLanguage: 'az',
    languages: {
      az: { nativeName: 'Azərbaycan', flag: '🇦🇿' },
      en: { nativeName: 'English', flag: '🇬🇧' },
      ru: { nativeName: 'Русский', flag: '🇷🇺' }
    },
    supportedLanguages: ['az', 'en', 'ru']
  };
  
  const LanguageContext = {
    Provider: ({ children }: { children: React.ReactNode }) => {
      return React.createElement('div', { 'data-testid': 'language-provider' }, children);
    },
    Consumer: ({ children }: { children: (context: any) => React.ReactNode }) => {
      return children(mockLanguageContext);
    }
  };

  return {
    LanguageContext,
    useLanguage: () => mockLanguageContext,
    useLanguageSafe: () => mockLanguageContext,
    LanguageProvider: ({ children }: { children: React.ReactNode }) => {
      return React.createElement(
        LanguageContext.Provider,
        null,
        children
      );
    },
    default: {
      LanguageContext,
      useLanguage: () => mockLanguageContext,
      useLanguageSafe: () => mockLanguageContext,
      LanguageProvider: ({ children }: { children: React.ReactNode }) => {
        return React.createElement(
          LanguageContext.Provider,
          null,
          children
        );
      }
    }
  };
});

// useAuthStore hook-unu əvvəlcədən mockla
const useAuthStoreMock = vi.fn((selector: any) => {
  if (typeof selector === 'function') {
    return selector(globalMockStore);
  }
  return globalMockStore;
}) as any;

useAuthStoreMock.getState = () => {
  return globalMockStore;
};

useAuthStoreMock.mockReturnValue = (value: any) => {
  globalMockStore.user = value.user || null;
  globalMockStore.isAuthenticated = value.isAuthenticated || false;
  globalMockStore.isLoading = value.isLoading || false;
  globalMockStore.error = value.error || null;
  return useAuthStoreMock;
};

vi.mock('@/hooks/auth/useAuthStore', () => {
  return {
    useAuthStore: useAuthStoreMock,
    selectIsAuthenticated: (state: any) => state.isAuthenticated,
    selectIsLoading: (state: any) => state.isLoading,
    selectUser: (state: any) => state.user,
    selectError: (state: any) => state.error,
    default: {
      useAuthStore: useAuthStoreMock,
      selectIsAuthenticated: (state: any) => state.isAuthenticated,
      selectIsLoading: (state: any) => state.isLoading,
      selectUser: (state: any) => state.user,
      selectError: (state: any) => state.error
    }
  };
});

/**
 * Auth store mocklamaq üçün funksiya
 */
export const mockAuthStore = () => {
  Object.assign(globalMockStore, {
    isAuthenticated: false,
    isLoading: false,
    user: null,
    error: null,
    clearError: vi.fn(),
    initializeAuth: vi.fn(),
    login: vi.fn().mockResolvedValue(true),
    logout: vi.fn().mockResolvedValue(true),
    signIn: vi.fn().mockResolvedValue(true),
    signOut: vi.fn().mockResolvedValue(true),
    initialized: true
  });
  
  return globalMockStore;
};

/**
 * Lokal və sessiya saxlamağı mocklamaq üçün funksiya
 */
export const mockStorage = () => {
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn()
  };
  
  const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn()
  };
  
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });
  
  return { localStorageMock, sessionStorageMock };
};

// Mock useCategoriesQuery hook
export const mockUseCategoriesQuery = () => ({
  categories: [
    { id: 'category-1', name: 'Ümumi Məlumatlar', description: 'Məktəbin ümumi məlumatları', status: 'active' },
    { id: 'category-2', name: 'Şagird Məlumatları', description: 'Şagirdlərlə bağlı məlumatlar', status: 'active' }
  ],
  loading: false,
  error: null,
  filter: {},
  updateFilter: vi.fn(),
  createCategory: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'new-category-id', ...data })),
  updateCategory: vi.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),
  deleteCategory: vi.fn().mockResolvedValue(true),
  refetch: vi.fn().mockResolvedValue({}),
  // Compatibility functions
  add: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'new-category-id', ...data })),
  update: vi.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),
  remove: vi.fn().mockResolvedValue(true)
});

// Mock useColumnsQuery hook
export const mockUseColumnsQuery = () => ({
  columns: [
    { 
      id: 'column-1', 
      name: 'Məktəb adı', 
      description: 'Məktəbin rəsmi adı', 
      type: 'text', 
      category_id: 'category-1', 
      is_required: true, 
      status: 'active' 
    },
    { 
      id: 'column-2', 
      name: 'Şagird sayı', 
      description: 'Ümumi şagird sayı', 
      type: 'number', 
      category_id: 'category-1', 
      is_required: true, 
      status: 'active' 
    },
    { 
      id: 'column-3', 
      name: 'Şagird siyahısı', 
      description: 'Excel formatında şagird siyahısı', 
      type: 'file', 
      category_id: 'category-2', 
      is_required: false, 
      status: 'active' 
    }
  ],
  createColumn: vi.fn().mockImplementation((categoryId, data) => Promise.resolve({ id: 'new-column-id', category_id: categoryId, ...data })),
  updateColumn: vi.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),
  deleteColumn: vi.fn().mockResolvedValue(true),
  fetchColumnsByCategory: vi.fn().mockResolvedValue(true),
  // Compatibility functions
  add: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'new-column-id', ...data })),
  update: vi.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),
  remove: vi.fn().mockResolvedValue(true)
});
