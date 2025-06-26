
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { vi, expect, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

// Mocking contexts that might not exist yet
const mockAuthContext = {
  Provider: ({ children, value }: { children: React.ReactNode; value: any }) => <div>{children}</div>
};

const mockLanguageProvider = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;

// Export mocked contexts
export const AuthContext = mockAuthContext;
export const LanguageProvider = mockLanguageProvider;

// Create test wrapper for single component
export const createTestWrapper = (Component: React.ComponentType<any>) => {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <Component>{children}</Component>;
  };
};

// Create comprehensive test wrapper with all necessary providers
export const renderWithProviders = (ui: React.ReactElement, 
  { authValues = { isAuthenticated: false, isLoading: false, user: null, error: null, login: vi.fn(), logout: vi.fn(), clearError: vi.fn(), updateUser: vi.fn() }} = {}) => {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={authValues}>
        <LanguageProvider>
          {ui}
        </LanguageProvider>
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

// Export commonly used testing utilities
export { render, screen, fireEvent, waitFor, userEvent };
export { vi, expect, afterEach };

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock
});

// Mock Supabase client for testing
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({ 
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      signInWithPassword: vi.fn(),
      signOut: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          limit: vi.fn(() => ({
            range: vi.fn(() => ({
              order: vi.fn(() => ({
                then: vi.fn().mockResolvedValue({ data: [], error: null })
              }))
            }))
          })),
          in: vi.fn(() => ({
            in: vi.fn().mockResolvedValue({ data: [], error: null })
          }))
        })),
        in: vi.fn(() => ({
          in: vi.fn().mockResolvedValue({ data: [], error: null })
        })),
        order: vi.fn(() => ({
          then: vi.fn().mockResolvedValue({ data: [], error: null })
        }))
      }))
    })),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: null, error: null })
    }
  }
}));

// Reset all mocks after each test
afterEach(() => {
  vi.clearAllMocks();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
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

// Mock ResizeObserver
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

window.ResizeObserver = ResizeObserverMock;

// Mock fetch
global.fetch = vi.fn();

// Suppress console errors during tests
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' && 
    (args[0].includes('Warning: ReactDOM.render') || 
     args[0].includes('Error: Uncaught [Error'))
  ) {
    return;
  }
  originalConsoleError(...args);
};
