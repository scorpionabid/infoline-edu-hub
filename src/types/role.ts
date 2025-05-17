
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
