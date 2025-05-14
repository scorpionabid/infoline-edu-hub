
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
  // Get user role with proper fallback
  const userRole = useAuthStore(selectUserRole) as UserRole | null;
  
  return useMemo(() => {
    console.log("[usePermissions] Evaluating permissions for role:", userRole);
    console.log("[usePermissions] User data:", user);
    
    // Set default role if userRole is null
    const role = userRole || user?.role || 'schooladmin';
    
    // Ensure we have values for region, sector, and school IDs
    const regionId = user?.region_id || null;
    const sectorId = user?.sector_id || null;
    const schoolId = user?.school_id || null;
    
    const hasRole = (roleToCheck: UserRole | UserRole[]): boolean => {
      if (!role) return false;
      
      if (Array.isArray(roleToCheck)) {
        return roleToCheck.includes(role as UserRole);
      }
      
      return role === roleToCheck;
    };

    const canViewRegion = (regionId?: string): boolean => {
      if (!role) return false;
      if (role === 'superadmin') return true;
      if (role === 'regionadmin' && user?.region_id && (!regionId || user.region_id === regionId)) return true;
      return false;
    };

    const canViewSector = (sectorId?: string): boolean => {
      if (!role) return false;
      if (role === 'superadmin' || role === 'regionadmin') return true;
      if (role === 'sectoradmin' && user?.sector_id && (!sectorId || user.sector_id === sectorId)) return true;
      return false;
    };

    const canViewSchool = (schoolId?: string): boolean => {
      if (!role) return false;
      if (['superadmin', 'regionadmin', 'sectoradmin'].includes(role)) return true;
      if (role === 'schooladmin' && user?.school_id && (!schoolId || user.school_id === schoolId)) return true;
      return false;
    };

    // Define permissions based on roles
    const canManageUsers = Boolean(role && ['superadmin', 'regionadmin', 'sectoradmin'].includes(role));
    const canManageRegions = role === 'superadmin';
    const canManageSectors = Boolean(role && ['superadmin', 'regionadmin'].includes(role));
    const canManageSchools = Boolean(role && ['superadmin', 'regionadmin', 'sectoradmin'].includes(role));
    const canManageCategories = Boolean(role && ['superadmin', 'regionadmin', 'sectoradmin'].includes(role));
    const canApproveData = Boolean(role && ['superadmin', 'regionadmin', 'sectoradmin'].includes(role));
    const canEnterData = Boolean(role && ['superadmin', 'sectoradmin', 'schooladmin'].includes(role));

    // For backwards compatibility
    const isSuperAdmin = role === 'superadmin';
    const isRegionAdmin = role === 'regionadmin';
    const isSectorAdmin = role === 'sectoradmin';
    const isSchoolAdmin = role === 'schooladmin';

    return {
      userRole: role as UserRole | null,
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
