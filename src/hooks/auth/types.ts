import { FullUserData } from '@/types/supabase';

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
  canViewSectorCategories: boolean; // Added the missing property
}

// Other type definitions as needed
