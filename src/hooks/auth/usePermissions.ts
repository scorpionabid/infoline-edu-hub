
import { useRole } from '@/context/auth/useRole';
import { UserRole } from '@/types/supabase';

export interface UsePermissionsResult {
  // Role çekleri
  isSuperAdmin: boolean;
  isRegionAdmin: boolean;
  isSectorAdmin: boolean;
  isSchoolAdmin: boolean;

  // İstifadəçi məlumatları
  userRole?: UserRole;
  userId?: string;
  regionId?: string | null;
  sectorId?: string | null;
  schoolId?: string | null;
  
  // İcazə funksiyaları
  canManageUsers: boolean;
  canViewUsers: boolean;
  canManageCategories: boolean;
  canViewCategories: boolean;
  canManageSchools: boolean;
  canViewSchools: boolean;
  canManageRegions: boolean;
  canViewRegions: boolean;
  canManageSectors: boolean;
  canViewSectors: boolean;
  canApproveData: boolean;
  canSubmitData: boolean;
  canDeleteCategory: boolean;
  canEditCategory: boolean;
  canCreateCategory: boolean;
  canDeleteColumn: boolean;
  canEditColumn: boolean;
  canCreateColumn: boolean;
  
  // Əlavə edilən funksiyalar
  checkRegionAccess?: (regionId: string, level?: string) => Promise<boolean>;
  checkSectorAccess?: (sectorId: string, level?: string) => Promise<boolean>;
  checkSchoolAccess?: (schoolId: string, level?: string) => Promise<boolean>;
  checkCategoryAccess?: (categoryId: string, level?: string) => Promise<boolean>;
  checkColumnAccess?: (columnId: string, level?: string) => Promise<boolean>;
  canViewSectorCategories?: boolean;
}

export const usePermissions = (): UsePermissionsResult => {
  const { role, user } = useRole();

  const isSuperAdmin = role === 'superadmin';
  const isRegionAdmin = role === 'regionadmin';
  const isSectorAdmin = role === 'sectoradmin';
  const isSchoolAdmin = role === 'schooladmin';

  const userId = user?.id;
  const regionId = user?.region_id;
  const sectorId = user?.sector_id;
  const schoolId = user?.school_id;

  // Superadmin hər şeyə icazəsi var
  if (isSuperAdmin) {
    return {
      isSuperAdmin: true,
      isRegionAdmin: false,
      isSectorAdmin: false,
      isSchoolAdmin: false,
      userRole: 'superadmin',
      userId,
      regionId,
      sectorId,
      schoolId,
      canManageUsers: true,
      canViewUsers: true,
      canManageCategories: true,
      canViewCategories: true,
      canManageSchools: true,
      canViewSchools: true,
      canManageRegions: true,
      canViewRegions: true,
      canManageSectors: true,
      canViewSectors: true,
      canApproveData: true,
      canSubmitData: true,
      canDeleteCategory: true,
      canEditCategory: true,
      canCreateCategory: true,
      canDeleteColumn: true,
      canEditColumn: true,
      canCreateColumn: true,
      canViewSectorCategories: true
    };
  }

  // RegionAdmin icazələri
  if (isRegionAdmin) {
    return {
      isSuperAdmin: false,
      isRegionAdmin: true,
      isSectorAdmin: false,
      isSchoolAdmin: false,
      userRole: 'regionadmin',
      userId,
      regionId,
      sectorId,
      schoolId,
      canManageUsers: true,
      canViewUsers: true,
      canManageCategories: true,
      canViewCategories: true,
      canManageSchools: true,
      canViewSchools: true,
      canManageRegions: false,
      canViewRegions: true,
      canManageSectors: true,
      canViewSectors: true,
      canApproveData: true,
      canSubmitData: false,
      canDeleteCategory: true,
      canEditCategory: true,
      canCreateCategory: true,
      canDeleteColumn: true,
      canEditColumn: true,
      canCreateColumn: true,
      canViewSectorCategories: true
    };
  }

  // SectorAdmin icazələri
  if (isSectorAdmin) {
    return {
      isSuperAdmin: false,
      isRegionAdmin: false,
      isSectorAdmin: true,
      isSchoolAdmin: false,
      userRole: 'sectoradmin',
      userId,
      regionId,
      sectorId,
      schoolId,
      canManageUsers: false,
      canViewUsers: true,
      canManageCategories: false,
      canViewCategories: true,
      canManageSchools: true,
      canViewSchools: true,
      canManageRegions: false,
      canViewRegions: true,
      canManageSectors: false,
      canViewSectors: true,
      canApproveData: true,
      canSubmitData: false,
      canDeleteCategory: false,
      canEditCategory: false,
      canCreateCategory: false,
      canDeleteColumn: false,
      canEditColumn: false,
      canCreateColumn: false,
      canViewSectorCategories: true
    };
  }

  // SchoolAdmin icazələri
  if (isSchoolAdmin) {
    return {
      isSuperAdmin: false,
      isRegionAdmin: false,
      isSectorAdmin: false,
      isSchoolAdmin: true,
      userRole: 'schooladmin',
      userId,
      regionId,
      sectorId,
      schoolId,
      canManageUsers: false,
      canViewUsers: false,
      canManageCategories: false,
      canViewCategories: true,
      canManageSchools: false,
      canViewSchools: false,
      canManageRegions: false,
      canViewRegions: false,
      canManageSectors: false,
      canViewSectors: false,
      canApproveData: false,
      canSubmitData: true,
      canDeleteCategory: false,
      canEditCategory: false,
      canCreateCategory: false,
      canDeleteColumn: false,
      canEditColumn: false,
      canCreateColumn: false,
      canViewSectorCategories: false
    };
  }

  // Default olaraq heç bir icazə yoxdur
  return {
    isSuperAdmin: false,
    isRegionAdmin: false,
    isSectorAdmin: false,
    isSchoolAdmin: false,
    userId,
    regionId,
    sectorId,
    schoolId,
    canManageUsers: false,
    canViewUsers: false,
    canManageCategories: false,
    canViewCategories: false,
    canManageSchools: false,
    canViewSchools: false,
    canManageRegions: false,
    canViewRegions: false,
    canManageSectors: false,
    canViewSectors: false,
    canApproveData: false,
    canSubmitData: false,
    canDeleteCategory: false,
    canEditCategory: false,
    canCreateCategory: false,
    canDeleteColumn: false,
    canEditColumn: false,
    canCreateColumn: false
  };
};
