
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
  hasRegionAccess: (regionId: string) => boolean;
  hasSectorAccess: (sectorId: string) => boolean;
  hasSchoolAccess: (schoolId: string) => boolean;
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
  
  // Calculate permissions based on role
  const permissions = {
    userRole,
    regionId,
    sectorId,
    schoolId,
    hasRole,
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
    hasRegionAccess,
    hasSectorAccess,
    hasSchoolAccess
  };

  return permissions;
};

export default usePermissions;
