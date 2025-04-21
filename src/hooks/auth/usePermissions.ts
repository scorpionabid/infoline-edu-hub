
import { useAuth } from '@/context/auth';
import { useMemo } from 'react';
import { UserRole } from '@/types/supabase';

export interface UsePermissionsReturn {
  userRole: UserRole;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isRegionAdmin: boolean;
  isSectorAdmin: boolean;
  isSchoolAdmin: boolean;
  regionId: string | null;
  sectorId: string | null;
  schoolId: string | null;
  canRegionAdminManageCategoriesColumns: boolean;
  canViewSectorCategories: boolean;
  regionName: string | null;
  sectorName: string | null;
  schoolName: string | null;
}

export const usePermissions = (): UsePermissionsReturn => {
  const { user } = useAuth();
  
  return useMemo(() => {
    if (!user) {
      return {
        userRole: 'user' as UserRole,
        isAdmin: false,
        isSuperAdmin: false,
        isRegionAdmin: false,
        isSectorAdmin: false,
        isSchoolAdmin: false,
        regionId: null,
        sectorId: null,
        schoolId: null,
        canRegionAdminManageCategoriesColumns: false,
        canViewSectorCategories: false,
        regionName: null,
        sectorName: null,
        schoolName: null
      };
    }
    
    const userRole = user.role as UserRole;
    const isAdmin = ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin'].includes(userRole);
    const isSuperAdmin = userRole === 'superadmin';
    const isRegionAdmin = userRole === 'regionadmin';
    const isSectorAdmin = userRole === 'sectoradmin';
    const isSchoolAdmin = userRole === 'schooladmin';
    
    const canRegionAdminManageCategoriesColumns = isSuperAdmin || isRegionAdmin;
    const canViewSectorCategories = isSuperAdmin || isRegionAdmin || isSectorAdmin;
    
    // Müəssisə adları əldə edilir
    const regionName = user.region_name || null;
    const sectorName = user.sector_name || null;
    const schoolName = user.schoolName || null;
    
    return {
      userRole,
      isAdmin,
      isSuperAdmin,
      isRegionAdmin,
      isSectorAdmin,
      isSchoolAdmin,
      regionId: user.region_id || user.regionId || null,
      sectorId: user.sector_id || user.sectorId || null,
      schoolId: user.school_id || user.schoolId || null,
      canRegionAdminManageCategoriesColumns,
      canViewSectorCategories,
      regionName,
      sectorName,
      schoolName
    };
  }, [user]);
};
