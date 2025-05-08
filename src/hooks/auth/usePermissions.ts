
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/context/auth';
import {
  canViewUsers,
  canManageUsers,
  canViewRegions,
  canManageRegions,
  canViewSectors,
  canManageSectors,
  canViewSchools,
  canManageSchools,
  canViewCategories,
  canManageCategories
} from './permissionUtils';
import { UserRole } from '@/types/supabase';
import { UsePermissionsResult } from './types';

export const usePermissions = (): UsePermissionsResult => {
  const { user, isAuthenticated } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [regionId, setRegionId] = useState<string | null>(null);
  const [sectorId, setSectorId] = useState<string | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      // Extract the role from the user object (ensuring it's a valid UserRole)
      const role = user.role as UserRole;
      setUserRole(role);
      
      // Extract IDs from the user object, checking both camelCase and snake_case properties
      setRegionId(user.region_id || user.regionId || null);
      setSectorId(user.sector_id || user.sectorId || null);
      setSchoolId(user.school_id || user.schoolId || null);
    } else {
      setUserRole(null);
      setRegionId(null);
      setSectorId(null);
      setSchoolId(null);
    }
  }, [user]);

  const permissions = useMemo(() => {
    const isSuperAdmin = userRole === 'superadmin';
    const isRegionAdmin = userRole === 'regionadmin';
    const isSectorAdmin = userRole === 'sectoradmin';
    const isSchoolAdmin = userRole === 'schooladmin';
    
    return {
      canViewUsers: canViewUsers(userRole),
      canManageUsers: canManageUsers(userRole),
      canViewRegions: canViewRegions(userRole),
      canManageRegions: canManageRegions(userRole),
      canViewSectors: canViewSectors(userRole),
      canManageSectors: canManageSectors(userRole),
      canViewSchools: canViewSchools(userRole),
      canManageSchools: canManageSchools(userRole),
      canViewCategories: canViewCategories(userRole),
      canManageCategories: canManageCategories(userRole),
      isAuthenticated,
      isAdmin: isSuperAdmin || isRegionAdmin || isSectorAdmin || isSchoolAdmin,
      isSuper: isSuperAdmin,
      isSuperAdmin,
      isRegionAdmin,
      isSectorAdmin,
      isSchoolAdmin,
      userRole,
      regionId,
      sectorId,
      schoolId,
      canApproveData: isSuperAdmin || isRegionAdmin || isSectorAdmin,
      canViewSectorCategories: true,
      canRegionAdminManageCategoriesColumns: isRegionAdmin || isSuperAdmin,
      hasRole: (roles: string | string[]) => {
        if (!userRole) return false;
        if (Array.isArray(roles)) {
          return roles.includes(userRole);
        }
        return roles === userRole;
      },
      hasRegionAccess: (id: string) => {
        if (isSuperAdmin) return true;
        if (isRegionAdmin && regionId === id) return true;
        return false;
      },
      hasSectorAccess: (id: string) => {
        if (isSuperAdmin) return true;
        if (isRegionAdmin && regionId) return true;
        if (isSectorAdmin && sectorId === id) return true;
        return false;
      },
      hasSchoolAccess: (id: string) => {
        if (isSuperAdmin) return true;
        if (isRegionAdmin && regionId) return true;
        if (isSectorAdmin && sectorId) return true;
        if (isSchoolAdmin && schoolId === id) return true;
        return false;
      },
      // Add stub implementations for required functions
      checkRegionAccess: async (id: string) => 
        isSuperAdmin || (isRegionAdmin && regionId === id),
      checkSectorAccess: async (id: string) => 
        isSuperAdmin || (isRegionAdmin) || (isSectorAdmin && sectorId === id),
      checkSchoolAccess: async () => true,
      checkCategoryAccess: async () => true,
      checkColumnAccess: async () => true,
      userId: user?.id
    };
  }, [userRole, isAuthenticated, regionId, sectorId, schoolId, user]);

  return permissions;
};

export type { UsePermissionsResult };
export default usePermissions;
