
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { AuthProvider } from '@/context/auth/AuthProvider';
import { AppQueryProvider } from '@/context/QueryClientProvider';
import { mockUsers } from '../mocks/data/users';
import { supabase } from '@/integrations/supabase/client';

// Mocking the Supabase client
vi.mock('@/integrations/supabase/client', () => {
  return {
    supabase: {
      from: vi.fn(),
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: {
            session: {
              user: { id: '1', email: 'superadmin@test.com' }
            }
          }
        }),
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
      }
    }
  };
});

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
    // Supabase-ə sorğunu simulyasiya et
    const mockSelectFn = vi.fn().mockReturnThis();
    const mockEqFn = vi.fn().mockReturnThis();
    const mockSingleFn = vi.fn().mockResolvedValue({ 
      data: { role: 'superadmin' }, 
      error: null 
    });
    
    const mockFrom = vi.fn().mockReturnValue({
      select: mockSelectFn,
      eq: mockEqFn,
      single: mockSingleFn
    });
    
    (supabase.from as any).mockImplementation(mockFrom);
    
    const { result } = renderHook(() => usePermissions(), { wrapper });
    
    // usePermissions hook-unun müxtəlif funksiyalarının nəticələrini yoxla
    await waitFor(() => {
      expect(result.current.userRole).toBe('superadmin');
    });
  });

  it('should check category access correctly', async () => {
    // Mock RBAC permissions
    const mockFrom = vi.fn().mockImplementation((table) => {
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
          data: { role: 'sectoradmin' }, 
          error: null 
        })
      };
    });
    
    (supabase.from as any).mockImplementation(mockFrom);
    
    const { result } = renderHook(() => usePermissions(), { wrapper });
    
    // SectorAdmin üçün "all" assignment olan kateqoriyaya icazə olmalıdır
    const hasReadAccess = await result.current.checkCategoryAccess('cat1', 'read');
    await waitFor(() => {
      expect(hasReadAccess).toBe(true);
    });
  });
});
