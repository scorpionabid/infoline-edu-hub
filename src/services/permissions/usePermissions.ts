
import { useAuth } from '@/context/auth';
import { 
  checkRegionAccess, 
  checkSectorAccess, 
  checkSchoolAccess, 
  checkCategoryAccess, 
  checkColumnAccess 
} from './permissionCheckers';
import { PermissionLevel, UsePermissionsResult, UserRole } from './permissionTypes';

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
    return user?.role === 'sectoradmin';
  };

  return {
    checkRegionAccess: checkRegionAccessHook,
    checkSectorAccess: checkSectorAccessHook,
    checkSchoolAccess: checkSchoolAccessHook,
    checkCategoryAccess: checkCategoryAccessHook,
    checkColumnAccess: checkColumnAccessHook,
    canSectorAdminAccessCategoriesColumns,
    userRole: user?.role as UserRole | undefined,
    userId: user?.id,
    regionId: user?.regionId,
    sectorId: user?.sectorId,
    schoolId: user?.schoolId
  };
};
