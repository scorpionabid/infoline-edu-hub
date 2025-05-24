
import { useAuthStore } from './useAuthStore';

// Define role hierarchy from lowest to highest permission level
const roleHierarchy = [
  'user',
  'teacher',
  'schooladmin',
  'sectoradmin',
  'regionadmin',
  'superadmin'
];

export interface UsePermissionsResult {
  hasRole: (role: string | string[]) => boolean;
  hasRoleAtLeast: (minimumRole: string) => boolean;
  canAccessRoute: (allowedRoles: string[]) => boolean;
  isSuperAdmin: boolean;
  isRegionAdmin: boolean;
  isSectorAdmin: boolean;
  isSchoolAdmin: boolean;
  isTeacher: boolean;
  isUser: boolean;
  userEntityId: string | undefined;
  userRole: string | undefined;
  regionId: string | undefined;
  sectorId: string | undefined;
  schoolId: string | undefined;
  canManageCategories: boolean;
  canApproveData: boolean;
  // Məlumatları redaktə etmək üçün icazə
  canEditData: boolean;
  // Məlumatları təqdim etmək üçün icazə
  hasSubmitPermission: boolean;
}

export const usePermissions = (): UsePermissionsResult => {
  const userRole = useAuthStore(state => state.user?.role);
  const userRegionId = useAuthStore(state => state.user?.region_id);
  const userSectorId = useAuthStore(state => state.user?.sector_id);
  const userSchoolId = useAuthStore(state => state.user?.school_id);
  
  // Determine if user has a specific role or any of multiple roles
  const hasRole = (role: string | string[]): boolean => {
    if (!userRole) return false;
    
    if (Array.isArray(role)) {
      return role.includes(userRole);
    }
    
    return userRole === role;
  };
  
  // Determine if user has at least a minimum role in the hierarchy
  const hasRoleAtLeast = (minimumRole: string): boolean => {
    if (!userRole || !minimumRole) return false;
    
    const userRoleIndex = roleHierarchy.indexOf(userRole);
    const minimumRoleIndex = roleHierarchy.indexOf(minimumRole);
    
    // If either role isn't found in the hierarchy, return false
    if (userRoleIndex === -1 || minimumRoleIndex === -1) return false;
    
    // User's role is at least the minimum required role
    return userRoleIndex >= minimumRoleIndex;
  };
  
  // Determine if user can access a route with specific allowed roles
  const canAccessRoute = (allowedRoles: string[]): boolean => {
    if (!userRole) return false;
    if (allowedRoles.length === 0) return true; // No restrictions
    return allowedRoles.includes(userRole);
  };
  
  // Get the ID of the entity the user is associated with based on role
  const getUserEntityId = (): string | undefined => {
    if (!userRole) return undefined;
    
    switch (userRole) {
      case 'superadmin':
        return 'all';
      case 'regionadmin':
        return userRegionId;
      case 'sectoradmin':
        return userSectorId;
      case 'schooladmin':
        return userSchoolId;
      default:
        return undefined;
    }
  };
  
  // Check specific role types
  const isSuperAdmin = hasRole('superadmin');
  const isRegionAdmin = hasRole('regionadmin');
  const isSectorAdmin = hasRole('sectoradmin');
  const isSchoolAdmin = hasRole('schooladmin');
  const isTeacher = hasRole('teacher');
  const isUser = hasRole('user');
  
  // Additional permissions based on roles
  const canManageCategories = isSuperAdmin || isRegionAdmin;
  const canApproveData = isSuperAdmin || isRegionAdmin || isSectorAdmin;
  
  // Məlumatları redaktə etmək üçün icazə - superadmin, regionadmin, sectoradmin və schooladmin
  const canEditData = isSuperAdmin || isRegionAdmin || isSectorAdmin || isSchoolAdmin;
  
  // Məlumatları təqdim etmək üçün icazə - bütün rol növləri üçün
  const hasSubmitPermission = isSuperAdmin || isRegionAdmin || isSectorAdmin || isSchoolAdmin || isTeacher || isUser;
  
  // Entity ID based on user role
  const userEntityId = getUserEntityId();
  
  return {
    hasRole,
    hasRoleAtLeast,
    canAccessRoute,
    isSuperAdmin,
    isRegionAdmin,
    isSectorAdmin,
    isSchoolAdmin,
    isTeacher,
    isUser,
    userEntityId,
    userRole,
    regionId: userRegionId,
    sectorId: userSectorId,
    schoolId: userSchoolId,
    canManageCategories,
    canApproveData,
    canEditData,
    hasSubmitPermission
  };
};

export default usePermissions;
