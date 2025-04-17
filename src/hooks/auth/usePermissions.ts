import { useCallback } from 'react';
import { useAuth } from '@/context/auth';

/**
 * İstifadəçi səlahiyyətlərini idarə etmək üçün hook
 */
export const usePermissions = () => {
  const { user } = useAuth();
  const userRole = user?.role;
  
  // Əsas rol yoxlamaları
  const isSuperAdmin = userRole === 'superadmin';
  const isRegionAdmin = userRole === 'regionadmin';
  const isSectorAdmin = userRole === 'sectoradmin';
  const isSchoolAdmin = userRole === 'schooladmin';
  
  // Məlumat əldə etmə
  const sectorId = user?.sector_id;
  const regionId = user?.region_id;
  const schoolId = user?.school_id;
  
  // Xüsusi icazələr
  const canManageCategoriesColumns = isSuperAdmin || isRegionAdmin;
  const canManageUsers = isSuperAdmin || isRegionAdmin || isSectorAdmin;
  const canViewReports = isSuperAdmin || isRegionAdmin || isSectorAdmin || isSchoolAdmin;
  
  /**
   * İstifadəçinin müəyyən rol olub olmadığını yoxlayır
   * @param role Yoxlanılacaq rol
   */
  const hasRole = useCallback((role: string | string[]) => {
    if (!userRole) return false;
    
    if (Array.isArray(role)) {
      return role.includes(userRole);
    }
    
    return role === userRole;
  }, [userRole]);

  /**
   * İstifadəçinin müəyyən regionda olub olmadığını yoxlayır
   * @param targetRegionId Yoxlanılacaq region ID
   */
  const isInRegion = useCallback((targetRegionId: string) => {
    if (isSuperAdmin) return true;
    return regionId === targetRegionId;
  }, [isSuperAdmin, regionId]);

  /**
   * İstifadəçinin müəyyən sektorda olub olmadığını yoxlayır
   * @param targetSectorId Yoxlanılacaq sektor ID
   */
  const isInSector = useCallback((targetSectorId: string) => {
    if (isSuperAdmin || isRegionAdmin) return true;
    return sectorId === targetSectorId;
  }, [isSuperAdmin, isRegionAdmin, sectorId]);

  /**
   * İstifadəçinin müəyyən məktəbdə olub olmadığını yoxlayır
   * @param targetSchoolId Yoxlanılacaq məktəb ID
   */
  const isInSchool = useCallback((targetSchoolId: string) => {
    if (isSuperAdmin || isRegionAdmin || isSectorAdmin) return true;
    return schoolId === targetSchoolId;
  }, [isSuperAdmin, isRegionAdmin, isSectorAdmin, schoolId]);

  return {
    userRole,
    isSuperAdmin,
    isRegionAdmin,
    isSectorAdmin,
    isSchoolAdmin,
    sectorId,
    regionId,
    schoolId,
    hasRole,
    isInRegion,
    isInSector,
    isInSchool,
    canManageCategoriesColumns,
    canManageUsers,
    canViewReports
  };
};
