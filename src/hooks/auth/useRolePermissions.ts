/**
 * Vahid rol və icazə sistemi
 * useRole və usePermissions funksionallığını birləşdirir
 */

import { useCallback, useMemo } from 'react';
import { useAuthStore } from './useAuthStore';
import { UserRole } from '@/types/supabase';
import { normalizeRole, normalizeRoleArray } from '@/services/userDataService';

/**
 * İstifadəçi rolu və icazələri ilə bağlı yardımçı funksiyaları təmin edən hook
 */
export function useRolePermissions() {
  const { user } = useAuthStore();
  
  // İstifadəçinin müəyyən rola sahib olub-olmadığını yoxlayır
  const hasRole = useCallback(
    (role: UserRole | UserRole[]) => {
      if (!user || !user.role) return false;
      
      const normalizedUserRole = normalizeRole(user.role);
      
      if (Array.isArray(role)) {
        const normalizedRoles = normalizeRoleArray(role);
        return normalizedRoles.includes(normalizedUserRole);
      }
      
      return normalizedUserRole === normalizeRole(role);
    },
    [user]
  );
  
  // Rol-əsaslı icazə yoxlamaları
  const isSuperAdmin = useMemo(() => hasRole('superadmin'), [hasRole]);
  const isRegionAdmin = useMemo(() => hasRole('regionadmin'), [hasRole]);
  const isSectorAdmin = useMemo(() => hasRole('sectoradmin'), [hasRole]);
  const isSchoolAdmin = useMemo(() => hasRole('schooladmin'), [hasRole]);
  
  // Funksional icazə yoxlamaları
  const canManageUsers = useMemo(
    () => hasRole(['superadmin', 'regionadmin', 'sectoradmin']),
    [hasRole]
  );
  
  const canViewAnalytics = useMemo(
    () => hasRole(['superadmin', 'regionadmin', 'sectoradmin']),
    [hasRole]
  );
  
  const canApproveData = useMemo(
    () => hasRole(['superadmin', 'regionadmin', 'sectoradmin']),
    [hasRole]
  );
  
  const canManageRegions = useMemo(() => hasRole('superadmin'), [hasRole]);
  
  const canManageSectors = useMemo(
    () => hasRole(['superadmin', 'regionadmin']),
    [hasRole]
  );
  
  const canManageSchools = useMemo(
    () => hasRole(['superadmin', 'regionadmin', 'sectoradmin']),
    [hasRole]
  );
  
  const canManageCategories = useMemo(
    () => hasRole(['superadmin', 'regionadmin']),
    [hasRole]
  );
  
  // Məlumat giriş icazələri
  const canEnterData = useMemo(
    () => hasRole(['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin']),
    [hasRole]
  );
  
  // Region-əsaslı icazə yoxlamaları
  const hasAccessToRegion = useCallback(
    (regionId: string | null) => {
      if (!user || !regionId) return false;
      
      // SuperAdmin bütün regionlara giriş əldə edir
      if (isSuperAdmin) return true;
      
      // RegionAdmin yalnız öz regionuna giriş əldə edir
      if (isRegionAdmin) {
        return user.region_id === regionId;
      }
      
      // SectorAdmin və SchoolAdmin üçün əlaqəli regionları yoxlayırıq
      if (isSectorAdmin || isSchoolAdmin) {
        // Bu məlumatları əldə etmək üçün əlavə sorğu lazım ola bilər
        // Sadəlik üçün, sektorun/məktəbin aid olduğu regionu user obyektindən götürürük
        return user.region_id === regionId;
      }
      
      return false;
    },
    [user, isSuperAdmin, isRegionAdmin, isSectorAdmin, isSchoolAdmin]
  );
  
  // Sektor-əsaslı icazə yoxlamaları
  const hasAccessToSector = useCallback(
    (sectorId: string | null) => {
      if (!user || !sectorId) return false;
      
      // SuperAdmin bütün sektorlara giriş əldə edir
      if (isSuperAdmin) return true;
      
      // RegionAdmin öz regionundakı bütün sektorlara giriş əldə edir
      // Bu yoxlama üçün əlavə sorğu lazım ola bilər, amma sadəlik üçün
      // sektorun aid olduğu regionu yoxlamırıq
      if (isRegionAdmin) return true;
      
      // SectorAdmin yalnız öz sektoruna giriş əldə edir
      if (isSectorAdmin) {
        return user.sector_id === sectorId;
      }
      
      // SchoolAdmin üçün əlaqəli sektoru yoxlayırıq
      if (isSchoolAdmin) {
        return user.sector_id === sectorId;
      }
      
      return false;
    },
    [user, isSuperAdmin, isRegionAdmin, isSectorAdmin, isSchoolAdmin]
  );
  
  // Məktəb-əsaslı icazə yoxlamaları
  const hasAccessToSchool = useCallback(
    (schoolId: string | null) => {
      if (!user || !schoolId) return false;
      
      // SuperAdmin bütün məktəblərə giriş əldə edir
      if (isSuperAdmin) return true;
      
      // RegionAdmin öz regionundakı bütün məktəblərə giriş əldə edir
      // Bu yoxlama üçün əlavə sorğu lazım ola bilər
      if (isRegionAdmin) return true;
      
      // SectorAdmin öz sektorundakı bütün məktəblərə giriş əldə edir
      // Bu yoxlama üçün əlavə sorğu lazım ola bilər
      if (isSectorAdmin) return true;
      
      // SchoolAdmin yalnız öz məktəbinə giriş əldə edir
      if (isSchoolAdmin) {
        return user.school_id === schoolId;
      }
      
      return false;
    },
    [user, isSuperAdmin, isRegionAdmin, isSectorAdmin, isSchoolAdmin]
  );
  
  return {
    // Rol yoxlamaları
    hasRole,
    isSuperAdmin,
    isRegionAdmin,
    isSectorAdmin,
    isSchoolAdmin,
    currentRole: user?.role ? normalizeRole(user.role) : null,
    
    // Funksional icazələr
    canManageUsers,
    canViewAnalytics,
    canApproveData,
    canManageRegions,
    canManageSectors,
    canManageSchools,
    canManageCategories,
    canEnterData,
    
    // Məlumat giriş icazələri
    hasAccessToRegion,
    hasAccessToSector,
    hasAccessToSchool,
  };
}
