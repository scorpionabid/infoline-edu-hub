
// Define allowed user roles
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user' | string;

// Function to normalize roles
export function normalizeRole(role?: string | null): UserRole {
  if (!role) return 'user';
  
  switch (role.toLowerCase()) {
    case 'superadmin':
      return 'superadmin';
    case 'regionadmin':
      return 'regionadmin';
    case 'sectoradmin':
      return 'sectoradmin';
    case 'schooladmin':
      return 'schooladmin';
    default:
      return 'user';
  }
}

// Map of role names to display names
export const roleDisplayNames: Record<UserRole, string> = {
  'superadmin': 'Super Admin',
  'regionadmin': 'Region Admin',
  'sectoradmin': 'Sector Admin',
  'schooladmin': 'School Admin',
  'user': 'Standard User'
};

// Use this to check if a role has permission over another role
export const roleHierarchy: Record<UserRole, number> = {
  'superadmin': 100,
  'regionadmin': 80,
  'sectoradmin': 60,
  'schooladmin': 40,
  'user': 20
};

// Default value for any string that doesn't match
roleDisplayNames.default = 'User';
roleHierarchy.default = 10;
