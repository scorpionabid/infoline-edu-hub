
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'teacher' | 'student' | 'parent' | 'user';

export type UserStatus = 'active' | 'inactive' | 'pending' | 'banned' | 'suspended';

export interface Role {
  id: string;
  name: UserRole;
  display_name: string;
  description?: string;
  permissions?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  group?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

export interface UserRoleMapping {
  id: string;
  user_id: string;
  role_id: string;
  entity_id?: string;
  entity_type?: 'region' | 'sector' | 'school';
  created_at?: string;
  updated_at?: string;
}
