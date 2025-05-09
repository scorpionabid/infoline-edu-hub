
import { useAuthStore, selectUser, selectUserRole } from '@/hooks/auth/useAuthStore';
import { UserRole } from '@/types/supabase';

/**
 * useRole - Hook for getting the current user's role
 * Directly uses the Zustand store with a selector for better performance
 */
export const useRole = (): UserRole | null => {
  const userRole = useAuthStore(selectUserRole);
  
  // Log for debugging role resolution
  console.log("[useRole] Current user role:", userRole);
  
  return userRole as UserRole || null;
};

export default useRole;
