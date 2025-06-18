// ============================================================================
// İnfoLine Unified Permission System
// ============================================================================
// Bu fayl bütün permission sisteminini birləşdirir:
// - usePermissions.ts (əsas permission hook)
// - useDataAccessControl.ts (data access control)
// - permissionCheckers.ts (server-side checkers)
// - permissionUtils.ts (utility functions)

import { useCallback } from 'react';
import { useAuthStore } from '../useAuthStore';
import { supabase } from '@/integrations/supabase/client';
import type { 
  UsePermissionsResult, 
  DataAccessConfig, 
  DataAccessResult,
  PermissionLevel,
  PermissionResult,
  UserRole
} from '@/types/auth';

// ============================================================================
// Role Hierarchy Definition
// ============================================================================

const roleHierarchy = [
  'user',
  'teacher', 
  'schooladmin',
  'sectoradmin',
  'regionadmin',
  'superadmin'
];

// ============================================================================
// Main Permission Hook
// ============================================================================

export const usePermissions = (): UsePermissionsResult => {
  const userRole = useAuthStore(state => state.user?.role);
  const userRegionId = useAuthStore(state => state.user?.region_id);
  const userSectorId = useAuthStore(state => state.user?.sector_id);
  const userSchoolId = useAuthStore(state => state.user?.school_id);
  
  // ========== Basic Role Checks ==========
  
  const hasRole = (role: string | string[]): boolean => {
    if (!userRole) return false;
    
    if (Array.isArray(role)) {
      return role.includes(userRole);
    }
    
    return userRole === role;
  };
  
  const hasRoleAtLeast = (minimumRole: string): boolean => {
    if (!userRole || !minimumRole) return false;
    
    const userRoleIndex = roleHierarchy.indexOf(userRole);
    const minimumRoleIndex = roleHierarchy.indexOf(minimumRole);
    
    if (userRoleIndex === -1 || minimumRoleIndex === -1) return false;
    
    return userRoleIndex >= minimumRoleIndex;
  };
  
  const canAccessRoute = (allowedRoles: string[]): boolean => {
    if (!userRole) return false;
    if (allowedRoles.length === 0) return true;
    return allowedRoles.includes(userRole);
  };
  
  // ========== Entity ID Helper ==========
  
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
  
  // ========== Role Type Checkers ==========
  
  const isSuperAdmin = hasRole('superadmin');
  const isRegionAdmin = hasRole('regionadmin');
  const isSectorAdmin = hasRole('sectoradmin');
  const isSchoolAdmin = hasRole('schooladmin');
  const isTeacher = hasRole('teacher');
  const isUser = hasRole('user');
  
  // ========== Permission Flags ==========
  
  const canManageCategories = hasRoleAtLeast('regionadmin');
  const canManageColumns = hasRoleAtLeast('sectoradmin');
  const canManageSchools = hasRoleAtLeast('regionadmin');
  const canManageSectors = hasRoleAtLeast('regionadmin');
  const canManageRegions = hasRoleAtLeast('superadmin');
  const canManageUsers = hasRoleAtLeast('regionadmin');
  const canApproveData = hasRoleAtLeast('sectoradmin');
  const canViewReports = hasRoleAtLeast('sectoradmin');
  
  // Specific category permissions for sectoradmin
  const canEditCategory = !isSectorAdmin;
  const canDeleteCategory = !isSectorAdmin;
  const canAddCategory = !isSectorAdmin;
  const canEditData = isSuperAdmin || isRegionAdmin || isSectorAdmin || isSchoolAdmin;
  const hasSubmitPermission = isSuperAdmin || isRegionAdmin || isSectorAdmin || isSchoolAdmin || isTeacher || isUser;
  
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
    canManageColumns,
    canManageSchools,
    canManageSectors,
    canManageRegions,
    canManageUsers,
    canApproveData,
    canEditData,
    canViewReports,
    canEditCategory,
    canDeleteCategory,
    canAddCategory,
    hasSubmitPermission
  };
};

// ============================================================================
// Data Access Control Hook
// ============================================================================

export const useDataAccessControl = () => {
  const user = useAuthStore(state => state.user);
  const { 
    isSuperAdmin, 
    isRegionAdmin, 
    isSectorAdmin, 
    isSchoolAdmin,
    regionId,
    sectorId,
    schoolId
  } = usePermissions();

  const checkDataAccess = useCallback(async (schoolId: string, categoryId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data: hasAccess } = await supabase.rpc('can_access_data_entry', {
        user_id_param: user.id,
        entry_id_param: categoryId
      });

      return hasAccess || false;
    } catch (error) {
      console.error('Error checking data access:', error);
      return false;
    }
  }, [user]);

  const getAccessibleSchools = useCallback(async () => {
    if (!user) return [];

    try {
      const { data: schoolIds } = await supabase.rpc('get_accessible_schools', {
        user_id_param: user.id
      });

      if (schoolIds && schoolIds.length > 0) {
        const { data: schools } = await supabase
          .from('schools')
          .select('id, name, region_id, sector_id')
          .in('id', schoolIds);

        return schools || [];
      }

      return [];
    } catch (error) {
      console.error('Error fetching accessible schools:', error);
      return [];
    }
  }, [user]);

  const getAccessibleCategories = useCallback(async () => {
    if (!user) return [];

    const query = supabase.from('categories').select('*').eq('archived', false);

    if (isSchoolAdmin) {
      query.eq('assignment', 'all');
    } else if (isSectorAdmin) {
      query.in('assignment', ['all', 'sectors']);
    }

    try {
      const { data: categories } = await query;
      return categories || [];
    } catch (error) {
      console.error('Error fetching accessible categories:', error);
      return [];
    }
  }, [user, isSchoolAdmin, isSectorAdmin]);

  return {
    checkDataAccess,
    getAccessibleSchools,
    getAccessibleCategories,
    isSuperAdmin,
    isRegionAdmin,
    isSectorAdmin,
    isSchoolAdmin,
    regionId,
    sectorId,
    schoolId
  };
};

// ============================================================================
// Server-Side Permission Checkers
// ============================================================================

export const checkRegionAccess = async (regionId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('has_region_access', { 
      region_id_param: regionId 
    });
    
    if (error) {
      console.error('Error checking region access:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('Error in checkRegionAccess:', error);
    return false;
  }
};

export const checkSectorAccess = async (sectorId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('has_sector_access', { 
      sector_id_param: sectorId 
    });
    
    if (error) {
      console.error('Error checking sector access:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('Error in checkSectorAccess:', error);
    return false;
  }
};

export const checkSchoolAccess = async (schoolId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('has_school_access', { 
      school_id_param: schoolId 
    });
    
    if (error) {
      console.error('Error checking school access:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('Error in checkSchoolAccess:', error);
    return false;
  }
};

export const checkIsSuperAdmin = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('is_superadmin');
    
    if (error) {
      console.error('Error checking superadmin status:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('Error in checkIsSuperAdmin:', error);
    return false;
  }
};

export const checkIsRegionAdmin = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('is_regionadmin');
    
    if (error) {
      console.error('Error checking region admin status:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('Error in checkIsRegionAdmin:', error);
    return false;
  }
};

export const checkIsSectorAdmin = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('is_sectoradmin');
    
    if (error) {
      console.error('Error checking sector admin status:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('Error in checkIsSectorAdmin:', error);
    return false;
  }
};

// ============================================================================
// Permission Utility Functions
// ============================================================================

export const checkUserRole = (userRole: UserRole | undefined, rolesToCheck: UserRole | UserRole[]): boolean => {
  if (!userRole) return false;
  
  if (Array.isArray(rolesToCheck)) {
    return rolesToCheck.includes(userRole);
  }
  
  return userRole === rolesToCheck;
};

export const checkRegionAccessUtil = (
  userRole: UserRole | undefined,
  userRegionId: string | undefined, 
  regionIdToCheck: string
): boolean => {
  if (!userRole) return false;
  
  if (userRole === 'superadmin') return true;
  
  if (userRole === 'regionadmin') {
    return userRegionId === regionIdToCheck;
  }
  
  return false;
};

export const checkSectorAccessUtil = (
  userRole: UserRole | undefined,
  userRegionId: string | undefined,
  userSectorId: string | undefined,
  sectorIdToCheck: string,
  sectorRegionMap?: Record<string, string>
): boolean => {
  if (!userRole) return false;
  
  if (userRole === 'superadmin') return true;
  
  if (userRole === 'regionadmin' && userRegionId && sectorRegionMap) {
    const sectorRegionId = sectorRegionMap[sectorIdToCheck];
    return sectorRegionId === userRegionId;
  }
  
  if (userRole === 'sectoradmin') {
    return userSectorId === sectorIdToCheck;
  }
  
  return false;
};

export const checkSchoolAccessUtil = (
  userRole: UserRole | undefined,
  userSchoolId: string | undefined,
  schoolIdToCheck: string
): boolean => {
  if (!userRole) return false;
  
  if (userRole === 'superadmin') return true;
  
  if (userRole === 'schooladmin') {
    return userSchoolId === schoolIdToCheck;
  }
  
  return false;
};

// ============================================================================
// Default Exports
// ============================================================================

export default usePermissions;