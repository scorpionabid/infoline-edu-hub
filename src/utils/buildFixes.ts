
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

// NEW: Missing sector status functions
export const ensureSectorStatus = (status: string): 'active' | 'inactive' | 'deleted' => {
  const validStatuses = ['active', 'inactive', 'deleted'];
  return validStatuses.includes(status) ? status as 'active' | 'inactive' | 'deleted' : 'active';
};

export const ensureSectorDataEntryStatus = (status: string): 'draft' | 'submitted' | 'approved' | 'rejected' => {
  const validStatuses = ['draft', 'submitted', 'approved', 'rejected'];
  return validStatuses.includes(status) ? status as 'draft' | 'submitted' | 'approved' | 'rejected' : 'draft';
};

// NEW: Missing region status functions
export const ensureRegionStatus = (status: string): 'active' | 'inactive' | 'deleted' => {
  const validStatuses = ['active', 'inactive', 'deleted'];
  return validStatuses.includes(status) ? status as 'active' | 'inactive' | 'deleted' : 'active';
};

export const ensureEnhancedRegionData = (region: any): any => {
  return {
    ...region,
    status: ensureRegionStatus(region?.status || 'active')
  };
};

// NEW: Missing user status functions
export const ensureUserStatus = (status: string): UserStatus => {
  const validStatuses: UserStatus[] = ['active', 'inactive', 'pending', 'suspended'];
  return validStatuses.includes(status as UserStatus) ? status as UserStatus : 'active';
};

export const ensureValidStatus = (status: string): UserStatus => {
  return ensureUserStatus(status);
};

export const ensureValidRole = (role: string): UserRole => {
  const validRoles: UserRole[] = ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin'];
  return validRoles.includes(role as UserRole) ? role as UserRole : 'schooladmin';
};

// NEW: User data mapping functions
export const mapUserDataProperties = (userData: any): any => {
  return {
    ...userData,
    role: ensureValidRole(userData?.role || 'schooladmin'),
    status: ensureUserStatus(userData?.status || 'active')
  };
};

// NEW: Entity display name helper
export const getEntityDisplayName = (entityType: string, entityData: any): string => {
  if (!entityData) return 'N/A';
  
  switch (entityType) {
    case 'region':
      return entityData.name || 'Unknown Region';
    case 'sector':
      return entityData.name || 'Unknown Sector';
    case 'school':
      return entityData.name || 'Unknown School';
    default:
      return entityData.name || entityData.title || 'Unknown';
  }
};
