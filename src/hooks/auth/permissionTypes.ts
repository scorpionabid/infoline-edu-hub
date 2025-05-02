
import { UserRole } from "@/types/supabase";

export interface UsePermissionsResult {
  // Rol yoxlamaları
  isSuperAdmin: boolean;
  isRegionAdmin: boolean;
  isSectorAdmin: boolean;
  isSchoolAdmin: boolean;
  
  // Əsas məlumatlar
  userRole?: UserRole;
  userId?: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  
  // Əlçatanlıq yoxlamaları
  checkRegionAccess: (targetRegionId: string, level?: PermissionLevel) => Promise<boolean>;
  checkSectorAccess: (targetSectorId: string, level?: PermissionLevel) => Promise<boolean>;
  checkSchoolAccess: (targetSchoolId: string, level?: PermissionLevel) => Promise<boolean>;
  checkCategoryAccess: (categoryId: string, level?: PermissionLevel) => Promise<boolean>;
  checkColumnAccess: (columnId: string, level?: PermissionLevel) => Promise<boolean>;
  
  // Helper funksiyalar
  canViewSectorCategories: boolean;
  canManageCategories: boolean;
}

export type PermissionLevel = 'read' | 'write' | 'delete' | 'approve';

export type PermissionCheckResult = {
  allowed: boolean;
  reason?: string;
};

