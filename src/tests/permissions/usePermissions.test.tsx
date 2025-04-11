
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { AuthProvider } from '@/context/auth/AuthProvider';
import { AppQueryProvider } from '@/context/QueryClientProvider';
import { mockUsers } from '../mocks/data/users';
import { supabase } from '@/integrations/supabase/client';

// Supabase auth simulyasiyası
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { role: 'superadmin' }, error: null }),
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
}));

// Test wrapper
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppQueryProvider>
    <AuthProvider>{children}</AuthProvider>
  </AppQueryProvider>
);

describe('usePermissions hook', () => {
  it('should return correct user role when authenticated', async () => {
    // Supabase-ə sorğunu simulyasiya et
    const mockFromFn = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { role: 'superadmin' }, error: null })
    });
    
    vi.spyOn(supabase, 'from').mockImplementation(mockFromFn);
    
    const { result } = renderHook(() => usePermissions(), { wrapper });
    
    // usePermissions hook-unun müxtəlif funksiyalarının nəticələrini yoxla
    await waitFor(() => {
      expect(result.current.userRole).toBe('superadmin');
    });
  });

  it('should check category access correctly', async () => {
    // Mock RBAC permissions
    const mockFromFn = vi.fn().mockImplementation((table) => {
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
    
    vi.spyOn(supabase, 'from').mockImplementation(mockFromFn);
    
    const { result } = renderHook(() => usePermissions(), { wrapper });
    
    // SectorAdmin üçün "all" assignment olan kateqoriyaya icazə olmalıdır
    const hasReadAccess = await result.current.checkCategoryAccess('cat1', 'read');
    await waitFor(() => {
      expect(hasReadAccess).toBe(true);
    });
  });
});
