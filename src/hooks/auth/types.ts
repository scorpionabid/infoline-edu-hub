
import { UserRole, FullUserData } from '@/types/supabase';

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
}
