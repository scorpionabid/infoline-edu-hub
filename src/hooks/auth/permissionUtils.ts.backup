
import { UserRole } from '@/types/user';

/**
 * Permission level for granular access control
 */
export type PermissionLevel = 'read' | 'write' | 'admin' | 'none';

/**
 * Result of a permission check
 */
export interface PermissionResult {
  hasPermission: boolean;
  level: PermissionLevel;
}

/**
 * Function type for permission checking
 */
export type PermissionChecker = (userId: string, entityId: string) => Promise<PermissionResult>;

/**
 * Check if a user has a specific role
 * @param userRole The user's role
 * @param rolesToCheck The role(s) to check against
 * @returns True if user has one of the roles, false otherwise
 */
export function checkUserRole(userRole: UserRole | undefined, rolesToCheck: UserRole | UserRole[]): boolean {
  if (!userRole) return false;
  
  if (Array.isArray(rolesToCheck)) {
    return rolesToCheck.includes(userRole);
  }
  
  return userRole === rolesToCheck;
}

/**
 * Check if user has access to a region
 * @param userRole The user's role
 * @param userRegionId The user's region ID
 * @param regionIdToCheck The region ID to check against
 * @returns True if user has access, false otherwise
 */
export function checkRegionAccess(
  userRole: UserRole | undefined,
  userRegionId: string | undefined, 
  regionIdToCheck: string
): boolean {
  if (!userRole) return false;
  
  // SuperAdmin has access to everything
  if (userRole === 'superadmin') return true;
  
  // RegionAdmin only has access to their region
  if (userRole === 'regionadmin') {
    return userRegionId === regionIdToCheck;
  }
  
  return false;
}

/**
 * Check if user has access to a sector
 * @param userRole The user's role
 * @param userRegionId The user's region ID
 * @param userSectorId The user's sector ID
 * @param sectorIdToCheck The sector ID to check against
 * @param sectorRegionMap Map of sector IDs to region IDs
 * @returns True if user has access, false otherwise
 */
export function checkSectorAccess(
  userRole: UserRole | undefined,
  userRegionId: string | undefined,
  userSectorId: string | undefined,
  sectorIdToCheck: string,
  sectorRegionMap?: Record<string, string>
): boolean {
  if (!userRole) return false;
  
  // SuperAdmin has access to everything
  if (userRole === 'superadmin') return true;
  
  // RegionAdmin has access to sectors in their region
  if (userRole === 'regionadmin' && userRegionId && sectorRegionMap) {
    const sectorRegionId = sectorRegionMap[sectorIdToCheck];
    return sectorRegionId === userRegionId;
  }
  
  // SectorAdmin only has access to their sector
  if (userRole === 'sectoradmin') {
    return userSectorId === sectorIdToCheck;
  }
  
  return false;
}

/**
 * Check if user has access to a school
 * @param userRole The user's role
 * @param userSchoolId The user's school ID
 * @param schoolIdToCheck The school ID to check against
 * @returns True if user has access, false otherwise
 */
export function checkSchoolAccess(
  userRole: UserRole | undefined,
  userSchoolId: string | undefined,
  schoolIdToCheck: string
): boolean {
  if (!userRole) return false;
  
  // SuperAdmin has access to everything
  if (userRole === 'superadmin') return true;
  
  // SchoolAdmin only has access to their school
  if (userRole === 'schooladmin') {
    return userSchoolId === schoolIdToCheck;
  }
  
  return false;
}
