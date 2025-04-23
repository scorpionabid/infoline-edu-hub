
import { useAuth } from '@/context/auth';
import { useMemo } from 'react';
import { UserRole } from '@/types/supabase';

interface UsePermissionsReturn {
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
  canViewSchoolCategories: boolean;
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
        canViewSchoolCategories: false,
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
    const canViewSchoolCategories = isSuperAdmin || isRegionAdmin || isSectorAdmin || isSchoolAdmin;
    
    // Müəssisə adları əldə edilir
    const regionName = user.regionName || null;
    const sectorName = user.sectorName || null;
    const schoolName = user.schoolName || null;
    
    return {
      userRole,
      isAdmin,
      isSuperAdmin,
      isRegionAdmin,
      isSectorAdmin,
      isSchoolAdmin,
      regionId: user.regionId || null,
      sectorId: user.sectorId || null,
      schoolId: user.schoolId || null,
      canRegionAdminManageCategoriesColumns,
      canViewSectorCategories,
      canViewSchoolCategories,
      regionName,
      sectorName,
      schoolName
    };
  }, [user]);
};
