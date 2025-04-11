
import { supabase } from '@/integrations/supabase/client';
import { PermissionLevel, PermissionCheckResult } from './permissionTypes';
import { executeQuery } from './permissionUtils';
import { UserRoleData } from '@/types/supabase';

/**
 * İstifadəçinin müəyyən regiona icazəsinin olub-olmadığını yoxlayır
 */
export const checkRegionAccess = async (
  userId: string | undefined,
  userRole: string | undefined,
  userRegionId: string | undefined,
  regionId: string,
  level: PermissionLevel = 'read'
): PermissionCheckResult => {
  if (!userId) return false;
  
  try {
    // Sorğunu düzgün şəkildə yaradıb executeQuery-ə ötürmək
    const userData = await executeQuery<UserRoleData>(
      supabase
        .from('user_roles')
        .select('role, region_id')
        .eq('user_id', userId)
        .single(),
      'Region icazəsi yoxlanarkən xəta:'
    );
    
    if (!userData) return false;
    
    if (level === 'read') {
      return userData.role === 'superadmin' || (userData.role === 'regionadmin' && userData.region_id === regionId);
    }
    
    // Yazma və tam icazə üçün superadmin və ya regionadmin olmalıdır
    if (userRole === 'superadmin') return true;
    if (userRole === 'regionadmin' && userRegionId === regionId) return true;
    
    return false;
  } catch (error) {
    console.error('Region icazəsi yoxlanarkən xəta:', error);
    return false;
  }
};

/**
 * İstifadəçinin müəyyən sektora icazəsinin olub-olmadığını yoxlayır
 */
export const checkSectorAccess = async (
  userId: string | undefined,
  userRole: string | undefined,
  userRegionId: string | undefined,
  userSectorId: string | undefined,
  sectorId: string,
  level: PermissionLevel = 'read'
): PermissionCheckResult => {
  if (!userId) return false;
  
  try {
    // Sorğunu düzgün şəkildə yaradıb executeQuery-ə ötürürük
    const userRoleData = await executeQuery<UserRoleData>(
      supabase
        .from('user_roles')
        .select('role, region_id, sector_id')
        .eq('user_id', userId)
        .single(),
      'Sektor icazəsi yoxlanarkən xəta:'
    );
    
    if (!userRoleData) return false;
    
    if (level === 'read') {
      if (userRoleData.role === 'superadmin') return true;
      if (userRoleData.role === 'regionadmin') {
        const sectorData = await executeQuery<{ region_id: string }>(
          supabase
            .from('sectors')
            .select('region_id')
            .eq('id', sectorId)
            .single(),
          'Sektor məlumatı alınarkən xəta:'
        );
        
        if (!sectorData) return false;
        return sectorData.region_id === userRoleData.region_id;
      }
      if (userRoleData.role === 'sectoradmin' && userRoleData.sector_id === sectorId) return true;
    }
    
    // Yazma və tam icazə üçün superadmin, regionadmin və ya sectoradmin olmalıdır
    if (userRole === 'superadmin') return true;
    if (userRole === 'regionadmin' && userRegionId) {
      // RegionAdmin öz regionuna aid sektorlarda dəyişiklik edə bilər
      const sectorData = await executeQuery<{ region_id: string }>(
        supabase
          .from('sectors')
          .select('region_id')
          .eq('id', sectorId)
          .single(),
        'Sektor məlumatı alınarkən xəta:'
      );
      
      if (!sectorData) return false;
      return sectorData.region_id === userRegionId;
    }
    if (userRole === 'sectoradmin' && userSectorId === sectorId) return true;
    
    return false;
  } catch (error) {
    console.error('Sektor icazəsi yoxlanarkən xəta:', error);
    return false;
  }
};

/**
 * İstifadəçinin müəyyən məktəbə icazəsinin olub-olmadığını yoxlayır
 */
export const checkSchoolAccess = async (
  userId: string | undefined,
  userRole: string | undefined,
  userRegionId: string | undefined,
  userSectorId: string | undefined,
  schoolId: string,
  level: PermissionLevel = 'read'
): PermissionCheckResult => {
  if (!userId) return false;
  
  try {
    // Məktəb məlumatlarını əldə edirik
    const schoolData = await executeQuery<{ region_id: string; sector_id: string }>(
      supabase
        .from('schools')
        .select('region_id, sector_id')
        .eq('id', schoolId)
        .single(),
      'Məktəb məlumatı alınarkən xəta:'
    );
    
    if (!schoolData) return false;
    
    // İstifadəçi rollarını əldə edirik
    const userRoleData = await executeQuery<UserRoleData>(
      supabase
        .from('user_roles')
        .select('role, region_id, sector_id, school_id')
        .eq('user_id', userId)
        .single(),
      'İstifadəçi rolu alınarkən xəta:'
    );
    
    if (!userRoleData) return false;
    
    if (level === 'read') {
      // SuperAdmin bütün məktəblərə icazəlidir
      if (userRoleData.role === 'superadmin') return true;
      
      // RegionAdmin öz regionundakı məktəblərə icazəlidir
      if (userRoleData.role === 'regionadmin' && userRoleData.region_id === schoolData.region_id) return true;
      
      // SectorAdmin öz sektorundakı məktəblərə icazəlidir
      if (userRoleData.role === 'sectoradmin' && userRoleData.sector_id === schoolData.sector_id) return true;
      
      // SchoolAdmin yalnız öz məktəbinə icazəlidir
      if (userRoleData.role === 'schooladmin' && userRoleData.school_id === schoolId) return true;
      
      return false;
    }
    
    // Yazma və tam icazə üçün superadmin, regionadmin və ya sectoradmin olmalıdır
    if (userRole === 'superadmin') return true;
    
    if (userRole === 'regionadmin' && userRegionId) {
      return schoolData.region_id === userRegionId;
    }
    
    if (userRole === 'sectoradmin' && userSectorId) {
      return schoolData.sector_id === userSectorId;
    }
    
    return false;
  } catch (error) {
    console.error('Məktəb icazəsi yoxlanarkən xəta:', error);
    return false;
  }
};

/**
 * İstifadəçinin müəyyən kateqoriyaya icazəsinin olub-olmadığını yoxlayır
 */
export const checkCategoryAccess = async (
  userId: string | undefined,
  categoryId: string,
  level: PermissionLevel = 'read'
): PermissionCheckResult => {
  if (!userId) return false;
  
  try {
    // Kateqoriya məlumatlarını əldə edirik
    const categoryData = await executeQuery<{ assignment: string }>(
      supabase
        .from('categories')
        .select('assignment')
        .eq('id', categoryId)
        .single(),
      'Kateqoriya məlumatı alınarkən xəta:'
    );
    
    if (!categoryData) return false;
    
    // İstifadəçi rolunu əldə edirik
    const userRoleData = await executeQuery<{ role: string }>(
      supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single(),
      'İstifadəçi rolu alınarkən xəta:'
    );
    
    if (!userRoleData) return false;
    
    if (level === 'read') {
      // SuperAdmin bütün kateqoriyalara icazəlidir
      if (userRoleData.role === 'superadmin') return true;
      
      // "all" assignment-li kateqoriyalar hər kəsə açıqdır
      if (categoryData.assignment === 'all') return true;
      
      // "sectors" assignment-li kateqoriyalar sectoradmin, regionadmin və schooladmin üçün açıqdır
      if (categoryData.assignment === 'sectors' && 
          ['regionadmin', 'sectoradmin', 'schooladmin'].includes(userRoleData.role)) {
        return true;
      }
      
      return false;
    }
    
    // Yazma icazəsi üçün superadmin və regionadmin
    if (level === 'write') {
      return ['superadmin', 'regionadmin'].includes(userRoleData.role);
    }
    
    // Tam icazə üçün yalnız SuperAdmin
    return userRoleData.role === 'superadmin';
  } catch (error) {
    console.error('Kateqoriya icazəsi yoxlanarkən xəta:', error);
    return false;
  }
};

/**
 * İstifadəçinin müəyyən sütuna icazəsinin olub-olmadığını yoxlayır
 */
export const checkColumnAccess = async (
  userId: string | undefined,
  columnId: string,
  level: PermissionLevel = 'read'
): PermissionCheckResult => {
  if (!userId) return false;
  
  try {
    // Sütun və kateqoriya məlumatlarını əldə edirik
    const columnData = await executeQuery<{ category_id: string }>(
      supabase
        .from('columns')
        .select('category_id')
        .eq('id', columnId)
        .single(),
      'Sütun məlumatı alınarkən xəta:'
    );
    
    if (!columnData) return false;
    
    // Kateqoriya məlumatlarını əldə edirik
    const categoryId = columnData.category_id;
    if (!categoryId) return false;
    
    // Kateqoriyaya icazəni yoxlayırıq
    return checkCategoryAccess(userId, categoryId, level);
  } catch (error) {
    console.error('Sütun icazəsi yoxlanarkən xəta:', error);
    return false;
  }
};
