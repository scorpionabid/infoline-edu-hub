
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { UserRole } from '@/types/supabase';

/**
 * useRole - Hook for getting the current user's role
 * Now uses the Zustand store directly
 */
export const useRole = (): UserRole | null => {
  const user = useAuthStore(state => state.user);
  return user?.role as UserRole || null;
};

export default useRole;
