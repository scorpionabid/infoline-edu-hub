
// User roles
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user' | string;

// Function to normalize role values
export const normalizeRole = (role?: string | null): UserRole => {
  if (!role) return 'user';
  
  // Normalize role to standard format
  switch (role.toLowerCase()) {
    case 'superadmin':
    case 'super_admin':
    case 'super-admin':
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

export type PermissionLevel = 'read' | 'write' | 'admin' | 'none';
