
import { useMemo } from 'react';
import { useAuth } from '@/context/auth';
import { supabase } from '@/integrations/supabase/client';
import { PermissionCheckResult, PermissionLevel, UsePermissionsResult } from './permissionTypes';
import { UserRole } from '@/types/supabase';

export const usePermissions = (): UsePermissionsResult => {
  const { user, isAuthenticated } = useAuth();

  // Əsas istifadəçi məlumatları
  const userId = useMemo(() => user?.id, [user]);
  const userRole = useMemo(() => user?.role as UserRole | undefined, [user]);
  const regionId = useMemo(() => user?.region_id, [user]);
  const sectorId = useMemo(() => user?.sector_id, [user]);
  const schoolId = useMemo(() => user?.school_id, [user]);

  // Rol yoxlamaları
  const isSuperAdmin = useMemo(() => isAuthenticated && userRole === 'superadmin', [isAuthenticated, userRole]);
  const isRegionAdmin = useMemo(() => isAuthenticated && userRole === 'regionadmin', [isAuthenticated, userRole]);
  const isSectorAdmin = useMemo(() => isAuthenticated && userRole === 'sectoradmin', [isAuthenticated, userRole]);
  const isSchoolAdmin = useMemo(() => isAuthenticated && userRole === 'schooladmin', [isAuthenticated, userRole]);

  // Region əlçatanlığı yoxlama
  const checkRegionAccess = async (targetRegionId: string, level: PermissionLevel = 'read'): Promise<boolean> => {
    if (!user) return false;
    if (isSuperAdmin) return true;
    if (isRegionAdmin && regionId === targetRegionId) return true;
    
    if (isSectorAdmin) {
      // Sektor hansı regiona aiddir yoxlayırıq
      const { data } = await supabase
        .from('sectors')
        .select('region_id')
        .eq('id', sectorId)
        .single();
        
      return data?.region_id === targetRegionId;
    }
    
    if (isSchoolAdmin && level === 'read') {
      // Məktəb hansı regiona aiddir yoxlayırıq
      const { data } = await supabase
        .from('schools')
        .select('region_id')
        .eq('id', schoolId)
        .single();
        
      return data?.region_id === targetRegionId;
    }
    
    return false;
  };
  
  // Sektor əlçatanlığı yoxlama
  const checkSectorAccess = async (targetSectorId: string, level: PermissionLevel = 'read'): Promise<boolean> => {
    if (!user) return false;
    if (isSuperAdmin) return true;
    
    if (isRegionAdmin) {
      // Sektor regionadminin regionuna aiddirmi?
      const { data } = await supabase
        .from('sectors')
        .select('region_id')
        .eq('id', targetSectorId)
        .single();
        
      return data?.region_id === regionId;
    }
    
    if (isSectorAdmin) {
      return sectorId === targetSectorId;
    }
    
    if (isSchoolAdmin && level === 'read') {
      // Məktəb bu sektora aiddirmi?
      const { data } = await supabase
        .from('schools')
        .select('sector_id')
        .eq('id', schoolId)
        .single();
        
      return data?.sector_id === targetSectorId;
    }
    
    return false;
  };
  
  // Məktəb əlçatanlığı yoxlama
  const checkSchoolAccess = async (targetSchoolId: string, level: PermissionLevel = 'read'): Promise<boolean> => {
    if (!user) return false;
    if (isSuperAdmin) return true;
    
    if (isRegionAdmin) {
      // Məktəb regionadminin regionuna aiddirmi?
      const { data } = await supabase
        .from('schools')
        .select('region_id')
        .eq('id', targetSchoolId)
        .single();
        
      return data?.region_id === regionId;
    }
    
    if (isSectorAdmin) {
      // Məktəb sektoradminin sektoruna aiddirmi?
      const { data } = await supabase
        .from('schools')
        .select('sector_id')
        .eq('id', targetSchoolId)
        .single();
        
      return data?.sector_id === sectorId;
    }
    
    if (isSchoolAdmin) {
      return schoolId === targetSchoolId;
    }
    
    return false;
  };
  
  // Kateqoriya əlçatanlığı yoxlama
  const checkCategoryAccess = async (categoryId: string, level: PermissionLevel = 'read'): Promise<boolean> => {
    if (!user) return false;
    if (isSuperAdmin) return true;
    if (isRegionAdmin) return true;
    
    const { data } = await supabase
      .from('categories')
      .select('assignment')
      .eq('id', categoryId)
      .single();
      
    if (data?.assignment === 'all') {
      return true;
    }
    
    if (data?.assignment === 'sectors') {
      return isSectorAdmin || isRegionAdmin || isSuperAdmin;
    }
    
    return false;
  };
  
  // Sütun əlçatanlığı yoxlama
  const checkColumnAccess = async (columnId: string, level: PermissionLevel = 'read'): Promise<boolean> => {
    if (!user) return false;
    
    const { data } = await supabase
      .from('columns')
      .select('category_id')
      .eq('id', columnId)
      .single();
      
    if (!data) return false;
    
    return checkCategoryAccess(data.category_id, level);
  };
  
  // Sektoradmin: Kateqoriya və sütun əlçatanlığı
  const canViewSectorCategories = useMemo(() => {
    return isSectorAdmin || isRegionAdmin || isSuperAdmin;
  }, [isSectorAdmin, isRegionAdmin, isSuperAdmin]);
  
  // RegionAdmin: Kateqoriya və sütunları idarə etmə
  const canManageCategories = useMemo(() => {
    return isRegionAdmin || isSuperAdmin;
  }, [isRegionAdmin, isSuperAdmin]);

  return {
    // Rol yoxlamaları
    isSuperAdmin,
    isRegionAdmin,
    isSectorAdmin,
    isSchoolAdmin,
    
    // Əsas məlumatlar
    userRole,
    userId,
    regionId,
    sectorId,
    schoolId,
    
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
};
