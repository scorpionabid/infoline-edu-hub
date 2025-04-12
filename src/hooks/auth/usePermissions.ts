
import { useAuth } from '@/context/auth';
import { UserRole, UserRoleData } from '@/types/supabase';
import { 
  checkRegionAccess, 
  checkSectorAccess, 
  checkSchoolAccess, 
  checkCategoryAccess, 
  checkColumnAccess 
} from './permissionCheckers';
import { PermissionLevel, UsePermissionsResult } from './permissionTypes';

/**
 * İstifadəçinin müəyyən entity-yə icazəsinin olub-olmadığını yoxlayır
 */
export const usePermissions = (): UsePermissionsResult => {
  const { user, isAuthenticated } = useAuth();

  const checkRegionAccessHook = async (regionId: string, level: PermissionLevel = 'read'): Promise<boolean> => {
    if (!isAuthenticated || !user || !user.id) return false;
    return checkRegionAccess(user.id, user.role, user.regionId, regionId, level);
  };

  const checkSectorAccessHook = async (sectorId: string, level: PermissionLevel = 'read'): Promise<boolean> => {
    if (!isAuthenticated || !user || !user.id) return false;
    return checkSectorAccess(user.id, user.role, user.regionId, user.sectorId, sectorId, level);
  };

  const checkSchoolAccessHook = async (schoolId: string, level: PermissionLevel = 'read'): Promise<boolean> => {
    if (!isAuthenticated || !user || !user.id) return false;
    return checkSchoolAccess(user.id, user.role, user.regionId, user.sectorId, schoolId, level);
  };

  const checkCategoryAccessHook = async (categoryId: string, level: PermissionLevel = 'read'): Promise<boolean> => {
    if (!isAuthenticated || !user || !user.id) return false;
    return checkCategoryAccess(user.id, categoryId, level);
  };

  const checkColumnAccessHook = async (columnId: string, level: PermissionLevel = 'read'): Promise<boolean> => {
    if (!isAuthenticated || !user || !user.id) return false;
    return checkColumnAccess(user.id, columnId, level);
  };

  // SectorAdmin rolunun kateqoriya və sütunlara çıxışının olub-olmadığını yoxlamaq üçün əlavə funksiya
  const canSectorAdminAccessCategoriesColumns = () => {
    // SectorAdmin həm kateqoriyalar həm də sütunlara çıxış əldə etməlidir
    return user?.role === 'sectoradmin';
  };

  // Region admin icazələri üçün əlavə helper funksiya
  const canRegionAdminManageCategoriesColumns = () => {
    // RegionAdmin kateqoriya və sütunları idarə edə bilər
    return user?.role === 'regionadmin';
  };

  return {
    checkRegionAccess: checkRegionAccessHook,
    checkSectorAccess: checkSectorAccessHook,
    checkSchoolAccess: checkSchoolAccessHook,
    checkCategoryAccess: checkCategoryAccessHook,
    checkColumnAccess: checkColumnAccessHook,
    canSectorAdminAccessCategoriesColumns,
    canRegionAdminManageCategoriesColumns,
    userRole: user?.role,
    userId: user?.id,
    regionId: user?.regionId,
    sectorId: user?.sectorId,
    schoolId: user?.schoolId
  };
};
