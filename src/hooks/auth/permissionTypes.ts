
import { UserRole } from "@/types/supabase";

export type PermissionLevel = 'read' | 'write' | 'admin';

export type PermissionCheckResult = boolean | Promise<boolean>;

export interface UsePermissionsResult {
  // Rol yoxlamaları
  isSuperAdmin: boolean;
  isRegionAdmin: boolean;
  isSectorAdmin: boolean;
  isSchoolAdmin: boolean;
  
  // Əsas məlumatlar
  userRole?: UserRole;
  userId?: string;
  regionId?: string | null;
  sectorId?: string | null;
  schoolId?: string | null;
  
  // Əlçatanlıq yoxlamaları
  checkRegionAccess: (regionId: string, level?: PermissionLevel) => Promise<boolean>;
  checkSectorAccess: (sectorId: string, level?: PermissionLevel) => Promise<boolean>;
  checkSchoolAccess: (schoolId: string, level?: PermissionLevel) => Promise<boolean>;
  checkCategoryAccess: (categoryId: string, level?: PermissionLevel) => Promise<boolean>;
  checkColumnAccess: (columnId: string, level?: PermissionLevel) => Promise<boolean>;
  
  // Helper funksiyalar
  canViewSectorCategories: boolean;
  canManageCategories: boolean;
  canManageSchools: boolean;
  canManageUsers: boolean;
  canManageRegions: boolean;
  canManageSectors: boolean;
  canApproveData: boolean;
}
