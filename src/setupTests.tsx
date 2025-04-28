
import { render } from '@testing-library/react';
import { ReactNode } from 'react';

export const createTestWrapper = (Component: React.ComponentType) => {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <Component>{children}</Component>;
  };
};

// Export commonly used testing utilities
export { render, screen, fireEvent } from '@testing-library/react';
export { vi } from 'vitest';

// Mock Supabase client for testing
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({ 
        data: { subscription: { unsubscribe: vi.fn() } } 
      })),
      signInWithPassword: vi.fn(),
      signOut: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          maybeSingle: vi.fn(),
          limit: vi.fn(() => ({
            range: vi.fn(() => ({
              order: vi.fn(() => ({
                then: vi.fn()
              }))
            }))
          })),
          in: vi.fn(() => ({
            in: vi.fn()
          }))
        })),
        in: vi.fn(() => ({
          in: vi.fn()
        }))
      }))
    })),
    rpc: vi.fn(),
    functions: {
      invoke: vi.fn()
    }
  }
}));

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
