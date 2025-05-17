
export type UserRole = 
  | 'superadmin'
  | 'regionadmin' 
  | 'sectoradmin' 
  | 'schooladmin' 
  | 'user';

export interface RoleDefinition {
  value: UserRole;
  label: string;
  description?: string;
}

export const USER_ROLES: Record<UserRole, string> = {
  superadmin: 'Super Admin',
  regionadmin: 'Region Admin',
  sectoradmin: 'Sector Admin',
  schooladmin: 'School Admin',
  user: 'User'
};

export const normalizeRole = (role: string): UserRole => {
  switch (role.toLowerCase()) {
    case 'superadmin':
    case 'super_admin':
    case 'super-admin':
    case 'admin':
      return 'superadmin';
    case 'regionadmin':
    case 'region_admin':
    case 'region-admin':
      return 'regionadmin';
    case 'sectoradmin':
    case 'sector_admin':
    case 'sector-admin':
      return 'sectoradmin';
    case 'schooladmin':
    case 'school_admin':
    case 'school-admin':
      return 'schooladmin';
    default:
      return 'user';
  }
};
