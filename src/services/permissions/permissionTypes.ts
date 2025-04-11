
/**
 * İcazə səviyyəsi tipləri
 */
export type PermissionLevel = 'read' | 'write' | 'full';

/**
 * İcazə yoxlayıcı funksiyaların qaytardığı nəticə tipi
 */
export type PermissionCheckResult = Promise<boolean>;

/**
 * İcazələrin yoxlanması üçün interfeys
 */
export interface PermissionCheckers {
  checkRegionAccess: (regionId: string, level?: PermissionLevel) => PermissionCheckResult;
  checkSectorAccess: (sectorId: string, level?: PermissionLevel) => PermissionCheckResult;
  checkSchoolAccess: (schoolId: string, level?: PermissionLevel) => PermissionCheckResult;
  checkCategoryAccess: (categoryId: string, level?: PermissionLevel) => PermissionCheckResult;
  checkColumnAccess: (columnId: string, level?: PermissionLevel) => PermissionCheckResult;
  canSectorAdminAccessCategoriesColumns: () => boolean;
}

/**
 * İcazə yoxlama hook-unun qaytardığı nəticə tipi
 */
export interface UsePermissionsResult extends PermissionCheckers {
  userRole?: UserRole | null;
  userId?: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
}

/**
 * İstifadəçi rolu tipləri
 */
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin';

/**
 * İstifadəçi rolu məlumatları
 */
export interface UserRoleData {
  role?: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
}
