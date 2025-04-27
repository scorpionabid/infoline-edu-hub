
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
    // Əgər userin məlumatları yoxdursa, default dəyərlər qaytar
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
    
    // İstifadəçi rolunu təyin et
    const userRole = user.role || 'user' as UserRole;
    console.log('usePermissions: User role is', userRole);
    
    // Xəta yoxlaması: əgər rol düzgün deyilsə, xəbərdarlıq et
    if (!['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin', 'user'].includes(userRole)) {
      console.warn(`Unknown user role: ${userRole}, defaulting to 'user'`);
    }
    
    // Ümumi səlahiyyətləri təyin et
    const isAdmin = ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin'].includes(userRole);
    const isSuperAdmin = userRole === 'superadmin';
    const isRegionAdmin = userRole === 'regionadmin';
    const isSectorAdmin = userRole === 'sectoradmin';
    const isSchoolAdmin = userRole === 'schooladmin';
    
    // Xüsusi səlahiyyətlər
    const canRegionAdminManageCategoriesColumns = isSuperAdmin || isRegionAdmin;
    const canViewSectorCategories = isSuperAdmin || isRegionAdmin || isSectorAdmin;
    const canViewSchoolCategories = isSuperAdmin || isRegionAdmin || isSectorAdmin || isSchoolAdmin;
    
    const canManageUsers = isSuperAdmin || isRegionAdmin || isSectorAdmin;
    const canManageData = isSuperAdmin || isRegionAdmin || isSectorAdmin || isSchoolAdmin;
    const canApproveData = isSuperAdmin || isRegionAdmin || isSectorAdmin;
    
    // ID məlumatları
    const regionId = user.region_id || user.regionId || null;
    const sectorId = user.sector_id || user.sectorId || null;
    const schoolId = user.school_id || user.schoolId || null;
    
    // Xüsusi entity-lərə giriş hüquqlarını yoxla
    const canAccessRegion = (targetRegionId: string) => {
      if (isSuperAdmin) return true;
      if (isRegionAdmin) return regionId === targetRegionId;
      return false;
    };
    
    const canAccessSector = (targetSectorId: string) => {
      if (isSuperAdmin) return true;
      if (isRegionAdmin) {
        // Region ID-lər ilə əlaqəli sektorlara giriş etmək üçün əlavə məntiq lazım ola bilər
        return true;
      }
      if (isSectorAdmin) return sectorId === targetSectorId;
      return false;
    };
    
    const canAccessSchool = (targetSchoolId: string) => {
      if (isSuperAdmin) return true;
      if (isRegionAdmin) return true; // region adminləri bütün məktəblərə giriş edə bilər
      if (isSectorAdmin) return true; // sektor adminləri öz sektorlarının bütün məktəblərinə giriş edə bilər
      if (isSchoolAdmin) return schoolId === targetSchoolId;
      return false;
    };
    
    const canAccessCategory = (categoryId: string, assignment: 'all' | 'sectors' | 'schools') => {
      if (isSuperAdmin || isRegionAdmin) return true;
      if (isSectorAdmin) return assignment === 'all' || assignment === 'sectors';
      if (isSchoolAdmin) return assignment === 'all' || assignment === 'schools';
      return false;
    };
    
    // Adlandırma məlumatları
    const regionName = user?.adminEntity?.regionName || null;
    const sectorName = user?.adminEntity?.sectorName || null;
    const schoolName = user?.adminEntity?.name || null;
    
    return {
      userRole,
      isAdmin,
      isSuperAdmin,
      isRegionAdmin,
      isSectorAdmin,
      isSchoolAdmin,
      regionId,
      sectorId,
      schoolId,
      currentUser: user,
      canRegionAdminManageCategoriesColumns,
      canViewSectorCategories,
      canViewSchoolCategories,
      regionName,
      sectorName,
      schoolName,
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
