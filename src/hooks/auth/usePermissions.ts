
import { useMemo } from 'react';
import { useAuth } from '@/context/auth';
import { Role } from '@/context/auth/types';
import { UserRole } from '@/types/supabase';
import { PermissionCheckResult, UsePermissionsResult } from './permissionTypes';

/**
 * Səlahiyyət və rola əsaslanan əlçatanlıq imkanlarını təmin edən hook
 * 
 * @returns {UsePermissionsResult} Rol və səlahiyyət yoxlamaları üçün funksiyalar
 */
export const usePermissions = (): UsePermissionsResult => {
  const { user, isAuthenticated } = useAuth();
  
  return useMemo(() => {
    // Default olaraq icazəsiz
    if (!user || !isAuthenticated) {
      return {
        isSuperAdmin: false,
        isRegionAdmin: false,
        isSectorAdmin: false,
        isSchoolAdmin: false,
        userRole: undefined,
        userId: undefined,
        regionId: undefined,
        sectorId: undefined,
        schoolId: undefined,
        checkRegionAccess: async () => false,
        checkSectorAccess: async () => false,
        checkSchoolAccess: async () => false,
        checkCategoryAccess: async () => false,
        checkColumnAccess: async () => false,
        canViewSectorCategories: false,
        canManageCategories: false
      };
    }

    const userRole = user.role as UserRole;
    
    // Rol əsaslı əlçatanlıq funksiyaları
    const isSuperAdmin = userRole === 'superadmin';
    const isRegionAdmin = userRole === 'regionadmin';
    const isSectorAdmin = userRole === 'sectoradmin';
    const isSchoolAdmin = userRole === 'schooladmin';
    
    // Əlavə səlahiyyət funksiyaları
    const canViewSectorCategories = isSuperAdmin || isRegionAdmin || isSectorAdmin;
    const canManageCategories = isSuperAdmin || isRegionAdmin;

    // Region əlçatanlıq yoxlaması
    const checkRegionAccess = async (regionId: string, level = 'read'): Promise<boolean> => {
      if (isSuperAdmin) return true;
      if (isRegionAdmin && user.region_id === regionId) return true;
      return false;
    };

    // Sektor əlçatanlıq yoxlaması
    const checkSectorAccess = async (sectorId: string, level = 'read'): Promise<boolean> => {
      if (isSuperAdmin) return true;
      if (isRegionAdmin && await checkSectorInRegion(sectorId, user.region_id)) return true;
      if (isSectorAdmin && user.sector_id === sectorId) return true;
      return false;
    };

    // Məktəb əlçatanlıq yoxlaması
    const checkSchoolAccess = async (schoolId: string, level = 'read'): Promise<boolean> => {
      if (isSuperAdmin) return true;
      if (isRegionAdmin && await checkSchoolInRegion(schoolId, user.region_id)) return true;
      if (isSectorAdmin && await checkSchoolInSector(schoolId, user.sector_id)) return true;
      if (isSchoolAdmin && user.school_id === schoolId) return true;
      return false;
    };

    // Kateqoriya əlçatanlıq yoxlaması
    const checkCategoryAccess = async (categoryId: string, level = 'read'): Promise<boolean> => {
      if (isSuperAdmin || isRegionAdmin) return true;
      
      // TODO: Kateqoriya əlçatanlığı üçün xüsusi yoxlama əlavə edilə bilər
      // Burada həmin məktəbin/sektorun hansı kateqoriyalara giriş imkanı olduğu yoxlanmalıdır
      
      return canViewSectorCategories;
    };

    // Sütun əlçatanlıq yoxlaması
    const checkColumnAccess = async (columnId: string, level = 'read'): Promise<boolean> => {
      if (isSuperAdmin || isRegionAdmin) return true;
      
      // TODO: Sütun əlçatanlığı üçün xüsusi yoxlama əlavə edilə bilər
      
      return canViewSectorCategories;
    };

    return {
      // Rol yoxlamaları
      isSuperAdmin,
      isRegionAdmin,
      isSectorAdmin,
      isSchoolAdmin,
      
      // Əsas məlumatlar
      userRole,
      userId: user.id,
      regionId: user.region_id,
      sectorId: user.sector_id,
      schoolId: user.school_id,
      
      // Əlçatanlıq yoxlamaları
      checkRegionAccess,
      checkSectorAccess,
      checkSchoolAccess,
      checkCategoryAccess,
      checkColumnAccess,
      
      // Helper funksiyalar
      canViewSectorCategories,
      canManageCategories
    };
  }, [user, isAuthenticated]);
};

// Helper funksiyalar
async function checkSectorInRegion(sectorId: string | undefined | null, regionId: string | undefined | null): Promise<boolean> {
  if (!sectorId || !regionId) return false;
  
  // TODO: Bu funksiya sektorun region daxilində olub-olmadığını yoxlamalıdır
  // Hal-hazırda sadələşdirilmiş versiya qaytarırıq
  return true;
}

async function checkSchoolInRegion(schoolId: string | undefined | null, regionId: string | undefined | null): Promise<boolean> {
  if (!schoolId || !regionId) return false;
  
  // TODO: Bu funksiya məktəbin region daxilində olub-olmadığını yoxlamalıdır
  // Hal-hazırda sadələşdirilmiş versiya qaytarırıq
  return true;
}

async function checkSchoolInSector(schoolId: string | undefined | null, sectorId: string | undefined | null): Promise<boolean> {
  if (!schoolId || !sectorId) return false;
  
  // TODO: Bu funksiya məktəbin sektor daxilində olub-olmadığını yoxlamalıdır
  // Hal-hazırda sadələşdirilmiş versiya qaytarırıq
  return true;
}
