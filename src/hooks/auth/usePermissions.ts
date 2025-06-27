// ============================================================================
// İnfoLine Optimized Permission System
// ============================================================================
// Bu fayl permission sistemini optimallaşdırır:
// - Memoization əlavə edir
// - Təkrarlanan logic-i azaldır
// - Performance-i artırır

import { useCallback, useMemo } from 'react';
import { useAuthStore } from './useAuthStore';
import { supabase } from '@/integrations/supabase/client';
import type { 
  UsePermissionsResult, 
  UserRole
} from '@/types/auth';

// ============================================================================
// Role Hierarchy Definition
// ============================================================================

const roleHierarchy: UserRole[] = [
  'user',
  'teacher', 
  'schooladmin',
  'sectoradmin',
  'regionadmin',
  'superadmin'
];

// Memoized role hierarchy map for O(1) lookups
const roleHierarchyMap = new Map(roleHierarchy.map((role, index) => [role, index]));

// ============================================================================
// Main Permission Hook (Optimized)
// ============================================================================

export const usePermissions = (): UsePermissionsResult => {
  const user = useAuthStore(state => state.user);
  const userRole = user?.role;
  const userRegionId = user?.region_id;
  const userSectorId = user?.sector_id;
  const userSchoolId = user?.school_id;
  
  // Memoized basic role checks
  const roleChecks = useMemo(() => {
    const isSuperAdmin = userRole === 'superadmin';
    const isRegionAdmin = userRole === 'regionadmin';
    const isSectorAdmin = userRole === 'sectoradmin';
    const isSchoolAdmin = userRole === 'schooladmin';
    const isTeacher = userRole === 'teacher';
    const isUser = userRole === 'user';
    
    return {
      isSuperAdmin,
      isRegionAdmin,
      isSectorAdmin,
      isSchoolAdmin,
      isTeacher,
      isUser
    };
  }, [userRole]);
  
  // Memoized permission calculations
  const permissions = useMemo(() => {
    const { isSuperAdmin, isRegionAdmin, isSectorAdmin, isSchoolAdmin } = roleChecks;
    
    return {
      canManageCategories: isSuperAdmin || isRegionAdmin,
      canManageColumns: isSuperAdmin || isRegionAdmin || isSectorAdmin,
      canManageSchools: isSuperAdmin || isRegionAdmin,
      canManageSectors: isSuperAdmin || isRegionAdmin,
      canManageRegions: isSuperAdmin,
      canManageUsers: isSuperAdmin || isRegionAdmin,
      canApproveData: isSuperAdmin || isRegionAdmin || isSectorAdmin,
      canEditData: isSuperAdmin || isRegionAdmin || isSectorAdmin || isSchoolAdmin,
      canViewReports: isSuperAdmin || isRegionAdmin || isSectorAdmin,
      canEditCategory: !isSectorAdmin, // Sector admin cannot edit categories
      canDeleteCategory: !isSectorAdmin,
      canAddCategory: !isSectorAdmin,
      hasSubmitPermission: true // All authenticated users can submit
    };
  }, [roleChecks]);
  
  // Optimized role checking functions
  const hasRole = useCallback((role: string | string[]): boolean => {
    if (!userRole) return false;
    return Array.isArray(role) ? role.includes(userRole) : userRole === role;
  }, [userRole]);
  
  const hasRoleAtLeast = useCallback((minimumRole: string): boolean => {
    if (!userRole || !minimumRole) return false;
    
    const userRoleIndex = roleHierarchyMap.get(userRole as UserRole);
    const minimumRoleIndex = roleHierarchyMap.get(minimumRole as UserRole);
    
    if (userRoleIndex === undefined || minimumRoleIndex === undefined) return false;
    
    return userRoleIndex >= minimumRoleIndex;
  }, [userRole]);
  
  const canAccessRoute = useCallback((allowedRoles: string[]): boolean => {
    if (!userRole) return false;
    if (allowedRoles.length === 0) return true;
    return allowedRoles.includes(userRole);
  }, [userRole]);
  
  const getUserEntityId = useCallback((): string | undefined => {
    if (!userRole) return undefined;
    
    switch (userRole) {
      case 'superadmin': return 'all';
      case 'regionadmin': return userRegionId;
      case 'sectoradmin': return userSectorId;
      case 'schooladmin': return userSchoolId;
      default: return undefined;
    }
  }, [userRole, userRegionId, userSectorId, userSchoolId]);
  
  return {
    hasRole,
    hasRoleAtLeast,
    canAccessRoute,
    ...roleChecks,
    userEntityId: getUserEntityId(),
    userRole,
    regionId: userRegionId,
    sectorId: userSectorId,
    schoolId: userSchoolId,
    ...permissions
  };
};

// ============================================================================
// Simplified Server-Side Permission Checkers
// ============================================================================

// Memoized permission checker factory
const createPermissionChecker = (rpcFunction: string) => {
  const cache = new Map<string, { result: boolean; timestamp: number }>();
  const CACHE_TTL = 30000; // 30 seconds
  
  return async (id: string): Promise<boolean> => {
    const cacheKey = `${rpcFunction}_${id}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.result;
    }
    
    try {
      const { data, error } = await supabase.rpc(rpcFunction, { 
        [`${rpcFunction.replace('has_', '').replace('_access', '')}_id_param`]: id 
      });
      
      if (error) {
        console.error(`Error checking ${rpcFunction}:`, error);
        return false;
      }
      
      const result = data || false;
      cache.set(cacheKey, { result, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error(`Error in ${rpcFunction}:`, error);
      return false;
    }
  };
};

export const checkRegionAccess = createPermissionChecker('has_region_access');
export const checkSectorAccess = createPermissionChecker('has_sector_access');
export const checkSchoolAccess = createPermissionChecker('has_school_access');

// Simplified role checkers
export const checkIsSuperAdmin = async (): Promise<boolean> => {
  try {
    const { data } = await supabase.rpc('is_superadmin');
    return data || false;
  } catch {
    return false;
  }
};

export const checkIsRegionAdmin = async (): Promise<boolean> => {
  try {
    const { data } = await supabase.rpc('is_regionadmin');
    return data || false;
  } catch {
    return false;
  }
};

export const checkIsSectorAdmin = async (): Promise<boolean> => {
  try {
    const { data } = await supabase.rpc('is_sectoradmin');
    return data || false;
  } catch {
    return false;
  }
};

// ============================================================================
// Utility Functions (Simplified)
// ============================================================================

export const checkUserRole = (userRole: UserRole | undefined, rolesToCheck: UserRole | UserRole[]): boolean => {
  if (!userRole) return false;
  return Array.isArray(rolesToCheck) ? rolesToCheck.includes(userRole) : userRole === rolesToCheck;
};

export const checkRegionAccessUtil = (
  userRole: UserRole | undefined,
  userRegionId: string | undefined, 
  regionIdToCheck: string
): boolean => {
  if (!userRole) return false;
  if (userRole === 'superadmin') return true;
  if (userRole === 'regionadmin') return userRegionId === regionIdToCheck;
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
    return sectorRegionMap[sectorIdToCheck] === userRegionId;
  }
  if (userRole === 'sectoradmin') return userSectorId === sectorIdToCheck;
  return false;
};

export const checkSchoolAccessUtil = (
  userRole: UserRole | undefined,
  userSchoolId: string | undefined,
  schoolIdToCheck: string
): boolean => {
  if (!userRole) return false;
  if (userRole === 'superadmin') return true;
  if (userRole === 'schooladmin') return userSchoolId === schoolIdToCheck;
  return false;
};

// ============================================================================
// Data Access Control (Simplified)
// ============================================================================

export const useDataAccessControl = () => {
  const { 
    isSuperAdmin, 
    isRegionAdmin, 
    isSectorAdmin, 
    isSchoolAdmin,
    regionId,
    sectorId,
    schoolId
  } = usePermissions();
  
  const user = useAuthStore(state => state.user);

  const checkDataAccess = useCallback(async (schoolId: string, categoryId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data } = await supabase.rpc('can_access_data_entry', {
        user_id_param: user.id,
        entry_id_param: categoryId
      });
      return data || false;
    } catch {
      return false;
    }
  }, [user]);

  const getAccessibleSchools = useCallback(async () => {
    if (!user) return [];

    try {
      const { data: schoolIds } = await supabase.rpc('get_accessible_schools', {
        user_id_param: user.id
      });

      if (schoolIds?.length > 0) {
        const { data: schools } = await supabase
          .from('schools')
          .select('id, name, region_id, sector_id')
          .in('id', schoolIds);

        return schools || [];
      }
      return [];
    } catch {
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
      const { data } = await query;
      return data || [];
    } catch {
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
// Default Export
// ============================================================================

export default usePermissions;