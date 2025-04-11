import { useCallback, useMemo } from 'react';
import { UserRole } from '@/types/supabase';
import { UserRoleData } from './types';
import { useAuth } from '@/context/AuthContext';
import { checkPermission } from './permissionUtils';
import { PermissionLevel, UsePermissionsResult } from './types';

/**
 * İstifadəçinin müəyyən entity-yə icazəsinin olub-olmadığını yoxlayır
 */
export const usePermissions = (): UsePermissionsResult => {
  const { user, isAuthenticated } = useAuth();

  const checkRegionAccessHook = useCallback((regionId: string, level: PermissionLevel = 'read'): Promise<boolean> => {
    if (!isAuthenticated || !user || !user.id) return false;
    return checkPermission(user.id, user.role, user.regionId, regionId, level);
  }, [user, isAuthenticated]);

  const checkSectorAccessHook = useCallback((sectorId: string, level: PermissionLevel = 'read'): Promise<boolean> => {
    if (!isAuthenticated || !user || !user.id) return false;
    return checkPermission(user.id, user.role, user.regionId, user.sectorId, sectorId, level);
  }, [user, isAuthenticated]);

  const checkSchoolAccessHook = useCallback((schoolId: string, level: PermissionLevel = 'read'): Promise<boolean> => {
    if (!isAuthenticated || !user || !user.id) return false;
    return checkPermission(user.id, user.role, user.regionId, user.sectorId, schoolId, level);
  }, [user, isAuthenticated]);

  const checkCategoryAccessHook = useCallback((categoryId: string, level: PermissionLevel = 'read'): Promise<boolean> => {
    if (!isAuthenticated || !user || !user.id) return false;
    return checkPermission(user.id, user.role, categoryId, level);
  }, [user, isAuthenticated]);

  const checkColumnAccessHook = useCallback((columnId: string, level: PermissionLevel = 'read'): Promise<boolean> => {
    if (!isAuthenticated || !user || !user.id) return false;
    return checkPermission(user.id, user.role, columnId, level);
  }, [user, isAuthenticated]);

  // SectorAdmin rolunun kateqoriya və sütunlara çıxışının olub-olmadığını yoxlamaq üçün əlavə funksiya
  const canSectorAdminAccessCategoriesColumns = () => {
    // SectorAdmin həm kateqoriyalar həm də sütunlara çıxış əldə etməlidir
    return user?.role === 'sectoradmin';
  };

  return {
    checkRegionAccess: checkRegionAccessHook,
    checkSectorAccess: checkSectorAccessHook,
    checkSchoolAccess: checkSchoolAccessHook,
    checkCategoryAccess: checkCategoryAccessHook,
    checkColumnAccess: checkColumnAccessHook,
    canSectorAdminAccessCategoriesColumns,
    userRole: user?.role,
    userId: user?.id,
    regionId: user?.regionId,
    sectorId: user?.sectorId,
    schoolId: user?.schoolId
  };
};
