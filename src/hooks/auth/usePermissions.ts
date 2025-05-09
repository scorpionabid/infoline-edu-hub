
import { useMemo } from 'react';
import { useAuthStore, selectUser, selectUserRole } from '@/hooks/auth/useAuthStore'; 
import { UserRole } from '@/types/user';

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
}

/**
 * Custom hook to check user permissions based on role and entity IDs
 */
export const usePermissions = (): UsePermissionsResult => {
  const user = useAuthStore(selectUser);
  const userRole = useAuthStore(selectUserRole) as UserRole | null;
  
  return useMemo(() => {
    console.log("[usePermissions] Evaluating permissions for role:", userRole);
    console.log("[usePermissions] User data:", user);
    
    const hasRole = (role: UserRole | UserRole[]): boolean => {
      if (!user || !userRole) return false;
      
      if (Array.isArray(role)) {
        return role.includes(userRole);
      }
      
      return userRole === role;
    };

    const canViewRegion = (regionId?: string): boolean => {
      if (!user || !userRole) return false;
      if (userRole === 'superadmin') return true;
      if (userRole === 'regionadmin' && user.region_id && (!regionId || user.region_id === regionId)) return true;
      return false;
    };

    const canViewSector = (sectorId?: string): boolean => {
      if (!user || !userRole) return false;
      if (userRole === 'superadmin' || userRole === 'regionadmin') return true;
      if (userRole === 'sectoradmin' && user.sector_id && (!sectorId || user.sector_id === sectorId)) return true;
      return false;
    };

    const canViewSchool = (schoolId?: string): boolean => {
      if (!user || !userRole) return false;
      if (['superadmin', 'regionadmin', 'sectoradmin'].includes(userRole)) return true;
      if (userRole === 'schooladmin' && user.school_id && (!schoolId || user.school_id === schoolId)) return true;
      return false;
    };

    // Define permissions based on roles
    const canManageUsers = hasRole(['superadmin', 'regionadmin', 'sectoradmin']);
    const canManageRegions = hasRole('superadmin');
    const canManageSectors = hasRole(['superadmin', 'regionadmin']);
    const canManageSchools = hasRole(['superadmin', 'regionadmin', 'sectoradmin']);
    const canManageCategories = hasRole(['superadmin', 'regionadmin', 'sectoradmin']);
    const canApproveData = hasRole(['superadmin', 'regionadmin', 'sectoradmin']);
    const canEnterData = hasRole(['superadmin', 'sectoradmin', 'schooladmin']);

    // User entity IDs for scoped access
    const regionId = user?.region_id || null;
    const sectorId = user?.sector_id || null;
    const schoolId = user?.school_id || null;

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
      schoolId
    };
  }, [user, userRole]);
};
