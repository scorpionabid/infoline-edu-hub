
import { useCallback } from 'react';
import { useAuth } from './useAuth';
import { UserRole } from '@/types/supabase';

/**
 * İstifadəçi rolu ilə bağlı yardımçı funksiyaları təmin edən hook
 */
export function useRole() {
  const { user } = useAuth();
  
  const hasRole = useCallback(
    (role: UserRole | UserRole[]) => {
      if (!user || !user.role) return false;
      
      if (Array.isArray(role)) {
        return role.includes(user.role);
      }
      
      return user.role === role;
    },
    [user]
  );
  
  const isSuperAdmin = useCallback(
    () => hasRole('superadmin'),
    [hasRole]
  );
  
  const isRegionAdmin = useCallback(
    () => hasRole('regionadmin'),
    [hasRole]
  );
  
  const isSectorAdmin = useCallback(
    () => hasRole('sectoradmin'),
    [hasRole]
  );
  
  const isSchoolAdmin = useCallback(
    () => hasRole('schooladmin'),
    [hasRole]
  );
  
  const canManageUsers = useCallback(
    () => hasRole(['superadmin', 'regionadmin', 'sectoradmin']),
    [hasRole]
  );
  
  const canViewAnalytics = useCallback(
    () => hasRole(['superadmin', 'regionadmin', 'sectoradmin']),
    [hasRole]
  );
  
  const canApproveData = useCallback(
    () => hasRole(['superadmin', 'regionadmin', 'sectoradmin']),
    [hasRole]
  );
  
  return {
    hasRole,
    isSuperAdmin,
    isRegionAdmin,
    isSectorAdmin,
    isSchoolAdmin,
    canManageUsers,
    canViewAnalytics,
    canApproveData,
    currentRole: user?.role
  };
}
