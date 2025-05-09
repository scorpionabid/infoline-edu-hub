
import { useMemo } from 'react';
import { useAuthStore, selectUser } from './useAuthStore';
import { UserRole } from '@/types/user';

export interface UsePermissionsResult {
  userRole: UserRole | undefined;
  hasRole: (role: string | string[]) => boolean;
  hasRegionAccess: (regionId: string) => boolean;
  hasSectorAccess: (sectorId: string) => boolean;
  hasSchoolAccess: (schoolId: string) => boolean;
  isSuperAdmin: boolean;
  isRegionAdmin: boolean;
  isSectorAdmin: boolean;
  isSchoolAdmin: boolean;
  userRegionId: string | undefined;
  userSectorId: string | undefined;
  userSchoolId: string | undefined;
}

/**
 * Hook for checking user permissions
 * Uses memoization to prevent unnecessary recalculations
 */
export const usePermissions = (): UsePermissionsResult => {
  // Get user with selector for better performance
  const user = useAuthStore(selectUser);
  
  return useMemo(() => {
    // Basic role information
    const userRole = user?.role as UserRole | undefined;
    const isSuperAdmin = userRole === 'superadmin';
    const isRegionAdmin = userRole === 'regionadmin';
    const isSectorAdmin = userRole === 'sectoradmin';
    const isSchoolAdmin = userRole === 'schooladmin';

    // Entity IDs
    const userRegionId = user?.region_id;
    const userSectorId = user?.sector_id;
    const userSchoolId = user?.school_id;
    
    /**
     * Check if user has a specific role
     * @param role The role or array of roles to check against
     * @returns True if user has the role, false otherwise
     */
    const hasRole = (role: string | string[]): boolean => {
      if (!user?.role) return false;
      
      if (Array.isArray(role)) {
        return role.includes(user.role);
      }
      
      return user.role === role;
    };

    /**
     * Check if user has access to a specific region
     * @param regionId The region ID to check access against
     * @returns True if user has access, false otherwise
     */
    const hasRegionAccess = (regionId: string): boolean => {
      if (!user) return false;
      
      // Super admin has access to everything
      if (isSuperAdmin) return true;
      
      // Region admins only have access to their region
      if (isRegionAdmin) {
        return user.region_id === regionId;
      }
      
      return false;
    };

    /**
     * Check if user has access to a specific sector
     * @param sectorId The sector ID to check access against
     * @returns True if user has access, false otherwise
     */
    const hasSectorAccess = (sectorId: string): boolean => {
      if (!user) return false;
      
      // Super admin and region admins have access to sectors in their region
      if (isSuperAdmin) return true;
      
      if (isRegionAdmin) {
        // For region admins, we would need to check if the sector belongs to their region
        // This requires additional data, so this is a simplified check
        return true;
      }
      
      // Sector admins only have access to their sector
      if (isSectorAdmin) {
        return user.sector_id === sectorId;
      }
      
      return false;
    };

    /**
     * Check if user has access to a specific school
     * @param schoolId The school ID to check access against
     * @returns True if user has access, false otherwise
     */
    const hasSchoolAccess = (schoolId: string): boolean => {
      if (!user) return false;
      
      // Super admin has access to everything
      if (isSuperAdmin) return true;
      
      // School admins only have access to their school
      if (isSchoolAdmin) {
        return user.school_id === schoolId;
      }
      
      return false;
    };

    return {
      userRole,
      hasRole,
      hasRegionAccess,
      hasSectorAccess,
      hasSchoolAccess,
      isSuperAdmin,
      isRegionAdmin,
      isSectorAdmin,
      isSchoolAdmin,
      userRegionId,
      userSectorId,
      userSchoolId,
    };
  }, [user]);
};
