
import { useAuth } from '@/context/auth';
import { supabase } from '@/integrations/supabase/client';

export type PermissionLevel = 'read' | 'write' | 'full';

/**
 * İstifadəçinin müəyyən entity-yə icazəsinin olub-olmadığını yoxlayır
 */
export const usePermissions = () => {
  const { user, isAuthenticated } = useAuth();

  const checkRegionAccess = async (regionId: string, level: PermissionLevel = 'read'): Promise<boolean> => {
    if (!isAuthenticated || !user) return false;
    
    try {
      // RPC funksiyasını birbaşa sorğu ilə əvəz edirik
      const { data, error } = await supabase
        .from('user_roles')
        .select('role, region_id')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      
      if (level === 'read') {
        return data?.role === 'superadmin' || (data?.role === 'regionadmin' && data?.region_id === regionId);
      }
      
      // Yazma və tam icazə üçün superadmin və ya regionadmin olmalıdır
      if (user.role === 'superadmin') return true;
      if (user.role === 'regionadmin' && user.regionId === regionId) return true;
      
      return false;
    } catch (error) {
      console.error('Region icazəsi yoxlanarkən xəta:', error);
      return false;
    }
  };

  const checkSectorAccess = async (sectorId: string, level: PermissionLevel = 'read'): Promise<boolean> => {
    if (!isAuthenticated || !user) return false;
    
    try {
      // RPC funksiyasını birbaşa sorğu ilə əvəz edirik
      const { data: userRoleData, error: userRoleError } = await supabase
        .from('user_roles')
        .select('role, region_id, sector_id')
        .eq('user_id', user.id)
        .single();
      
      if (userRoleError) throw userRoleError;
      
      if (level === 'read') {
        if (userRoleData?.role === 'superadmin') return true;
        if (userRoleData?.role === 'regionadmin') {
          const { data: sectorData, error: sectorError } = await supabase
            .from('sectors')
            .select('region_id')
            .eq('id', sectorId)
            .single();
          
          if (sectorError) throw sectorError;
          return sectorData?.region_id === userRoleData?.region_id;
        }
        if (userRoleData?.role === 'sectoradmin' && userRoleData?.sector_id === sectorId) return true;
      }
      
      // Yazma və tam icazə üçün superadmin, regionadmin və ya sectoradmin olmalıdır
      if (user.role === 'superadmin') return true;
      if (user.role === 'regionadmin' && user.regionId) {
        // RegionAdmin öz regionuna aid sektorlarda dəyişiklik edə bilər
        const { data: sectorData } = await supabase
          .from('sectors')
          .select('region_id')
          .eq('id', sectorId)
          .single();
        
        return sectorData?.region_id === user.regionId;
      }
      if (user.role === 'sectoradmin' && user.sectorId === sectorId) return true;
      
      return false;
    } catch (error) {
      console.error('Sektor icazəsi yoxlanarkən xəta:', error);
      return false;
    }
  };

  const checkSchoolAccess = async (schoolId: string, level: PermissionLevel = 'read'): Promise<boolean> => {
    if (!isAuthenticated || !user) return false;
    
    try {
      // RPC funksiyasını birbaşa sorğu ilə əvəz edirik
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .select('region_id, sector_id')
        .eq('id', schoolId)
        .single();
      
      if (schoolError) throw schoolError;
      
      const { data: userRoleData, error: userRoleError } = await supabase
        .from('user_roles')
        .select('role, region_id, sector_id, school_id')
        .eq('user_id', user.id)
        .single();
        
      if (userRoleError) throw userRoleError;
      
      if (level === 'read') {
        // SuperAdmin bütün məktəblərə icazəlidir
        if (userRoleData?.role === 'superadmin') return true;
        
        // RegionAdmin öz regionundakı məktəblərə icazəlidir
        if (userRoleData?.role === 'regionadmin' && userRoleData?.region_id === schoolData?.region_id) return true;
        
        // SectorAdmin öz sektorundakı məktəblərə icazəlidir
        if (userRoleData?.role === 'sectoradmin' && userRoleData?.sector_id === schoolData?.sector_id) return true;
        
        // SchoolAdmin yalnız öz məktəbinə icazəlidir
        if (userRoleData?.role === 'schooladmin' && userRoleData?.school_id === schoolId) return true;
        
        return false;
      }
      
      // Yazma və tam icazə üçün superadmin, regionadmin və ya sectoradmin olmalıdır
      if (user.role === 'superadmin') return true;
      
      if (user.role === 'regionadmin' && user.regionId) {
        return schoolData?.region_id === user.regionId;
      }
      
      if (user.role === 'sectoradmin' && user.sectorId) {
        return schoolData?.sector_id === user.sectorId;
      }
      
      return false;
    } catch (error) {
      console.error('Məktəb icazəsi yoxlanarkən xəta:', error);
      return false;
    }
  };

  const checkCategoryAccess = async (categoryId: string, level: PermissionLevel = 'read'): Promise<boolean> => {
    if (!isAuthenticated || !user) return false;
    
    try {
      // Kateqoriya məlumatlarını əldə edirik
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('assignment')
        .eq('id', categoryId)
        .single();
      
      if (categoryError) throw categoryError;
      
      // İstifadəçi rolunu əldə edirik
      const { data: userRoleData, error: userRoleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (userRoleError) throw userRoleError;
      
      if (level === 'read') {
        // SuperAdmin bütün kateqoriyalara icazəlidir
        if (userRoleData?.role === 'superadmin') return true;
        
        // "all" assignment-li kateqoriyalar hər kəsə açıqdır
        if (categoryData?.assignment === 'all') return true;
        
        // "sectors" assignment-li kateqoriyalar sectoradmin, regionadmin və schooladmin üçün açıqdır
        if (categoryData?.assignment === 'sectors' && 
            ['regionadmin', 'sectoradmin', 'schooladmin'].includes(userRoleData?.role)) {
          return true;
        }
        
        return false;
      }
      
      // Yazma və tam icazə üçün yalnız SuperAdmin
      return userRoleData?.role === 'superadmin';
    } catch (error) {
      console.error('Kateqoriya icazəsi yoxlanarkən xəta:', error);
      return false;
    }
  };

  const checkColumnAccess = async (columnId: string, level: PermissionLevel = 'read'): Promise<boolean> => {
    if (!isAuthenticated || !user) return false;
    
    try {
      // Sütun və kateqoriya məlumatlarını əldə edirik
      const { data: columnData, error: columnError } = await supabase
        .from('columns')
        .select('category_id')
        .eq('id', columnId)
        .single();
      
      if (columnError) throw columnError;
      
      // Kateqoriya məlumatlarını əldə edirik
      const categoryId = columnData?.category_id;
      if (!categoryId) return false;
      
      // Kateqoriyaya icazəni yoxlayırıq
      return await checkCategoryAccess(categoryId, level);
    } catch (error) {
      console.error('Sütun icazəsi yoxlanarkən xəta:', error);
      return false;
    }
  };

  return {
    checkRegionAccess,
    checkSectorAccess,
    checkSchoolAccess,
    checkCategoryAccess,
    checkColumnAccess,
    userRole: user?.role,
    userId: user?.id,
    regionId: user?.regionId,
    sectorId: user?.sectorId,
    schoolId: user?.schoolId
  };
};
