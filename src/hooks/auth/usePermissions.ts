
import { useAuth } from '@/context/auth';
import { UserRole } from '@/types/user';

export interface UsePermissionsResult {
  // Əsas rol
  userRole: UserRole;
  currentRole: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Rola əsaslanan bacarıqlar
  isSuperAdmin: boolean;
  isRegionAdmin: boolean;
  isSectorAdmin: boolean;
  isSchoolAdmin: boolean;
  
  // İdarəetmə icazələri
  canManageUsers: boolean;
  canManageRegions: boolean;
  canManageSectors: boolean;
  canManageSchools: boolean;
  canManageCategories: boolean;
  canApproveData: boolean;
  canEnterData: boolean;
  canGenerateReports: boolean;
  canViewSettings: boolean;
  
  // Spesifik sahələr üçün icazələr
  hasAccessToRegion: (regionId: string) => boolean;
  hasAccessToSector: (sectorId: string) => boolean;
  hasAccessToSchool: (schoolId: string) => boolean;
}

export const usePermissions = (): UsePermissionsResult => {
  const { user, isAuthenticated, loading } = useAuth();
  
  const userRole = user?.role || 'guest';
  
  // Rol yoxlamaları
  const isSuperAdmin = userRole === 'superadmin';
  const isRegionAdmin = userRole === 'regionadmin';
  const isSectorAdmin = userRole === 'sectoradmin';
  const isSchoolAdmin = userRole === 'schooladmin';
  
  // İcazələr
  const canManageUsers = isSuperAdmin || isRegionAdmin;
  const canManageRegions = isSuperAdmin;
  const canManageSectors = isSuperAdmin || isRegionAdmin;
  const canManageSchools = isSuperAdmin || isRegionAdmin || isSectorAdmin;
  const canManageCategories = isSuperAdmin || isRegionAdmin;
  const canApproveData = isSuperAdmin || isRegionAdmin || isSectorAdmin;
  const canEnterData = isSchoolAdmin;
  const canGenerateReports = isSuperAdmin || isRegionAdmin || isSectorAdmin;
  const canViewSettings = true; // Hər kəs öz hesab ayarlarını redaktə edə bilər
  
  // Region icazələri
  const hasAccessToRegion = (regionId: string): boolean => {
    if (isSuperAdmin) return true;
    if (isRegionAdmin) return user?.region_id === regionId;
    if (isSectorAdmin) {
      const sector = user?.sector_id;
      return sector && user?.region_id === regionId;
    }
    return false;
  };
  
  // Sektor icazələri
  const hasAccessToSector = (sectorId: string): boolean => {
    if (isSuperAdmin || isRegionAdmin) return true;
    if (isSectorAdmin) return user?.sector_id === sectorId;
    return false;
  };
  
  // Məktəb icazələri
  const hasAccessToSchool = (schoolId: string): boolean => {
    if (isSuperAdmin || isRegionAdmin || isSectorAdmin) return true;
    if (isSchoolAdmin) return user?.school_id === schoolId;
    return false;
  };
  
  return {
    userRole,
    currentRole: userRole,
    isAuthenticated,
    isLoading: loading,
    isSuperAdmin,
    isRegionAdmin,
    isSectorAdmin,
    isSchoolAdmin,
    canManageUsers,
    canManageRegions,
    canManageSectors,
    canManageSchools,
    canManageCategories,
    canApproveData,
    canEnterData,
    canGenerateReports,
    canViewSettings,
    hasAccessToRegion,
    hasAccessToSector,
    hasAccessToSchool
  };
};
