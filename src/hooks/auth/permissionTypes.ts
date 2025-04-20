
import { UserRole } from '@/types/supabase';

export type PermissionLevel = 'read' | 'write' | 'admin';
export type PermissionCheckResult = boolean | Promise<boolean>;

export interface UsePermissionsResult {
  // Əsas hüquq yoxlama funksiyaları
  checkRegionAccess?: (regionId: string, level?: PermissionLevel) => Promise<boolean>;
  checkSectorAccess?: (sectorId: string, level?: PermissionLevel) => Promise<boolean>;
  checkSchoolAccess?: (schoolId: string, level?: PermissionLevel) => Promise<boolean>;
  checkCategoryAccess?: (categoryId: string, level?: PermissionLevel) => Promise<boolean>;
  checkColumnAccess?: (columnId: string, level?: PermissionLevel) => Promise<boolean>;
  
  // Rola əsaslanan hüquq helper funksiyaları
  canSectorAdminAccessCategoriesColumns?: () => boolean;
  canRegionAdminManageCategoriesColumns: () => boolean;
  
  // İstifadəçi məlumatları
  userRole: UserRole | undefined;
  userId?: string | undefined;
  regionId?: string | undefined;
  sectorId?: string | undefined;
  schoolId?: string | undefined;
  canViewSectorCategories: boolean;
}
