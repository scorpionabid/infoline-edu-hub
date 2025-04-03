
import { UserRole } from '@/types/supabase';

/**
 * İstifadəçi rolları yoxlamaq üçün hook
 */
export const useAuthRoles = (state: any) => {
  // Təyin edilmiş rolun olub-olmadığını yoxla
  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!state.user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(state.user.role as UserRole);
    }
    
    return state.user.role === role;
  };

  return { hasRole };
};

/**
 * Komponent səviyyəsində rol yoxlaması üçün hook
 */
export const useRoleCheck = (
  user: any,
  loading: boolean,
  role: UserRole | UserRole[],
  fallback: JSX.Element | null = null
): boolean | JSX.Element | null => {
  if (loading) return fallback;
  
  if (!user) return fallback;
  
  if (Array.isArray(role)) {
    return role.includes(user.role as UserRole) || fallback;
  }
  
  return user.role === role || fallback;
};
