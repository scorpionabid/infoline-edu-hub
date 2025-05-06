
import { useAuthSafe } from './useAuth';

/**
 * İstifadəçinin rolunu əldə etmək üçün hook
 */
export const useRole = () => {
  const { user } = useAuthSafe();
  return user?.role || 'user';
};
