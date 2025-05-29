
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock supabase
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
            in: vi.fn(),
          }))
        })),
        in: vi.fn(() => ({
          in: vi.fn(),
        }))
      }))
    })),
    rpc: vi.fn(),
    functions: {
      invoke: vi.fn()
    }
  }
}));

// Create test helpers
export const createTestWrapper = (Component: React.ComponentType<any>) => {
  return ({ children }: { children: React.ReactNode }) => {
    return React.createElement(Component, null, children);
  };
};

// Mock window.matchMedia
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

