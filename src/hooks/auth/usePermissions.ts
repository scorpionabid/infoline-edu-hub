
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
      isSuper: userRole === 'superadmin',
      isRegionAdmin: userRole === 'regionadmin',
      isSectorAdmin: userRole === 'sectoradmin',
      isSchoolAdmin: userRole === 'schooladmin',
      userRole,
      regionId,
      sectorId,
      schoolId
    };
  }, [userRole, isAuthenticated, regionId, sectorId, schoolId]);

  return permissions;
};

export type { UsePermissionsResult };
export default usePermissions;
