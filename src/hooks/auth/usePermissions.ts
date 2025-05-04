
import { useMemo } from 'react';
import { useAuth } from '@/context/auth';

interface PermissionsResult {
  userRole: string;
  regionId: string | null;
  sectorId: string | null;
  schoolId: string | null;
  isSuperAdmin: boolean;
  isRegionAdmin: boolean;
  isSectorAdmin: boolean;
  isSchoolAdmin: boolean;
  canManageRegions: boolean;
  canManageSectors: boolean;
  canManageSchools: boolean;
  canManageCategories: boolean;
  canManageColumns: boolean;
  canManageUsers: boolean;
  canViewApprovals: boolean;
  canApproveData: boolean;
  canManageReports: boolean;
}

export const usePermissions = (): PermissionsResult => {
  const { user } = useAuth();
  
  return useMemo(() => {
    const role = user?.role || 'user';
    const regionId = user?.region_id || null;
    const sectorId = user?.sector_id || null;
    const schoolId = user?.school_id || null;
    
    const isSuperAdmin = role === 'superadmin';
    const isRegionAdmin = role === 'regionadmin';
    const isSectorAdmin = role === 'sectoradmin';
    const isSchoolAdmin = role === 'schooladmin';
    
    const canManageRegions = isSuperAdmin;
    const canManageSectors = isSuperAdmin || isRegionAdmin;
    const canManageSchools = isSuperAdmin || isRegionAdmin || isSectorAdmin;
    const canManageCategories = isSuperAdmin || isRegionAdmin;
    const canManageColumns = isSuperAdmin || isRegionAdmin;
    const canManageUsers = isSuperAdmin || isRegionAdmin || isSectorAdmin;
    const canViewApprovals = isSuperAdmin || isRegionAdmin || isSectorAdmin;
    const canApproveData = isSuperAdmin || isRegionAdmin || isSectorAdmin;
    const canManageReports = isSuperAdmin || isRegionAdmin || isSectorAdmin || isSchoolAdmin;
    
    return {
      userRole: role,
      regionId,
      sectorId,
      schoolId,
      isSuperAdmin,
      isRegionAdmin,
      isSectorAdmin,
      isSchoolAdmin,
      canManageRegions,
      canManageSectors,
      canManageSchools,
      canManageCategories,
      canManageColumns,
      canManageUsers,
      canViewApprovals,
      canApproveData,
      canManageReports
    };
  }, [user]);
};
