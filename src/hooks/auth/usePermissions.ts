
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
      const { data, error } = await supabase.rpc('has_region_access', { region_id_param: regionId });
      if (error) throw error;
      
      if (level === 'read') return !!data;
      
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
      const { data, error } = await supabase.rpc('has_sector_access', { sector_id_param: sectorId });
      if (error) throw error;
      
      if (level === 'read') return !!data;
      
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
      const { data, error } = await supabase.rpc('has_school_access', { school_id_param: schoolId });
      if (error) throw error;
      
      if (level === 'read') return !!data;
      
      // Yazma və tam icazə üçün superadmin, regionadmin və ya sectoradmin olmalıdır
      if (user.role === 'superadmin') return true;
      
      if (user.role === 'regionadmin' && user.regionId) {
        // RegionAdmin öz regionuna aid məktəblərdə dəyişiklik edə bilər
        const { data: schoolData } = await supabase
          .from('schools')
          .select('region_id')
          .eq('id', schoolId)
          .single();
        
        return schoolData?.region_id === user.regionId;
      }
      
      if (user.role === 'sectoradmin' && user.sectorId) {
        // SectorAdmin öz sektoruna aid məktəblərdə dəyişiklik edə bilər
        const { data: schoolData } = await supabase
          .from('schools')
          .select('sector_id')
          .eq('id', schoolId)
          .single();
        
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
      const { data, error } = await supabase.rpc('has_category_access', { category_id_param: categoryId });
      if (error) throw error;
      
      if (level === 'read') return !!data;
      
      // Yazma və tam icazə üçün yalnız SuperAdmin
      return user.role === 'superadmin';
    } catch (error) {
      console.error('Kateqoriya icazəsi yoxlanarkən xəta:', error);
      return false;
    }
  };

  const checkColumnAccess = async (columnId: string, level: PermissionLevel = 'read'): Promise<boolean> => {
    if (!isAuthenticated || !user) return false;
    
    try {
      const { data, error } = await supabase.rpc('has_column_access', { column_id_param: columnId });
      if (error) throw error;
      
      if (level === 'read') return !!data;
      
      // Yazma və tam icazə üçün yalnız SuperAdmin
      return user.role === 'superadmin';
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
