
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '@/context/auth';
import { AuthProvider } from '@/context/auth/AuthProvider';
import { AppQueryProvider } from '@/context/QueryClientProvider';
import { mockUsers } from '../mocks/data/users';

// Test wrapper
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppQueryProvider>
    <AuthProvider>{children}</AuthProvider>
  </AppQueryProvider>
);

describe('useAuth hook', () => {
  beforeEach(() => {
    // Local Storage temizlənməsi
    localStorage.clear();
    sessionStorage.clear();
  });

  it('initial state should be unauthenticated', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should login successfully', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      const success = await result.current.login('superadmin@test.com', 'password123');
      expect(success).toBe(true);
    });
    
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).not.toBeNull();
      expect(result.current.user?.email).toBe('superadmin@test.com');
    });
  });

  it('should logout successfully', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Əvvəlcə login edin
    await act(async () => {
      await result.current.login('superadmin@test.com', 'password123');
    });
    
    // Sonra logout
    await act(async () => {
      await result.current.logout();
    });
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
