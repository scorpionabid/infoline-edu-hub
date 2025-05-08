import { UserRole } from "@/types/supabase";

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
  canApproveData: boolean; // New property for approval permissions
}
