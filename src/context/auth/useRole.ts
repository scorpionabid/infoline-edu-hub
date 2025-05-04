
import { useMemo } from 'react';
import { Role } from './types';
import { useAuth } from './useAuth';

/**
 * İstifadəçinin müəyyən bir rola və ya rollara sahib olub-olmadığını yoxlayan hook
 * @param {Role | Role[]} role - Yoxlanılacaq rol və ya rollar
 * @returns {boolean} İstifadəçinin həmin rola sahib olub-olmadığı
 */
export const useRole = (role: Role | Role[]): boolean => {
  const { user, isAuthenticated } = useAuth();
  
  return useMemo(() => {
    if (!user || !isAuthenticated || !user.role) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role as Role);
    }
    
    return user.role === role;
  }, [user, isAuthenticated, role]);
};
