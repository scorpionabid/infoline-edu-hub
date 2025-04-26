
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
  currentUser: any; // İstifadəçi məlumatlarını tam əlavə edək
  canRegionAdminManageCategoriesColumns: boolean;
  canViewSectorCategories: boolean;
  canViewSchoolCategories: boolean;
  regionName: string | null;
  sectorName: string | null;
  schoolName: string | null;
  canAccessRegion: (regionId: string) => boolean;
  canAccessSector: (sectorId: string) => boolean;
  canAccessSchool: (schoolId: string) => boolean;
  canAccessCategory: (categoryId: string, assignment: 'all' | 'sectors' | 'schools') => boolean;
  canManageUsers: boolean;
  canManageData: boolean;
  canApproveData: boolean;
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
        currentUser: null,
        canRegionAdminManageCategoriesColumns: false,
        canViewSectorCategories: false,
        canViewSchoolCategories: false,
        regionName: null,
        sectorName: null,
        schoolName: null,
        canAccessRegion: () => false,
        canAccessSector: () => false,
        canAccessSchool: () => false,
        canAccessCategory: () => false,
        canManageUsers: false,
        canManageData: false,
        canApproveData: false
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
    
    const canManageUsers = isSuperAdmin || isRegionAdmin || isSectorAdmin;
    const canManageData = isSuperAdmin || isRegionAdmin || isSectorAdmin || isSchoolAdmin;
    const canApproveData = isSuperAdmin || isRegionAdmin || isSectorAdmin;
    
    const canAccessRegion = (regionId: string) => {
      if (isSuperAdmin) return true;
      if (isRegionAdmin) return user.region_id === regionId || user.regionId === regionId;
      return false;
    };
    
    const canAccessSector = (sectorId: string) => {
      if (isSuperAdmin) return true;
      if (isRegionAdmin) {
        // Region ID-lər ilə əlaqəli sektorlara giriş etmək üçün əlavə məntiq lazım ola bilər
        return true;
      }
      if (isSectorAdmin) return user.sector_id === sectorId || user.sectorId === sectorId;
      return false;
    };
    
    const canAccessSchool = (schoolId: string) => {
      if (isSuperAdmin) return true;
      if (isRegionAdmin) return true; // region adminləri bütün məktəblərə giriş edə bilər
      if (isSectorAdmin) return true; // sektor adminləri öz sektorlarının bütün məktəblərinə giriş edə bilər
      if (isSchoolAdmin) return user.school_id === schoolId || user.schoolId === schoolId;
      return false;
    };
    
    const canAccessCategory = (categoryId: string, assignment: 'all' | 'sectors' | 'schools') => {
      if (isSuperAdmin || isRegionAdmin) return true;
      if (isSectorAdmin) return assignment === 'all' || assignment === 'sectors';
      if (isSchoolAdmin) return assignment === 'all' || assignment === 'schools';
      return false;
    };
    
    return {
      userRole,
      isAdmin,
      isSuperAdmin,
      isRegionAdmin,
      isSectorAdmin,
      isSchoolAdmin,
      regionId: user?.region_id || user?.regionId || null,
      sectorId: user?.sector_id || user?.sectorId || null,
      schoolId: user?.school_id || user?.schoolId || null,
      currentUser: user,
      canRegionAdminManageCategoriesColumns,
      canViewSectorCategories,
      canViewSchoolCategories,
      regionName: user?.adminEntity?.regionName || null,
      sectorName: user?.adminEntity?.sectorName || null,
      schoolName: user?.adminEntity?.name || null,
      canAccessRegion,
      canAccessSector,
      canAccessSchool,
      canAccessCategory,
      canManageUsers,
      canManageData,
      canApproveData
    };
  }, [user]);
};
