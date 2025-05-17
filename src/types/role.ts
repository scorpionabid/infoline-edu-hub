
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user' | string;

export function normalizeRole(role: string): UserRole {
  const validRoles: UserRole[] = ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin', 'user'];
  
  if (validRoles.includes(role as UserRole)) {
    return role as UserRole;
  }
  
  return 'user';
}

export interface UserRoleEntity {
  id: string;
  user_id: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
  school_id?: string;
  sector_id?: string;
  region_id?: string;
}

export interface RoleAssignment {
  role: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
}

export const RoleHierarchy = {
  'superadmin': 100,
  'regionadmin': 80,
  'sectoradmin': 60,
  'schooladmin': 40,
  'user': 20
};

export function getRoleLevel(role: UserRole): number {
  return RoleHierarchy[role as keyof typeof RoleHierarchy] || 0;
}
