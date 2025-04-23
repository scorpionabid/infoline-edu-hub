
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
    
    // Region admins can only access their own region
    const canAccessRegion = (regionId: string) => {
      if (isSuperAdmin) return true;
      if (isRegionAdmin) return user.regionId === regionId;
      return false;
    };
    
    // Sector admins can only access sectors in their region
    const canAccessSector = (sectorId: string) => {
      if (isSuperAdmin) return true;
      if (isRegionAdmin) return user.regionId === regionId;
      if (isSectorAdmin) return user.sectorId === sectorId;
      return false;
    };
    
    // School admins can only access their own school
    const canAccessSchool = (schoolId: string) => {
      if (isSuperAdmin) return true;
      if (isRegionAdmin) return user.regionId === regionId;
      if (isSectorAdmin) return user.sectorId === sectorId;
      if (isSchoolAdmin) return user.schoolId === schoolId;
      return false;
    };
    
    // Category access based on assignment type and user role
    const canAccessCategory = (categoryId: string, assignment: 'all' | 'sectors' | 'schools') => {
      if (isSuperAdmin || isRegionAdmin) return true;
      if (isSectorAdmin) return assignment === 'all' || assignment === 'sectors';
      if (isSchoolAdmin) return assignment === 'all';
      return false;
    };
    
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
      regionName: user.regionName || null,
      sectorName: user.sectorName || null,
      schoolName: user.schoolName || null,
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
