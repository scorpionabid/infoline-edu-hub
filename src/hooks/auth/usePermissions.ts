
import { useCallback } from 'react';
import { UserRole } from '@/types/supabase';
import { useAuth } from '@/context/AuthContext';
import { 
  checkRegionAccess, 
  checkSectorAccess, 
  checkSchoolAccess, 
  checkCategoryAccess, 
  checkColumnAccess, 
  canSectorAdminAccessCategoriesColumns
} from './permissionCheckers';
import { PermissionLevel, UsePermissionsResult } from './types';

/**
 * İstifadəçinin müəyyən entity-yə icazəsinin olub-olmadığını yoxlayır
 */
export const usePermissions = (): UsePermissionsResult => {
  const { user, isAuthenticated } = useAuth();

  const checkRegionAccessHook = useCallback(async (regionId: string, level: PermissionLevel = 'read'): Promise<boolean> => {
    if (!isAuthenticated || !user || !user.id) return Promise.resolve(false);
    return checkRegionAccess(regionId, level);
  }, [user, isAuthenticated]);

  const checkSectorAccessHook = useCallback(async (sectorId: string, level: PermissionLevel = 'read'): Promise<boolean> => {
    if (!isAuthenticated || !user || !user.id) return Promise.resolve(false);
    return checkSectorAccess(sectorId, level);
  }, [user, isAuthenticated]);

  const checkSchoolAccessHook = useCallback(async (schoolId: string, level: PermissionLevel = 'read'): Promise<boolean> => {
    if (!isAuthenticated || !user || !user.id) return Promise.resolve(false);
    return checkSchoolAccess(schoolId, level);
  }, [user, isAuthenticated]);

  const checkCategoryAccessHook = useCallback(async (categoryId: string, level: PermissionLevel = 'read'): Promise<boolean> => {
    if (!isAuthenticated || !user || !user.id) return Promise.resolve(false);
    return checkCategoryAccess(categoryId, level);
  }, [user, isAuthenticated]);

  const checkColumnAccessHook = useCallback(async (columnId: string, level: PermissionLevel = 'read'): Promise<boolean> => {
    if (!isAuthenticated || !user || !user.id) return Promise.resolve(false);
    return checkColumnAccess(columnId, level);
  }, [user, isAuthenticated]);

  // canSectorAdminAccessCategoriesColumns Promise qaytarmadığı üçün wrap edirik
  const canSectorAdminAccessCategoriesColumnsHook = useCallback((): boolean => {
    return canSectorAdminAccessCategoriesColumns();
  }, []);

  return {
    checkRegionAccess: checkRegionAccessHook,
    checkSectorAccess: checkSectorAccessHook,
    checkSchoolAccess: checkSchoolAccessHook,
    checkCategoryAccess: checkCategoryAccessHook,
    checkColumnAccess: checkColumnAccessHook,
    canSectorAdminAccessCategoriesColumns: canSectorAdminAccessCategoriesColumnsHook,
    userRole: user?.role as UserRole | undefined,
    userId: user?.id,
    regionId: user?.regionId,
    sectorId: user?.sectorId,
    schoolId: user?.schoolId
  };
};
