
import { UserRole } from "@/types/supabase";
import { FullUserData } from "@/types/supabase";

export type PermissionLevel = 'read' | 'write' | 'admin';

export type PermissionCheckResult = boolean | Promise<boolean>;

export interface UsePermissionsResult {
  canViewUsers: boolean;
  canManageUsers: boolean;
  canViewRegions: boolean;
  canManageRegions: boolean;
  canViewSectors: boolean;
  canManageSectors: boolean;
  canViewSchools: boolean;
  canManageSchools: boolean;
  canViewCategories: boolean;
  canManageCategories: boolean;
  isAuthenticated: boolean;
  isSuper: boolean;
  isRegionAdmin: boolean;
  isSectorAdmin: boolean;
  isSchoolAdmin: boolean;
  userRole: UserRole | null;
  regionId: string | null;
  sectorId: string | null;
  schoolId: string | null;
  
  isSuperAdmin: boolean; // Alias for isSuper for clarity
  canApproveData: boolean; // Property for approval permissions
  canViewSectorCategories: boolean;
  
  // Required functions
  checkRegionAccess: (regionId: string, level?: PermissionLevel) => Promise<boolean>;
  checkSectorAccess: (sectorId: string, level?: PermissionLevel) => Promise<boolean>;
  checkSchoolAccess: (schoolId: string, level?: PermissionLevel) => Promise<boolean>;
  checkCategoryAccess: (categoryId: string, level?: PermissionLevel) => Promise<boolean>;
  checkColumnAccess: (columnId: string, level?: PermissionLevel) => Promise<boolean>;
  
  userId?: string;
}
