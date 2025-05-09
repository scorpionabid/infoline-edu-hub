import { useAuthStore } from './useAuthStore';
import { UserRole, FullUserData } from '@/types/supabase';
import {
  canViewUsers,
  canManageUsers,
  canViewRegions,
  canManageRegions,
  canViewSectors,
  canManageSectors,
  canViewSchools,
  canManageSchools,
  canViewCategories,
  canManageCategories
} from './permissionUtils';

export interface UsePermissionsResult {
  userRole: UserRole | null;
  regionId: string | null;
  sectorId: string | null;
  schoolId: string | null;
  userId?: string;
  isAuthenticated: boolean;
  isLoading: boolean;

  hasRole: (role: UserRole | UserRole[]) => boolean;
  isSuperAdmin: boolean;
  isRegionAdmin: boolean;
  isSectorAdmin: boolean;
  isSchoolAdmin: boolean;

  hasRegionAccess: (targetRegionId: string) => boolean;
  hasSectorAccess: (targetSectorId: string) => boolean;
  hasSchoolAccess: (targetSchoolId: string) => boolean;

  canViewUsers: boolean;
  canManageUsers: boolean;
  canViewRegions: boolean;
  canManageRegions: boolean;
  canViewSectors: boolean;
  canManageSectors: boolean;
  canViewSchools: boolean;
  canManageSchools: boolean;
  canViewCategories: boolean;
  canManageCategories: boolean;
  canViewSectorCategories: boolean;
  canApproveData: boolean;
  checkRegionAccess: (regionId: string, level?: string) => Promise<boolean>;
  checkSectorAccess: (sectorId: string, level?: string) => Promise<boolean>;
  checkSchoolAccess: (schoolId: string, level?: string) => Promise<boolean>;
  checkCategoryAccess: (categoryId: string, level?: string) => Promise<boolean>;
  checkColumnAccess: (columnId: string, level?: string) => Promise<boolean>;
}

export const usePermissions = (): UsePermissionsResult => {
  const { user, isAuthenticated, isLoading } = useAuthStore(state => ({ 
    user: state.user, 
    isAuthenticated: state.isAuthenticated, 
    isLoading: state.isLoading 
  }));

  const userRole = (user?.role || null) as UserRole | null;
  const regionId = user?.region_id || null;
  const sectorId = user?.sector_id || null;
  const schoolId = user?.school_id || null;
  const userId = user?.id;

  const isSuperAdmin = userRole === 'superadmin';
  const isRegionAdmin = userRole === 'regionadmin';
  const isSectorAdmin = userRole === 'sectoradmin';
  const isSchoolAdmin = userRole === 'schooladmin';

  const hasRole = (rolesToCheck: UserRole | UserRole[]): boolean => {
    if (!userRole) return false;
    if (Array.isArray(rolesToCheck)) {
      return rolesToCheck.includes(userRole);
    }
    return userRole === rolesToCheck;
  };

  const hasRegionAccess = (targetRegionId: string): boolean => {
    if (!user) return false;
    if (isSuperAdmin) return true;
    if (isRegionAdmin) return user.region_id === targetRegionId;
    return false;
  };

  const hasSectorAccess = (targetSectorId: string): boolean => {
    if (!user) return false;
    if (isSuperAdmin || isRegionAdmin) return true; 
    if (isSectorAdmin) return user.sector_id === targetSectorId;
    return false;
  };

  const hasSchoolAccess = (targetSchoolId: string): boolean => {
    if (!user) return false;
    if (isSuperAdmin || isRegionAdmin || isSectorAdmin) return true;
    if (isSchoolAdmin) return user.school_id === targetSchoolId;
    return false;
  };
  
  const canViewSectorCategories = isSuperAdmin || isRegionAdmin || isSectorAdmin;
  const canApproveData = isSuperAdmin || isRegionAdmin || isSectorAdmin;

  const checkRegionAccess = async (targetRegionId: string, level?: string): Promise<boolean> => {
    return hasRegionAccess(targetRegionId);
  };

  const checkSectorAccess = async (targetSectorId: string, level?: string): Promise<boolean> => {
    return hasSectorAccess(targetSectorId);
  };

  const checkSchoolAccess = async (targetSchoolId: string, level?: string): Promise<boolean> => {
    return hasSchoolAccess(targetSchoolId);
  };

  const checkCategoryAccess = async (categoryId: string, level?: string): Promise<boolean> => {
    if (isSuperAdmin || isRegionAdmin) return true;
    if (isSectorAdmin && level === 'read') return true; 
    return false; 
  };

  const checkColumnAccess = async (columnId: string, level?: string): Promise<boolean> => {
    if (isSuperAdmin || isRegionAdmin) return true;
    if (isSectorAdmin && level === 'read') return true;
    return false;
  };

  return {
    userRole,
    regionId,
    sectorId,
    schoolId,
    userId,
    isAuthenticated,
    isLoading,
    hasRole,
    isSuperAdmin,
    isRegionAdmin,
    isSectorAdmin,
    isSchoolAdmin,
    hasRegionAccess,
    hasSectorAccess,
    hasSchoolAccess,
    canViewUsers: userRole ? canViewUsers(userRole) : false,
    canManageUsers: userRole ? canManageUsers(userRole) : false,
    canViewRegions: userRole ? canViewRegions(userRole) : false,
    canManageRegions: userRole ? canManageRegions(userRole) : false,
    canViewSectors: userRole ? canViewSectors(userRole) : false,
    canManageSectors: userRole ? canManageSectors(userRole) : false,
    canViewSchools: userRole ? canViewSchools(userRole) : false,
    canManageSchools: userRole ? canManageSchools(userRole) : false,
    canViewCategories: userRole ? canViewCategories(userRole) : false,
    canManageCategories: userRole ? canManageCategories(userRole) : false,
    canViewSectorCategories,
    canApproveData,
    checkRegionAccess,
    checkSectorAccess,
    checkSchoolAccess,
    checkCategoryAccess,
    checkColumnAccess,
  };
};

export default usePermissions;
