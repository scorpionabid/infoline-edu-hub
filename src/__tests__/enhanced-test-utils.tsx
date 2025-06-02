/**
 * Enhanced Test Utilities - İnfoLine Test Infrastructure
 * 
 * Bu fayl real komponentlərlə uyğun enhanced test utilities təmin edir:
 * - Real provider-lərlə test rendering
 * - Intelligent mocking system
 * - Test data factories
 * - Common test patterns
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Test data types
export interface TestUser {
  id: string;
  email: string;
  full_name: string;
  role: 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin';
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  language: string;
  status: 'active' | 'inactive';
}

export interface TestRegion {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
}

export interface TestSchool {
  id: string;
  name: string;
  region_id: string;
  sector_id: string;
  status: 'active' | 'inactive';
  completion_rate?: number;
}

export interface TestCategory {
  id: string;
  name: string;
  description?: string;
  assignment: 'all' | 'sectors';
  status: 'active' | 'inactive';
  deadline?: string;
}

// Test data factories
export const createTestUser = (overrides: Partial<TestUser> = {}): TestUser => ({
  id: 'test-user-id',
  email: 'test@example.com',
  full_name: 'Test User',
  role: 'superadmin',
  language: 'az',
  status: 'active',
  ...overrides
});

export const createTestRegion = (overrides: Partial<TestRegion> = {}): TestRegion => ({
  id: 'test-region-id',
  name: 'Test Region',
  description: 'Test region description',
  status: 'active',
  ...overrides
});

export const createTestSchool = (overrides: Partial<TestSchool> = {}): TestSchool => ({
  id: 'test-school-id',
  name: 'Test School',
  region_id: 'test-region-id',
  sector_id: 'test-sector-id',
  status: 'active',
  completion_rate: 75,
  ...overrides
});

export const createTestCategory = (overrides: Partial<TestCategory> = {}): TestCategory => ({
  id: 'test-category-id',
  name: 'Test Category',
  description: 'Test category description',
  assignment: 'all',
  status: 'active',
  ...overrides
});

// Enhanced provider wrapper
interface TestProvidersProps {
  children: React.ReactNode;
  initialRoute?: string;
  user?: TestUser | null;
  enableRouter?: boolean;
  queryClient?: QueryClient;
}

export const TestProviders: React.FC<TestProvidersProps> = ({
  children,
  initialRoute = '/',
  user = null,
  enableRouter = true,
  queryClient
}) => {
  const defaultQueryClient = React.useMemo(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: Infinity,
        },
      },
    }),
    []
  );

  const client = queryClient || defaultQueryClient;

  const RouterWrapper = enableRouter ? 
    ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={[initialRoute]}>
        {children}
      </MemoryRouter>
    ) : 
    React.Fragment;

  return (
    <QueryClientProvider client={client}>
      <RouterWrapper>
        <MockLanguageProvider>
          <MockAuthProvider user={user}>
            {children}
          </MockAuthProvider>
        </MockLanguageProvider>
      </RouterWrapper>
    </QueryClientProvider>
  );
};

// Mock providers
export const MockLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mockLanguageContext = {
    language: 'az',
    setLanguage: vi.fn(),
    t: (key: string) => key,
    isRtl: false,
    availableLanguages: ['az', 'en', 'ru']
  };

  return React.createElement(
    'div',
    { 'data-testid': 'mock-language-provider' },
    children
  );
};

export const MockAuthProvider: React.FC<{ children: React.ReactNode; user?: TestUser | null }> = ({ 
  children, 
  user = null 
}) => {
  return React.createElement(
    'div',
    { 'data-testid': 'mock-auth-provider', 'data-user': user?.id || 'anonymous' },
    children
  );
};

// Enhanced render function
interface EnhancedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string;
  user?: TestUser | null;
  enableRouter?: boolean;
  queryClient?: QueryClient;
}

export const renderWithProviders = (
  ui: React.ReactElement,
  options: EnhancedRenderOptions = {}
) => {
  const {
    initialRoute = '/',
    user = null,
    enableRouter = true,
    queryClient,
    ...renderOptions
  } = options;

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <TestProviders
      initialRoute={initialRoute}
      user={user}
      enableRouter={enableRouter}
      queryClient={queryClient}
    >
      {children}
    </TestProviders>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Mock store manager
export class MockStoreManager {
  private stores: Map<string, any> = new Map();

  setStore(name: string, store: any) {
    this.stores.set(name, store);
  }

  getStore(name: string) {
    return this.stores.get(name);
  }

  resetStores() {
    this.stores.clear();
  }

  mockAuthStore(user: TestUser | null = null) {
    const mockStore = {
      user,
      isAuthenticated: !!user,
      isLoading: false,
      error: null,
      login: vi.fn().mockResolvedValue(true),
      logout: vi.fn().mockResolvedValue(true),
      clearError: vi.fn(),
      initializeAuth: vi.fn(),
    };

    this.setStore('auth', mockStore);
    return mockStore;
  }
}

export const mockStoreManager = new MockStoreManager();

// API mock helpers
export class ApiMockHelper {
  static mockSupabaseAuth(user: TestUser | null = null) {
    return {
      getSession: vi.fn().mockResolvedValue({
        data: { session: user ? { user: { id: user.id } } : null },
        error: null
      }),
      onAuthStateChange: vi.fn(() => ({ 
        data: { subscription: { unsubscribe: vi.fn() } } 
      })),
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user },
        error: null
      }),
      signOut: vi.fn().mockResolvedValue({ error: null })
    };
  }

  static mockSupabaseQueries() {
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
      single: vi.fn().mockResolvedValue({ data: {}, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
      update: vi.fn().mockResolvedValue({ data: {}, error: null }),
      upsert: vi.fn().mockResolvedValue({ data: {}, error: null }),
      delete: vi.fn().mockResolvedValue({ data: {}, error: null }),
      then: vi.fn().mockResolvedValue({ data: [], error: null })
    };

    return {
      from: vi.fn(() => mockQueryBuilder),
      rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
      functions: {
        invoke: vi.fn().mockResolvedValue({ data: null, error: null })
      }
    };
  }

  static mockEdgeFunctions() {
    global.fetch = vi.fn().mockImplementation((url: string, options?: RequestInit) => {
      // Mock successful responses for different endpoints
      if (typeof url === 'string') {
        if (url.includes('create-user')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ 
              id: 'new-user-id', 
              success: true,
              message: 'User created successfully'
            })
          });
        }
        
        if (url.includes('assign-region-admin')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ 
              success: true,
              message: 'Region admin assigned successfully'
            })
          });
        }
        
        // Default successful response
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      }
      
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Unknown endpoint' })
      });
    }) as any;
  }
}

// Test assertion helpers
export const assertComponentRenders = (component: HTMLElement) => {
  expect(component).toBeInTheDocument();
  expect(component).toBeVisible();
};

export const assertButtonIsClickable = (button: HTMLElement) => {
  expect(button).toBeInTheDocument();
  expect(button).toBeEnabled();
  expect(button).not.toHaveAttribute('aria-disabled', 'true');
};

export const assertFormValidation = (errorMessage: string) => {
  expect(screen.getByText(errorMessage)).toBeInTheDocument();
  expect(screen.getByText(errorMessage)).toBeVisible();
};

// Common test patterns
export const testComponentAccessibility = async (component: HTMLElement) => {
  const { axe } = await import('jest-axe');
  const results = await axe(component);
  expect(results).toHaveNoViolations();
};

export const testComponentResponsiveness = (component: HTMLElement) => {
  // Test different viewport sizes
  const viewports = [
    { width: 320, height: 568 }, // Mobile
    { width: 768, height: 1024 }, // Tablet
    { width: 1920, height: 1080 } // Desktop
  ];

  viewports.forEach(viewport => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: viewport.width,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: viewport.height,
    });

    window.dispatchEvent(new Event('resize'));
    
    // Component should remain visible and functional
    expect(component).toBeInTheDocument();
    expect(component).toBeVisible();
  });
};

// Test cleanup utilities
export const cleanupMocks = () => {
  vi.clearAllMocks();
  mockStoreManager.resetStores();
  
  // Reset global mocks
  if (global.fetch && vi.isMockFunction(global.fetch)) {
    global.fetch.mockReset();
  }
};

// Export commonly used testing library functions
export { screen, fireEvent, waitFor, within } from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
export { vi as vitest } from 'vitest';

// Export default render for backward compatibility
export { render } from '@testing-library/react';
