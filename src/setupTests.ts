import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './context/auth/AuthProvider';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import React from 'react';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => {
  const mockClient = {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'test-user-id',
              email: 'test@example.com',
              user_metadata: { role: 'superadmin' }
            }
          }
        },
        error: null
      }),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      then: vi.fn().mockImplementation(cb => cb({ data: [], error: null }))
    }))
  };

  return {
    createClient: vi.fn(() => mockClient)
  };
});

// window.matchMedia mock
if (!window.matchMedia) {
  window.matchMedia = function (query) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    };
  };
}

// Performance API mock
if (!window.performance) {
  window.performance = {
    now: () => Date.now(),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByName: vi.fn(),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn(),
  };
}

// LocalStorage mock
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Default auth state
const mockAuthState = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'superadmin'
  },
  session: {
    access_token: 'test-token',
    refresh_token: 'test-refresh-token',
    expires_in: 3600,
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      user_metadata: { role: 'superadmin' }
    }
  },
  isAuthenticated: true,
  isLoading: false,
  error: null
};

interface TestWrapperProps {
  children: React.ReactNode;
  initialAuthState?: typeof mockAuthState;
}

// Test wrapper factory
export const createTestWrapper = (props: TestWrapperProps = { children: null }) => {
  const { children, initialAuthState = mockAuthState } = props;
  
  return function TestWrapper({ children: innerChildren }: { children: React.ReactNode }) {
    // Initialize Supabase client
    const supabase = createClient('http://localhost:54321', 'test-anon-key');

    return React.createElement(
      AuthProvider,
      { 
        supabaseClient: supabase,
        initialSession: initialAuthState.session
      },
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(
          ThemeProvider,
          null,
          React.createElement(
            LanguageProvider,
            null,
            React.createElement(
              NotificationProvider,
              null,
              innerChildren || children
            )
          )
        )
      )
    );
  };
};

// Custom render metodu
const customRender = (
  ui: React.ReactElement,
  options: { wrapper?: React.ComponentType<any>; [key: string]: any } = {}
) => {
  return render(ui, {
    wrapper: createTestWrapper(options),
    ...options,
  });
};

// Re-export testing utilities
export * from '@testing-library/react';
export { customRender as render };
export { vi };

// Global beforeEach
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});