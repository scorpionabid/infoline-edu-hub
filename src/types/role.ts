
export type UserRoleType = 
  | 'superadmin'
  | 'regionadmin' 
  | 'sectoradmin' 
  | 'schooladmin' 
  | 'user';

export type UserRole = UserRoleType | string;

export interface RolePermissions {
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
}

/**
 * Normalizes a role string to a valid UserRoleType
 * @param role Any role string
 * @returns A normalized UserRole
 */
export const normalizeRole = (role: UserRole | null | undefined): UserRole => {
  if (!role) return 'user';
  
  // Convert to lowercase for case-insensitive comparison
  const normalizedRole = typeof role === 'string' ? role.toLowerCase() : 'user';
  
  // Check if it's one of our defined types
  switch (normalizedRole) {
    case 'superadmin':
    case 'regionadmin':
    case 'sectoradmin':
    case 'schooladmin':
    case 'user':
      return normalizedRole as UserRoleType;
    default:
      // If it doesn't match any of our predefined roles, return the original
      return role;
  }
};

export const getRolePermissions = (role: UserRole): RolePermissions => {
  switch (role) {
    case 'superadmin':
      return {
        canViewUsers: true,
        canManageUsers: true,
        canViewRegions: true,
        canManageRegions: true,
        canViewSectors: true,
        canManageSectors: true,
        canViewSchools: true,
        canManageSchools: true,
        canViewCategories: true,
        canManageCategories: true,
        canApproveData: true
      };
    case 'regionadmin':
      return {
        canViewUsers: true,
        canManageUsers: true,
        canViewRegions: true,
        canManageRegions: false,
        canViewSectors: true,
        canManageSectors: true,
        canViewSchools: true,
        canManageSchools: false,
        canViewCategories: true,
        canManageCategories: false,
        canApproveData: true
      };
    case 'sectoradmin':
      return {
        canViewUsers: true,
        canManageUsers: false,
        canViewRegions: true,
        canManageRegions: false,
        canViewSectors: true,
        canManageSectors: false,
        canViewSchools: true,
        canManageSchools: true,
        canViewCategories: true,
        canManageCategories: false,
        canApproveData: true
      };
    case 'schooladmin':
      return {
        canViewUsers: false,
        canManageUsers: false,
        canViewRegions: false,
        canManageRegions: false,
        canViewSectors: false,
        canManageSectors: false,
        canViewSchools: true,
        canManageSchools: false,
        canViewCategories: true,
        canManageCategories: false,
        canApproveData: false
      };
    default:
      return {
        canViewUsers: false,
        canManageUsers: false,
        canViewRegions: false,
        canManageRegions: false,
        canViewSectors: false,
        canManageSectors: false,
        canViewSchools: false,
        canManageSchools: false,
        canViewCategories: true,
        canManageCategories: false,
        canApproveData: false
      };
  }
};
