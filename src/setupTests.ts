/**
 * Enhanced Test Setup - İnfoLine Test Infrastructure
 * 
 * Bu fayl test mühitini konfiqurasiya edir:
 * - Jest DOM matchers
 * - Global mocks
 * - Test environment setup
 * - Cleanup utilities
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, beforeAll, afterAll } from 'vitest';

// Global test setup
beforeAll(() => {
  // Setup global mocks that apply to all tests
  setupGlobalMocks();
});

beforeEach(() => {
  // Clean slate for each test
  vi.clearAllMocks();
});

afterEach(() => {
  // Cleanup after each test
  cleanup();
  vi.clearAllTimers();
});

afterAll(() => {
  // Cleanup global state
  vi.restoreAllMocks();
});

/**
 * Setup global mocks that apply to all tests
 */
function setupGlobalMocks() {
  // Mock window.matchMedia for responsive components
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  });

  // Mock ResizeObserver for components that use it
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock IntersectionObserver for lazy loading components
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock HTMLElement.scrollIntoView for navigation tests
  Element.prototype.scrollIntoView = vi.fn();

  // Mock HTMLElement.scrollTo for scroll-based components
  Element.prototype.scrollTo = vi.fn();

  // Mock window.scroll for page scroll tests
  window.scroll = vi.fn();
  window.scrollTo = vi.fn();

  // Mock console methods to reduce noise in tests
  global.console = {
    ...console,
    // Keep console.log and console.error for debugging
    warn: vi.fn(),
    debug: vi.fn(),
    info: vi.fn()
  };

  // Mock URL.createObjectURL for file upload tests
  global.URL.createObjectURL = vi.fn(() => 'mock-url');
  global.URL.revokeObjectURL = vi.fn();

  // Mock File constructor for file upload tests
  global.File = class File {
    name: string;
    size: number;
    type: string;
    lastModified: number;

    constructor(bits: any[], filename: string, options: any = {}) {
      this.name = filename;
      this.size = bits.reduce((acc, bit) => acc + (bit?.length || 0), 0);
      this.type = options.type || '';
      this.lastModified = options.lastModified || Date.now();
    }
  } as any;

  // Mock crypto for components that use random IDs
  Object.defineProperty(global, 'crypto', {
    value: {
      randomUUID: vi.fn(() => 'mock-uuid-' + Math.random().toString(36).substr(2, 9)),
      getRandomValues: vi.fn((arr: any) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
      })
    }
  });

  // Mock localStorage and sessionStorage
  const mockStorage = {
    getItem: vi.fn((key: string) => null),
    setItem: vi.fn((key: string, value: string) => {}),
    removeItem: vi.fn((key: string) => {}),
    clear: vi.fn(() => {}),
    length: 0,
    key: vi.fn((index: number) => null)
  };

  Object.defineProperty(window, 'localStorage', { value: mockStorage });
  Object.defineProperty(window, 'sessionStorage', { value: mockStorage });
}

// Supabase mock setup - more comprehensive
vi.mock('@/integrations/supabase/client', () => {
  const mockQueryBuilder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    insert: vi.fn().mockResolvedValue({ data: [], error: null }),
    update: vi.fn().mockResolvedValue({ data: [], error: null }),
    upsert: vi.fn().mockResolvedValue({ data: [], error: null }),
    delete: vi.fn().mockResolvedValue({ data: [], error: null }),
    then: vi.fn().mockResolvedValue({ data: [], error: null })
  };

  return {
    supabase: {
      auth: {
        getSession: vi.fn().mockResolvedValue({ 
          data: { session: null }, 
          error: null 
        }),
        onAuthStateChange: vi.fn(() => ({ 
          data: { subscription: { unsubscribe: vi.fn() } } 
        })),
        signInWithPassword: vi.fn().mockResolvedValue({
          data: { user: null },
          error: null
        }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: null
        })
      },
      from: vi.fn(() => mockQueryBuilder),
      rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
      functions: {
        invoke: vi.fn().mockResolvedValue({ data: null, error: null })
      },
      storage: {
        from: vi.fn(() => ({
          upload: vi.fn().mockResolvedValue({ data: null, error: null }),
          download: vi.fn().mockResolvedValue({ data: null, error: null }),
          remove: vi.fn().mockResolvedValue({ data: null, error: null }),
          list: vi.fn().mockResolvedValue({ data: [], error: null }),
          getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'mock-url' } }))
        }))
      }
    }
  };
});

// Auth store mock - more realistic
vi.mock('@/hooks/auth/useAuthStore', () => {
  const mockAuthStore = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    login: vi.fn().mockResolvedValue(true),
    logout: vi.fn().mockResolvedValue(true),
    signIn: vi.fn().mockResolvedValue(true),
    signOut: vi.fn().mockResolvedValue(true),
    clearError: vi.fn(),
    initializeAuth: vi.fn(),
    initialized: true
  };

  const useAuthStore = vi.fn((selector?: any) => {
    if (typeof selector === 'function') {
      return selector(mockAuthStore);
    }
    return mockAuthStore;
  });

  useAuthStore.getState = () => mockAuthStore;
  useAuthStore.setState = vi.fn();
  useAuthStore.subscribe = vi.fn();

  return {
    useAuthStore,
    default: useAuthStore
  };
});

// Language context mock
vi.mock('@/context/LanguageContext', () => {
  const mockLanguageContext = {
    language: 'az',
    setLanguage: vi.fn(),
    t: vi.fn((key: string, options?: any) => key),
    i18n: { 
      t: vi.fn((key: string) => key), 
      changeLanguage: vi.fn() 
    },
    isRtl: false,
    availableLanguages: ['az', 'en', 'ru', 'tr'],
    currentLanguage: 'az',
    languages: {
      az: { nativeName: 'Azərbaycan', flag: '🇦🇿' },
      en: { nativeName: 'English', flag: '🇬🇧' },
      ru: { nativeName: 'Русский', flag: '🇷🇺' },
      tr: { nativeName: 'Türkçe', flag: '🇹🇷' }
    }
  };

  return {
    useLanguage: () => mockLanguageContext,
    useLanguageSafe: () => mockLanguageContext,
    LanguageProvider: ({ children }: { children: React.ReactNode }) => children,
    LanguageContext: {
      Provider: ({ children }: { children: React.ReactNode }) => children,
      Consumer: ({ children }: { children: (value: any) => React.ReactNode }) => 
        children(mockLanguageContext)
    }
  };
});

// Permissions mock
vi.mock('@/hooks/permissions/usePermissions', () => ({
  usePermissions: () => ({
    userRole: 'superadmin',
    isAdmin: true,
    isSuperAdmin: true,
    canManageUsers: true,
    canManageRegions: true,
    canManageSectors: true,
    canManageSchools: true,
    canManageCategories: true,
    canApproveData: true,
    canViewReports: true
  })
}));

// Toast notifications mock
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn()
  },
  Toaster: ({ children }: { children?: React.ReactNode }) => children
}));

// React Router mock
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
    useLocation: vi.fn(() => ({ pathname: '/', search: '', hash: '', state: null })),
    useParams: vi.fn(() => ({})),
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()])
  };
});

// Theme provider mock
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
    themes: ['light', 'dark'],
    systemTheme: 'light'
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children
}));

// Zustand store mocks helper
export const createMockZustandStore = <T,>(initialState: T) => {
  const store = {
    ...initialState,
    subscribe: vi.fn(),
    getState: vi.fn(() => store),
    setState: vi.fn((partial: Partial<T>) => {
      Object.assign(store, partial);
    }),
    destroy: vi.fn()
  };
  return store;
};

// Test data helpers
export const TEST_USER = {
  id: 'test-user-id',
  email: 'test@example.com',
  full_name: 'Test User',
  role: 'superadmin' as const,
  language: 'az',
  status: 'active' as const
};

export const TEST_REGION = {
  id: 'test-region-id',
  name: 'Test Region',
  status: 'active' as const
};

export const TEST_SCHOOL = {
  id: 'test-school-id',
  name: 'Test School',
  region_id: 'test-region-id',
  sector_id: 'test-sector-id',
  status: 'active' as const
};

// Global test utilities
global.testUtils = {
  TEST_USER,
  TEST_REGION,
  TEST_SCHOOL,
  createMockZustandStore
};

// Type augmentation for global test utilities
declare global {
  var testUtils: {
    TEST_USER: typeof TEST_USER;
    TEST_REGION: typeof TEST_REGION;
    TEST_SCHOOL: typeof TEST_SCHOOL;
    createMockZustandStore: typeof createMockZustandStore;
  };
}
