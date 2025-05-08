
import { FullUserData } from '@/types/user';

export interface UsePermissionsResult {
  userRole: string | null; 
  hasRole: (roles: string | string[]) => boolean;
  hasRegionAccess: (regionId: string) => boolean;
  hasSectorAccess: (sectorId: string) => boolean;
  hasSchoolAccess: (schoolId: string) => boolean;
  regionId: string | null;
  sectorId: string | null;
  schoolId: string | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isRegionAdmin: boolean;
  isSectorAdmin: boolean;
  isSchoolAdmin: boolean;
  canRegionAdminManageCategoriesColumns: boolean;
  canViewSectorCategories: boolean;
  // Required properties
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
  canApproveData: boolean;
  userId?: string;
  checkRegionAccess: (regionId: string, level?: string) => Promise<boolean>;
  checkSectorAccess: (sectorId: string, level?: string) => Promise<boolean>;
  checkSchoolAccess: (schoolId: string, level?: string) => Promise<boolean>;
  checkCategoryAccess: (categoryId: string, level?: string) => Promise<boolean>;
  checkColumnAccess: (columnId: string, level?: string) => Promise<boolean>;
}
