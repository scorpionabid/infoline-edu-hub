
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

/**
 * Normalizes any role value to a standard UserRole type
 * @param role Role value that may come in different formats
 * @returns Standardized UserRole value
 */
export function normalizeRole(role: any): UserRole {
  if (!role) return 'user';
  
  if (typeof role === 'string') {
    // Check if the role string is already one of our defined roles
    if (['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin', 'teacher', 'student', 'parent', 'user'].includes(role)) {
      return role as UserRole;
    }
  }
  
  // Handle cases where role is an object with a name property
  if (typeof role === 'object' && role !== null) {
    if (typeof role.name === 'string') {
      return normalizeRole(role.name);
    }
    if (typeof role.role === 'string') {
      return normalizeRole(role.role);
    }
  }
  
  // Default fallback
  return 'user';
}

/**
 * Compares roles to determine if one is equal or higher in privilege than another
 * @param userRole The user's role to check
 * @param requiredRole The minimum role required
 * @returns Boolean indicating if the user has sufficient privileges
 */
export function hasMinimumRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    'superadmin': 100,
    'regionadmin': 80,
    'sectoradmin': 60,
    'schooladmin': 40,
    'teacher': 30,
    'student': 20,
    'parent': 10,
    'user': 0
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
