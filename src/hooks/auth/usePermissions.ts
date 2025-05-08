
import { useRole } from '@/context/auth/useRole';

export interface UsePermissionsResult {
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
}

export const usePermissions = (): UsePermissionsResult => {
  const { role } = useRole();

  const isSuperAdmin = role === 'superadmin';
  const isRegionAdmin = role === 'regionadmin';
  const isSectorAdmin = role === 'sectoradmin';
  const isSchoolAdmin = role === 'schooladmin';

  // Superadmin hər şeyə icazəsi var
  if (isSuperAdmin) {
    return {
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
    };
  }

  // RegionAdmin icazələri
  if (isRegionAdmin) {
    return {
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
    };
  }

  // SectorAdmin icazələri
  if (isSectorAdmin) {
    return {
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
    };
  }

  // SchoolAdmin icazələri
  if (isSchoolAdmin) {
    return {
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
    };
  }

  // Default olaraq heç bir icazə yoxdur
  return {
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
    canCreateColumn: false,
  };
};
