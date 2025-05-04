
import { useAuth } from './useAuth';
import { Role } from './types';

/**
 * İstifadəçinin rolunu əldə edən hook
 * @returns İstifadəçi rolu
 */
export const useRole = (): Role | undefined => {
  const { user } = useAuth();
  return user?.role as Role;
};
