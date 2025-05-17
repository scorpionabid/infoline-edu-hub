
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'teacher' | 'user';

export function normalizeRole(role: string | null | undefined): UserRole {
  if (!role) return 'user';
  
  switch(role.toLowerCase()) {
    case 'superadmin':
      return 'superadmin';
    case 'regionadmin':
      return 'regionadmin';
    case 'sectoradmin':
      return 'sectoradmin';
    case 'schooladmin':
      return 'schooladmin';
    case 'teacher':
      return 'teacher';
    default:
      return 'user';
  }
}

export const roleHierarchy: UserRole[] = [
  'user',
  'teacher',
  'schooladmin',
  'sectoradmin', 
  'regionadmin',
  'superadmin'
];

export function getRoleLevel(role: UserRole): number {
  const index = roleHierarchy.indexOf(role);
  return index === -1 ? 0 : index;
}

export function isRoleAtLeast(userRole: UserRole, requiredRole: UserRole): boolean {
  const userLevel = getRoleLevel(userRole);
  const requiredLevel = getRoleLevel(requiredRole);
  return userLevel >= requiredLevel;
}
