
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { UserRole } from '@/types/supabase';

/**
 * useRole - Hook for getting the current user's role
 * Now uses the Zustand store directly
 */
export const useRole = (): UserRole | 'user' => {
  const user = useAuthStore(state => state.user);
  return (user?.role as UserRole) || 'user';
};

export default useRole;
