
import { useAuth } from '@/context/auth';
import { useMemo } from 'react';
import { UserRole } from '@/types/supabase';
import { getCache, setCache } from '@/utils/cacheUtils';

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
  currentUser: any;
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
    // İstifadəçi məlumatları yoxdursa, default dəyərlər qaytar
    if (!user) {
      console.log("usePermissions: No user data available");
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
    
    // Caching permissions based on user
    const permissionCacheKey = `permissions_${user.id}`;
    const cachedPermissions = getCache<any>(permissionCacheKey);
    
    // Return cached permissions if available
    if (cachedPermissions) {
      // Only log when cached permissions are used, avoid overdoing it
      return cachedPermissions;
    }
    
    // İstifadəçi rolunu təyin et (undefined olsa əvəzinə 'user' istifadə et)
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
    
    // Bölgə/sektor/məktəb ID-ləri və adları
    const regionId = user.region_id || user.regionId || null;
    const sectorId = user.sector_id || user.sectorId || null;
    const schoolId = user.school_id || user.schoolId || null;
    const regionName = null; // TODO: Əgər ad məlumatı lazımdırsa, buradan əldə etmək olar
    const sectorName = null;
    const schoolName = null;
    
    // Funksional səlahiyyətlər
    const canAccessRegion = (checkRegionId: string) => {
      if (isSuperAdmin) return true;
      if (isRegionAdmin && regionId === checkRegionId) return true;
      return false;
    };
    
    const canAccessSector = (checkSectorId: string) => {
      if (isSuperAdmin) return true;
      if (isRegionAdmin) {
        // RegionAdmin öz regionuna aid bütün sektorlara çıxış edə bilər
        // Burada əlavə məntiq istifadə edilə bilər
        return true; 
      }
      if (isSectorAdmin && sectorId === checkSectorId) return true;
      return false;
    };
    
    const canAccessSchool = (checkSchoolId: string) => {
      if (isSuperAdmin || isRegionAdmin) return true;
      if (isSectorAdmin) {
        // SectorAdmin öz sektoruna aid bütün məktəblərə çıxış edə bilər
        // Burada əlavə məntiq istifadə edilə bilər
        return true;
      }
      if (isSchoolAdmin && schoolId === checkSchoolId) return true;
      return false;
    };
    
    const canAccessCategory = (categoryId: string, assignment: 'all' | 'sectors' | 'schools') => {
      if (assignment === 'all') return true;
      if (assignment === 'sectors' && (isSuperAdmin || isRegionAdmin || isSectorAdmin)) return true;
      if (assignment === 'schools' && (isSuperAdmin || isRegionAdmin || isSectorAdmin || isSchoolAdmin)) return true;
      return false;
    };
    
    // Data idarəetmə səlahiyyətləri
    const canManageUsers = isSuperAdmin || isRegionAdmin || isSectorAdmin;
    const canManageData = isSuperAdmin || isRegionAdmin || isSectorAdmin || isSchoolAdmin;
    const canApproveData = isSuperAdmin || isRegionAdmin || isSectorAdmin;
    
    const permissions = {
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
    
    // Cache permissions for 5 minutes
    setCache(permissionCacheKey, permissions, { expiryInMinutes: 5 });
    
    return permissions;
  }, [user]);
};
