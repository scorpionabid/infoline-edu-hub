
import { useAuthStore, selectUserRole } from '@/hooks/auth/useAuthStore';
import { UserRole, normalizeRole } from '@/types/role';

/**
 * İstifadəçi rolunu asan əldə etmək üçün hook
 */
export const useRole = (): UserRole => {
  // Get the role from auth store
  const rawUserRole = useAuthStore(selectUserRole);
  
  // Normalize and return the role
  return normalizeRole(rawUserRole);
};
