
import { useAuthStore } from './useAuthStore';
import { UserRole } from '@/types/supabase';

/**
 * Hook for checking role-based permissions
 */
export const useRolePermissions = () => {
  const { user, hasRole } = useAuthStore();
  
  const userRole = user?.role as UserRole || null;
  const isSuperAdmin = userRole === 'superadmin';
  const isRegionAdmin = userRole === 'regionadmin';
  const isSectorAdmin = userRole === 'sectoradmin';
  const isSchoolAdmin = userRole === 'schooladmin';
  
  // Helper for checking if user has access to specific region
  const hasRegionAccess = (regionId: string): boolean => {
    if (!user) return false;
    if (isSuperAdmin) return true;
    if (isRegionAdmin) return user.region_id === regionId;
    return false;
  };
  
  // Helper for checking if user has access to specific sector
  const hasSectorAccess = (sectorId: string): boolean => {
    if (!user) return false;
    if (isSuperAdmin || isRegionAdmin) return true;
    if (isSectorAdmin) return user.sector_id === sectorId;
    return false;
  };
  
  // Helper for checking if user has access to specific school
  const hasSchoolAccess = (schoolId: string): boolean => {
    if (!user) return false;
    if (isSuperAdmin || isRegionAdmin || isSectorAdmin) return true;
    if (isSchoolAdmin) return user.school_id === schoolId;
    return false;
  };
  
  return {
    userRole,
    hasRole,
    isSuperAdmin,
    isRegionAdmin,
    isSectorAdmin,
    isSchoolAdmin,
    hasRegionAccess,
    hasSectorAccess,
    hasSchoolAccess,
  };
};

export default useRolePermissions;
