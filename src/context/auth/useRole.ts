
import { useAuthStore, selectUserRole } from '@/hooks/auth/useAuthStore';

/**
 * İstifadəçi rolunu asan əldə etmək üçün hook
 */
export const useRole = () => {
  // Cast to string to ensure type safety
  const userRole = useAuthStore(selectUserRole) as string | undefined | null;
  return userRole || 'user';
};
