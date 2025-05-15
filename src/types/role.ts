
/**
 * Standardized user roles for the entire application
 * This is the single source of truth for role definitions
 */
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user';

/**
 * Mapping of roles to their display names
 */
export const USER_ROLE_NAMES: Record<UserRole, string> = {
  superadmin: 'Super Admin',
  regionadmin: 'Region Admin',
  sectoradmin: 'Sector Admin',
  schooladmin: 'School Admin',
  user: 'User'
};

/**
 * Role hierarchy for permission checks
 * Higher index means higher permission level
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 0,
  schooladmin: 1,
  sectoradmin: 2,
  regionadmin: 3,
  superadmin: 4
};

/**
 * Check if a user role meets minimum level requirements
 */
export function hasMinimumRole(userRole: UserRole | null | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Get a valid role or default to 'user'
 */
export function normalizeRole(role?: string | null): UserRole {
  if (!role) return 'user';
  
  // Check if the provided role is a valid UserRole
  if (['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin', 'user'].includes(role)) {
    return role as UserRole;
  }
  
  return 'user';
}
