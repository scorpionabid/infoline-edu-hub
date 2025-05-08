
import { useAuth } from '@/context/auth';
import { useMemo } from 'react';

export interface UsePermissionsResult {
  isSuperAdmin: boolean;
  isRegionAdmin: boolean;
  isSectorAdmin: boolean;
  isSchoolAdmin: boolean;
  isLoggedIn: boolean;
  userRole: 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user' | null;
  canCreateUser: boolean;
  canCreateSchool: boolean;
  canCreateSector: boolean;
  canCreateRegion: boolean;
  canApproveData: boolean;
  canExportData: boolean;
  canCreateCategory: boolean;
  canCreateColumn: boolean;
  canResetData: boolean;
  canManageUsers: boolean;
  canManageRegions: boolean;
  canManageSectors: boolean;
  canManageSchools: boolean;
  canManageCategories: boolean;
  canViewSectorCategories: boolean;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
}

export const usePermissions = (): UsePermissionsResult => {
  const { user, isAuthenticated } = useAuth();
  
  return useMemo(() => {
    // İstifadəçi giriş etməyibsə
    if (!isAuthenticated || !user) {
      return {
        isSuperAdmin: false,
        isRegionAdmin: false,
        isSectorAdmin: false,
        isSchoolAdmin: false,
        isLoggedIn: false,
        userRole: null,
        canCreateUser: false,
        canCreateSchool: false,
        canCreateSector: false,
        canCreateRegion: false,
        canApproveData: false,
        canExportData: false,
        canCreateCategory: false,
        canCreateColumn: false,
        canResetData: false,
        canManageUsers: false,
        canManageRegions: false,
        canManageSectors: false,
        canManageSchools: false,
        canManageCategories: false,
        canViewSectorCategories: false,
      };
    }
    
    const isSuperAdmin = user.role === 'superadmin';
    const isRegionAdmin = user.role === 'regionadmin';
    const isSectorAdmin = user.role === 'sectoradmin';
    const isSchoolAdmin = user.role === 'schooladmin';
    const regionId = user.region_id;
    const sectorId = user.sector_id;
    const schoolId = user.school_id;
    
    return {
      isSuperAdmin,
      isRegionAdmin,
      isSectorAdmin,
      isSchoolAdmin,
      isLoggedIn: true,
      userRole: user.role || null,
      regionId,
      sectorId,
      schoolId,
      canCreateUser: isSuperAdmin || isRegionAdmin || isSectorAdmin,
      canCreateSchool: isSuperAdmin || isRegionAdmin || isSectorAdmin,
      canCreateSector: isSuperAdmin || isRegionAdmin,
      canCreateRegion: isSuperAdmin,
      canApproveData: isSuperAdmin || isRegionAdmin || isSectorAdmin,
      canExportData: isSuperAdmin || isRegionAdmin || isSectorAdmin || isSchoolAdmin,
      canCreateCategory: isSuperAdmin || isRegionAdmin,
      canCreateColumn: isSuperAdmin || isRegionAdmin,
      canResetData: isSuperAdmin,
      canManageUsers: isSuperAdmin || isRegionAdmin || isSectorAdmin,
      canManageRegions: isSuperAdmin,
      canManageSectors: isSuperAdmin || isRegionAdmin,
      canManageSchools: isSuperAdmin || isRegionAdmin || isSectorAdmin,
      canManageCategories: isSuperAdmin || isRegionAdmin,
      canViewSectorCategories: isSuperAdmin || isRegionAdmin || isSectorAdmin,
    };
  }, [user, isAuthenticated]);
};
