
import { useMemo } from 'react';
import { useAuthStore, selectUser, selectUserRole } from '@/hooks/auth/useAuthStore'; 
import { UserRole } from '@/types/supabase';

export interface UsePermissionsResult {
  userRole: UserRole | null;
  hasRole: (role: UserRole | UserRole[]) => boolean;
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
 * Custom hook to check user permissions based on role and entity IDs
 */
export const usePermissions = (): UsePermissionsResult => {
  // Get user data directly from the store using selectors
  const user = useAuthStore(selectUser);
  const userRole = useAuthStore(selectUserRole);
  
  return useMemo(() => {
    console.log("[usePermissions] Evaluating permissions for role:", userRole);
    console.log("[usePermissions] User data:", user);
    
    // Ensure we have values for region, sector, and school IDs
    const regionId = user?.region_id || null;
    const sectorId = user?.sector_id || null;
    const schoolId = user?.school_id || null;
    
    const hasRole = (role: UserRole | UserRole[]): boolean => {
      if (!userRole) return false;
      
      if (Array.isArray(role)) {
        return role.includes(userRole);
      }
      
      return userRole === role;
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
  }, [user, userRole]); // Only depend on user and userRole
};
