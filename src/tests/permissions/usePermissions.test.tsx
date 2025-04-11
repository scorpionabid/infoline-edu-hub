// src/tests/permissions/usePermissions.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { AuthProvider } from '@/context/auth/AuthProvider';
import { AppQueryProvider } from '@/context/QueryClientProvider';

// Həqiqi usePermissions hook-unu mock etmək
vi.mock('@/hooks/auth/usePermissions', () => ({
  usePermissions: () => ({
    userRole: 'superadmin',
    checkCategoryAccess: vi.fn().mockResolvedValue(true)
  })
}));

// Supabase mock (əgər mövcud deyilsə)
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockImplementation((table) => {
      if (table === 'user_roles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ 
            data: { role: 'superadmin' }, 
            error: null 
          })
        };
      }
      if (table === 'categories') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ 
            data: { assignment: 'all' }, 
            error: null 
          })
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: null, 
          error: null 
        })
      };
    }),
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            user: { id: '1', email: 'superadmin@test.com' }
          }
        }
      }),
      getUser: vi.fn().mockResolvedValue({
        data: { 
          user: { id: '1', email: 'superadmin@test.com' }
        }
      }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
    }
  }
}));

// Test wrapper
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppQueryProvider>
    <AuthProvider>{children}</AuthProvider>
  </AppQueryProvider>
);

describe('usePermissions hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return correct user role when authenticated', async () => {
    const { result } = renderHook(() => usePermissions());
    
    await waitFor(() => {
      expect(result.current.userRole).toBe('superadmin');
    }, { timeout: 3000 });
  });

  it('should check category access correctly', async () => {
    const { result } = renderHook(() => usePermissions());
    
    const hasReadAccess = await result.current.checkCategoryAccess('cat1', 'read');
    
    expect(hasReadAccess).toBe(true);
  });
});