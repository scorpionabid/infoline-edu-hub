import { useCallback, useMemo } from 'react';
import { useAuth } from '@/context/auth';
import { UserRole } from '@/types/supabase';
import { PermissionCheckResult, PermissionLevel, UsePermissionsResult } from './permissionTypes';

/**
 * İstifadəçi əlçatanlıq icazələrini yoxlayan hook
 */
export const usePermissions = (): UsePermissionsResult => {
  const { user, authenticated } = useAuth();
  
  // İstifadəçi rolunu müəyyən et
  const userRole = useMemo<UserRole | undefined>(() => {
    if (!user) return undefined;
    return user.role as UserRole;
  }, [user]);
  
  // İstifadəçi roluna əsaslanan bayraqlar
  const isSuperAdmin = useMemo<boolean>(() => userRole === 'superadmin', [userRole]);
  const isRegionAdmin = useMemo<boolean>(() => userRole === 'regionadmin', [userRole]);
  const isSectorAdmin = useMemo<boolean>(() => userRole === 'sectoradmin', [userRole]);
  const isSchoolAdmin = useMemo<boolean>(() => userRole === 'schooladmin', [userRole]);
  
  // İstifadəçi ID-si və təyin olunmuş ID-lər
  const userId = useMemo<string | undefined>(() => user?.id, [user]);
  const regionId = useMemo<string | null | undefined>(() => user?.region_id, [user]);
  const sectorId = useMemo<string | null | undefined>(() => user?.sector_id, [user]);
  const schoolId = useMemo<string | null | undefined>(() => user?.school_id, [user]);
  
  // Region əlçatanlığını yoxla
  const checkRegionAccess = useCallback(
    async (regionIdToCheck: string, level: PermissionLevel = 'read'): Promise<boolean> => {
      if (!authenticated) return false;
      if (isSuperAdmin) return true;
      if (isRegionAdmin && regionId === regionIdToCheck) return true;
      
      // Əgər heç bir şərt ödənməzsə, false qaytar
      return false;
    },
    [authenticated, isSuperAdmin, isRegionAdmin, regionId]
  );
  
  // Sektor əlçatanlığını yoxla
  const checkSectorAccess = useCallback(
    async (sectorIdToCheck: string, level: PermissionLevel = 'read'): Promise<boolean> => {
      if (!authenticated) return false;
      if (isSuperAdmin) return true;
      if (isRegionAdmin && regionId === user?.region_id) return true;
      if (isSectorAdmin && sectorId === sectorIdToCheck) return true;
      
      return false;
    },
    [authenticated, isSuperAdmin, isRegionAdmin, isSectorAdmin, regionId, sectorId, user?.region_id]
  );
  
  // Məktəb əlçatanlığını yoxla
  const checkSchoolAccess = useCallback(
    async (schoolIdToCheck: string, level: PermissionLevel = 'read'): Promise<boolean> => {
      if (!authenticated) return false;
      if (isSuperAdmin) return true;
      if (isRegionAdmin && regionId === user?.region_id) return true;
      if (isSectorAdmin && sectorId === user?.sector_id) return true;
      if (isSchoolAdmin && schoolId === schoolIdToCheck) return true;
      
      return false;
    },
    [authenticated, isSuperAdmin, isRegionAdmin, isSectorAdmin, isSchoolAdmin, regionId, sectorId, schoolId, user?.region_id, user?.sector_id]
  );
  
  // Kateqoriya əlçatanlığını yoxla
  const checkCategoryAccess = useCallback(
    async (categoryIdToCheck: string, level: PermissionLevel = 'read'): Promise<boolean> => {
      if (!authenticated) return false;
      if (isSuperAdmin) return true;
      
      // Digər rollar üçün əlavə yoxlamalar tələb oluna bilər
      return false;
    },
    [authenticated, isSuperAdmin]
  );
  
  // Sütun əlçatanlığını yoxla
  const checkColumnAccess = useCallback(
    async (columnIdToCheck: string, level: PermissionLevel = 'read'): Promise<boolean> => {
      if (!authenticated) return false;
      if (isSuperAdmin) return true;
      
      return false;
    },
    [authenticated, isSuperAdmin]
  );
  
  // Sektor kateqoriyalarına baxmaq icazəsi
  const canViewSectorCategories = useMemo<boolean>(() => {
    return isSuperAdmin || isRegionAdmin || isSectorAdmin;
  }, [isSuperAdmin, isRegionAdmin, isSectorAdmin]);
  
  // Kateqoriyaları idarə etmək icazəsi
  const canManageCategories = useMemo<boolean>(() => {
    return isSuperAdmin;
  }, [isSuperAdmin]);
  
  return {
    // Roles
    isSuperAdmin,
    isRegionAdmin,
    isSectorAdmin,
    isSchoolAdmin,
    
    // Basic data
    userRole,
    userId,
    regionId,
    sectorId,
    schoolId,
    
    // Access checks
    checkRegionAccess,
    checkSectorAccess,
    checkSchoolAccess,
    checkCategoryAccess,
    checkColumnAccess,
    
    // Helper flags
    canViewSectorCategories,
    canManageCategories
  };
};
