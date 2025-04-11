
import { useAuth } from './context';

/**
 * İstifadəçi rolunu əldə etmək üçün hook
 * @returns İstifadəçi rolu və ya undefined
 */
export const useRole = (): string | undefined => {
  const { user } = useAuth();
  return user?.role;
};
