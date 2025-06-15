
import { UserRole, UserStatus } from '@/types/auth';

// Safe type filtering functions to fix enum comparison errors
export const safeAdminRoleFilter = (role: string): UserRole | null => {
  const validRoles: UserRole[] = ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin'];
  return validRoles.includes(role as UserRole) ? role as UserRole : null;
};

export const safeUserStatusFilter = (status: string): UserStatus | null => {
  const validStatuses: UserStatus[] = ['active', 'inactive', 'pending', 'suspended'];
  return validStatuses.includes(status as UserStatus) ? status as UserStatus : null;
};

// Status validation helper
export const isValidColumnStatus = (status: string): boolean => {
  const validStatuses = ['active', 'inactive', 'deleted'];
  return validStatuses.includes(status);
};

// Type assertion helpers
export const assertColumnStatus = (status: string): 'active' | 'inactive' | 'deleted' => {
  if (isValidColumnStatus(status)) {
    return status as 'active' | 'inactive' | 'deleted';
  }
  return 'active'; // default fallback
};
