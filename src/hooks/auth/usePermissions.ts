
// Əvvəlcə, gərək bütün interfeysi dəyişək
import { useMemo } from 'react';
import { useAuth } from '@/context/auth';
import { UserRole } from '@/types/user';

// Define the return type for the hook
export interface UsePermissionsResult {
  userRole: UserRole;
  isSuperAdmin: boolean;
  isRegionAdmin: boolean;
  isSectorAdmin: boolean;
  isSchoolAdmin: boolean;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  canManageRegions: boolean;
  canManageSectors: boolean;
  canManageSchools: boolean;
  canManageUsers: boolean;
  canManageCategories: boolean;
  canApproveData: boolean;
  canEnterData: boolean;
  canExportData: boolean;
}

export const usePermissions = (): UsePermissionsResult => {
  const { user, isAuthenticated } = useAuth();
  
  return useMemo(() => {
    // Default permissions for non-authenticated users
    const defaultPermissions: UsePermissionsResult = {
      userRole: 'user',
      isSuperAdmin: false,
      isRegionAdmin: false,
      isSectorAdmin: false,
      isSchoolAdmin: false,
      canManageRegions: false,
      canManageSectors: false,
      canManageSchools: false,
      canManageUsers: false,
      canManageCategories: false,
      canApproveData: false,
      canEnterData: false,
      canExportData: false,
      regionId: undefined,
      sectorId: undefined,
      schoolId: undefined
    };
    
    // Return default permissions if not authenticated or no user
    if (!isAuthenticated || !user) return defaultPermissions;
    
    const userRole = user.role || 'user';
    const regionId = user.region_id;
    const sectorId = user.sector_id;
    const schoolId = user.school_id;
    
    // Determine user role type
    const isSuperAdmin = userRole === 'superadmin';
    const isRegionAdmin = userRole === 'regionadmin';
    const isSectorAdmin = userRole === 'sectoradmin';
    const isSchoolAdmin = userRole === 'schooladmin';
    
    // Define permissions based on role
    return {
      userRole,
      isSuperAdmin,
      isRegionAdmin,
      isSectorAdmin,
      isSchoolAdmin,
      regionId,
      sectorId,
      schoolId,
      // Manage entities permissions
      canManageRegions: isSuperAdmin,
      canManageSectors: isSuperAdmin || isRegionAdmin,
      canManageSchools: isSuperAdmin || isRegionAdmin || isSectorAdmin,
      canManageUsers: isSuperAdmin || isRegionAdmin || isSectorAdmin,
      canManageCategories: isSuperAdmin || isRegionAdmin,
      // Data permissions
      canApproveData: isSuperAdmin || isRegionAdmin || isSectorAdmin,
      canEnterData: isSchoolAdmin,
      canExportData: isSuperAdmin || isRegionAdmin || isSectorAdmin
    };
  }, [user, isAuthenticated]);
};
