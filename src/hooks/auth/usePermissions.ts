
import { useAuthStore } from './useAuthStore';
import { UserRole } from '@/types/supabase';
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
  hasRole: (role: UserRole | UserRole[]) => boolean;
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
  canApproveData: boolean;
  hasRegionAccess: (regionId: string) => boolean;
  hasSectorAccess: (sectorId: string) => boolean;
  hasSchoolAccess: (schoolId: string) => boolean;
  canViewSectorCategories: boolean;
  isSuperAdmin: boolean;
  isRegionAdmin: boolean;
  isSectorAdmin: boolean;
  isSchoolAdmin: boolean;
  checkRegionAccess: (regionId: string, level?: string) => Promise<boolean>;
  checkSectorAccess: (sectorId: string, level?: string) => Promise<boolean>;
  checkSchoolAccess: (schoolId: string, level?: string) => Promise<boolean>;
  checkCategoryAccess: (categoryId: string, level?: string) => Promise<boolean>;
  checkColumnAccess: (columnId: string, level?: string) => Promise<boolean>;
}

export const usePermissions = (): UsePermissionsResult => {
  // Get user data and permission functions from the Zustand store
  const { 
    user, 
    hasRole, 
    hasRegionAccess, 
    hasSectorAccess, 
    hasSchoolAccess 
  } = useAuthStore();
  
  // Extract properties from user
  const userRole = (user?.role || null) as UserRole | null;
  const regionId = user?.region_id || null;
  const sectorId = user?.sector_id || null;
  const schoolId = user?.school_id || null;
  const userId = user?.id;
  
  // Calculate role-based flags
  const isSuperAdmin = userRole === 'superadmin';
  const isRegionAdmin = userRole === 'regionadmin';
  const isSectorAdmin = userRole === 'sectoradmin';
  const isSchoolAdmin = userRole === 'schooladmin';
  
  // Calculate additional permissions
  const canViewSectorCategories = isSuperAdmin || isRegionAdmin || isSectorAdmin;
  const canApproveData = isSuperAdmin || isRegionAdmin || isSectorAdmin;
  
  // Mock implementation for permission check functions
  // In a real application, these would call backend services or check stored permissions
  const checkRegionAccess = async (regionId: string, level?: string): Promise<boolean> => {
    return hasRegionAccess(regionId);
  };
  
  const checkSectorAccess = async (sectorId: string, level?: string): Promise<boolean> => {
    return hasSectorAccess(sectorId);
  };
  
  const checkSchoolAccess = async (schoolId: string, level?: string): Promise<boolean> => {
    return hasSchoolAccess(schoolId);
  };
  
  const checkCategoryAccess = async (categoryId: string, level?: string): Promise<boolean> => {
    return isSuperAdmin || isRegionAdmin || (isSectorAdmin && level === 'read');
  };
  
  const checkColumnAccess = async (columnId: string, level?: string): Promise<boolean> => {
    return isSuperAdmin || isRegionAdmin || (isSectorAdmin && level === 'read');
  };
  
  // Calculate permissions based on role
  const permissions = {
    userRole,
    regionId,
    sectorId,
    schoolId,
    userId,
    hasRole,
    isSuperAdmin,
    isRegionAdmin,
    isSectorAdmin,
    isSchoolAdmin,
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
    hasRegionAccess,
    hasSectorAccess,
    hasSchoolAccess,
    checkRegionAccess,
    checkSectorAccess,
    checkSchoolAccess,
    checkCategoryAccess,
    checkColumnAccess
  };

  return permissions;
};

export default usePermissions;
