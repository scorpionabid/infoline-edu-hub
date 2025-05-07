
import { useAuth } from './useAuth';

/**
 * İstifadəçinin rolunu əldə etmək üçün hook
 */
export const useRole = () => {
  const { user } = useAuth();
  return user?.role || 'user';
};
