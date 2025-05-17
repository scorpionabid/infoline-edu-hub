
import { useContext } from 'react';
import { AuthContext } from './context';
import { UserRole } from '@/types/role';
import { normalizeRole } from '@/types/role';

/**
 * Hook to access user role information from Auth context
 */
export function useRole() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useRole must be used within an AuthProvider');
  }
  
  const { user } = context;
  const userRole = user?.role ? normalizeRole(user.role) : 'user';
  
  return {
    role: userRole,
    hasRole: (roles: UserRole | UserRole[]): boolean => {
      if (!user) return false;
      
      const userRole = normalizeRole(user.role);
      
      if (Array.isArray(roles)) {
        return roles.includes(userRole);
      }
      
      return roles === userRole;
    }
  };
}
