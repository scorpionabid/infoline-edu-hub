
import { useAuthStore } from './useAuthStore';

export interface UsePermissionsResult {
  hasRole: (roles: string | string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  canAccessRegion: (regionId?: string) => boolean;
  canAccessSector: (sectorId?: string) => boolean;
  canAccessSchool: (schoolId?: string) => boolean;
  isSuperAdmin: boolean;
  isRegionAdmin: boolean;
  isSectorAdmin: boolean;
  isSchoolAdmin: boolean;
}

export const usePermissions = (): UsePermissionsResult => {
  const user = useAuthStore((state) => state.user);
  const userRole = user?.role;
  const userRegionId = user?.region_id || user?.regionId;
  const userSectorId = user?.sector_id || user?.sectorId;
  const userSchoolId = user?.school_id || user?.schoolId;

  const hasRole = (roles: string | string[]): boolean => {
    if (!userRole) return false;
    
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return allowedRoles.includes(userRole);
  };

  const hasPermission = (permission: string): boolean => {
    // Basic permission check - can be expanded later
    return !!user;
  };

  const canAccessRegion = (regionId?: string): boolean => {
    if (!user) return false;
    if (userRole === 'superadmin') return true;
    if (userRole === 'regionadmin') {
      return !regionId || userRegionId === regionId;
    }
    return false;
  };

  const canAccessSector = (sectorId?: string): boolean => {
    if (!user) return false;
    if (userRole === 'superadmin') return true;
    if (userRole === 'regionadmin') return true; // Region admin can access all sectors in their region
    if (userRole === 'sectoradmin') {
      return !sectorId || userSectorId === sectorId;
    }
    return false;
  };

  const canAccessSchool = (schoolId?: string): boolean => {
    if (!user) return false;
    if (['superadmin', 'regionadmin', 'sectoradmin'].includes(userRole || '')) return true;
    if (userRole === 'schooladmin') {
      return !schoolId || userSchoolId === schoolId;
    }
    return false;
  };

  return {
    hasRole,
    hasPermission,
    canAccessRegion,
    canAccessSector,
    canAccessSchool,
    isSuperAdmin: userRole === 'superadmin',
    isRegionAdmin: userRole === 'regionadmin',
    isSectorAdmin: userRole === 'sectoradmin',
    isSchoolAdmin: userRole === 'schooladmin',
  };
};

export const useDataAccessControl = () => {
  const permissions = usePermissions();
  
  return {
    ...permissions,
    filterByAccess: <T extends { region_id?: string; sector_id?: string; school_id?: string }>(
      items: T[]
    ): T[] => {
      return items.filter(item => {
        if (permissions.isSuperAdmin) return true;
        if (permissions.isRegionAdmin) return permissions.canAccessRegion(item.region_id);
        if (permissions.isSectorAdmin) return permissions.canAccessSector(item.sector_id);
        if (permissions.isSchoolAdmin) return permissions.canAccessSchool(item.school_id);
        return false;
      });
    }
  };
};

// Utility functions for backwards compatibility
export const checkRegionAccess = (userRole?: string, userRegionId?: string, targetRegionId?: string): boolean => {
  if (userRole === 'superadmin') return true;
  if (userRole === 'regionadmin') return !targetRegionId || userRegionId === targetRegionId;
  return false;
};

export const checkSectorAccess = (userRole?: string, userSectorId?: string, targetSectorId?: string): boolean => {
  if (['superadmin', 'regionadmin'].includes(userRole || '')) return true;
  if (userRole === 'sectoradmin') return !targetSectorId || userSectorId === targetSectorId;
  return false;
};

export const checkSchoolAccess = (userRole?: string, userSchoolId?: string, targetSchoolId?: string): boolean => {
  if (['superadmin', 'regionadmin', 'sectoradmin'].includes(userRole || '')) return true;
  if (userRole === 'schooladmin') return !targetSchoolId || userSchoolId === targetSchoolId;
  return false;
};

export const checkIsSuperAdmin = (userRole?: string): boolean => userRole === 'superadmin';
export const checkIsRegionAdmin = (userRole?: string): boolean => userRole === 'regionadmin';
export const checkIsSectorAdmin = (userRole?: string): boolean => userRole === 'sectoradmin';
export const checkUserRole = (userRole?: string, allowedRoles?: string[]): boolean => {
  if (!userRole || !allowedRoles) return false;
  return allowedRoles.includes(userRole);
};

// Additional utility functions
export const checkRegionAccessUtil = checkRegionAccess;
export const checkSectorAccessUtil = checkSectorAccess;
export const checkSchoolAccessUtil = checkSchoolAccess;
