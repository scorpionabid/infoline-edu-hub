
import { useMemo } from 'react';
import { useAuthStore, selectUser, selectUserRole } from '@/hooks/auth/useAuthStore'; 
import { UserRole, normalizeRole, hasMinimumRole } from '@/types/role';

export interface UsePermissionsResult {
  userRole: UserRole;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  hasMinimumRole: (role: UserRole) => boolean;
  canViewRegion: (regionId?: string) => boolean;
  canViewSector: (sectorId?: string) => boolean;
  canViewSchool: (schoolId?: string) => boolean;
  canManageUsers: boolean;
  canManageRegions: boolean;
  canManageSectors: boolean;
  canManageSchools: boolean;
  canManageCategories: boolean;
  canApproveData: boolean;
  canEnterData: boolean;
  regionId: string | null;
  sectorId: string | null;
  schoolId: string | null;
  // For backwards compatibility
  isSuperAdmin: boolean;
  isRegionAdmin: boolean;
  isSectorAdmin: boolean;
  isSchoolAdmin: boolean;
}

/**
 * Enhanced hook to check user permissions based on role and entity IDs
 * with improved null/undefined handling and type safety
 */
export const usePermissions = (): UsePermissionsResult => {
  // Get user data directly from the store using selectors
  const user = useAuthStore(selectUser);
  
  // Get user role with proper fallback and cast to UserRole type
  const rawUserRole = useAuthStore(selectUserRole);
  
  return useMemo(() => {
    console.log("[usePermissions] Raw user role from store:", rawUserRole);
    console.log("[usePermissions] User data:", user);
    
    // Normalize role to ensure type safety
    const userRole = normalizeRole(rawUserRole || user?.role);
    console.log("[usePermissions] Normalized role:", userRole);
    
    // Ensure we have values for region, sector, and school IDs
    const regionId = user?.region_id || null;
    const sectorId = user?.sector_id || null;
    const schoolId = user?.school_id || null;
    
    const hasRole = (roleToCheck: UserRole | UserRole[]): boolean => {
      if (!userRole) return false;
      
      if (Array.isArray(roleToCheck)) {
        return roleToCheck.includes(userRole);
      }
      
      return userRole === roleToCheck;
    };

    const checkMinimumRole = (minRole: UserRole): boolean => {
      return hasMinimumRole(userRole, minRole);
    };

    const canViewRegion = (regionId?: string): boolean => {
      if (!userRole) return false;
      if (userRole === 'superadmin') return true;
      if (userRole === 'regionadmin' && user?.region_id && (!regionId || user.region_id === regionId)) return true;
      return false;
    };

    const canViewSector = (sectorId?: string): boolean => {
      if (!userRole) return false;
      if (userRole === 'superadmin' || userRole === 'regionadmin') return true;
      if (userRole === 'sectoradmin' && user?.sector_id && (!sectorId || user.sector_id === sectorId)) return true;
      return false;
    };

    const canViewSchool = (schoolId?: string): boolean => {
      if (!userRole) return false;
      if (['superadmin', 'regionadmin', 'sectoradmin'].includes(userRole)) return true;
      if (userRole === 'schooladmin' && user?.school_id && (!schoolId || user.school_id === schoolId)) return true;
      return false;
    };

    // Define permissions based on roles
    const canManageUsers = Boolean(userRole && ['superadmin', 'regionadmin', 'sectoradmin'].includes(userRole));
    const canManageRegions = userRole === 'superadmin';
    const canManageSectors = Boolean(userRole && ['superadmin', 'regionadmin'].includes(userRole));
    const canManageSchools = Boolean(userRole && ['superadmin', 'regionadmin', 'sectoradmin'].includes(userRole));
    const canManageCategories = Boolean(userRole && ['superadmin', 'regionadmin', 'sectoradmin'].includes(userRole));
    const canApproveData = Boolean(userRole && ['superadmin', 'regionadmin', 'sectoradmin'].includes(userRole));
    const canEnterData = Boolean(userRole && ['superadmin', 'sectoradmin', 'schooladmin'].includes(userRole));

    // For backwards compatibility
    const isSuperAdmin = userRole === 'superadmin';
    const isRegionAdmin = userRole === 'regionadmin';
    const isSectorAdmin = userRole === 'sectoradmin';
    const isSchoolAdmin = userRole === 'schooladmin';

    return {
      userRole,
      hasRole,
      hasMinimumRole: checkMinimumRole,
      canViewRegion,
      canViewSector,
      canViewSchool,
      canManageUsers,
      canManageRegions,
      canManageSectors,
      canManageSchools,
      canManageCategories,
      canApproveData,
      canEnterData,
      regionId,
      sectorId,
      schoolId,
      isSuperAdmin,
      isRegionAdmin,
      isSectorAdmin,
      isSchoolAdmin
    };
  }, [user, rawUserRole]); // Only depend on user and rawUserRole
};

// Export a simple non-hook version for utils that need role checks
export function checkPermission(role: UserRole | undefined | null, requiredRole: UserRole | UserRole[]): boolean {
  if (!role) return false;
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(role);
  }
  
  return hasMinimumRole(role, requiredRole);
}
