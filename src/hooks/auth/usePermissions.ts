
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth';
import { UserRole } from '@/types/user';
import { supabase } from '@/integrations/supabase/client';
import { PermissionLevel, UsePermissionsResult } from './permissionTypes';

export const usePermissions = (): UsePermissionsResult => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  
  const userRole = user?.role as UserRole;
  const isSuperAdmin = userRole === 'superadmin';
  const isRegionAdmin = userRole === 'regionadmin';
  const isSectorAdmin = userRole === 'sectoradmin';
  const isSchoolAdmin = userRole === 'schooladmin';
  
  // Bəzi icazə əlavə flagları
  const canManageCategories = isSuperAdmin || isRegionAdmin;
  const canManageSchools = isSuperAdmin || isRegionAdmin || isSectorAdmin;
  const canManageUsers = isSuperAdmin || isRegionAdmin || isSectorAdmin;
  const canManageRegions = isSuperAdmin;
  const canManageSectors = isSuperAdmin || isRegionAdmin;
  const canViewSectorCategories = isSuperAdmin || isRegionAdmin || isSectorAdmin;
  const canApproveData = isSuperAdmin || isRegionAdmin || isSectorAdmin;
  
  // İstifadəçinin rollarını yükləmək
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    const fetchUserRoles = async () => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        setUserRoles(data || []);
      } catch (error) {
        console.error('Error fetching user roles:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserRoles();
  }, [user]);
  
  // Region əlçatanlığını yoxlamaq
  const checkRegionAccess = useCallback(async (regionId: string, level: PermissionLevel = 'read'): Promise<boolean> => {
    if (!user) return false;
    if (isSuperAdmin) return true;
    
    if (isRegionAdmin && user.region_id === regionId) {
      return level === 'admin' ? false : true;
    }
    
    return false;
  }, [user, isSuperAdmin, isRegionAdmin]);
  
  // Sektor əlçatanlığını yoxlamaq
  const checkSectorAccess = useCallback(async (sectorId: string, level: PermissionLevel = 'read'): Promise<boolean> => {
    if (!user) return false;
    if (isSuperAdmin) return true;
    
    if (isRegionAdmin) {
      try {
        const { data, error } = await supabase
          .from('sectors')
          .select('region_id')
          .eq('id', sectorId)
          .single();
          
        if (error) throw error;
        
        return data.region_id === user.region_id;
      } catch (error) {
        console.error('Error checking sector access:', error);
        return false;
      }
    }
    
    if (isSectorAdmin && user.sector_id === sectorId) {
      return level === 'admin' ? false : true;
    }
    
    return false;
  }, [user, isSuperAdmin, isRegionAdmin, isSectorAdmin]);
  
  // Məktəb əlçatanlığını yoxlamaq
  const checkSchoolAccess = useCallback(async (schoolId: string, level: PermissionLevel = 'read'): Promise<boolean> => {
    if (!user) return false;
    if (isSuperAdmin) return true;
    
    if (isRegionAdmin || isSectorAdmin) {
      try {
        const { data, error } = await supabase
          .from('schools')
          .select('region_id, sector_id')
          .eq('id', schoolId)
          .single();
          
        if (error) throw error;
        
        if (isRegionAdmin && data.region_id === user.region_id) return true;
        if (isSectorAdmin && data.sector_id === user.sector_id) return true;
      } catch (error) {
        console.error('Error checking school access:', error);
        return false;
      }
    }
    
    if (isSchoolAdmin && user.school_id === schoolId) {
      return level === 'admin' ? false : true;
    }
    
    return false;
  }, [user, isSuperAdmin, isRegionAdmin, isSectorAdmin, isSchoolAdmin]);
  
  // Kateqoriya əlçatanlığını yoxlamaq
  const checkCategoryAccess = useCallback(async (categoryId: string, level: PermissionLevel = 'read'): Promise<boolean> => {
    if (!user) return false;
    if (isSuperAdmin) return true;
    if (isRegionAdmin) return true;
    
    // TODO: Sektorlar və məktəblər üçün kateqoriyaya əlçatanlığı yoxlamaq
    return false;
  }, [user, isSuperAdmin, isRegionAdmin]);
  
  // Sütun əlçatanlığını yoxlamaq
  const checkColumnAccess = useCallback(async (columnId: string, level: PermissionLevel = 'read'): Promise<boolean> => {
    if (!user) return false;
    if (isSuperAdmin) return true;
    if (isRegionAdmin) return true;
    
    // TODO: Sektorlar və məktəblər üçün sütuna əlçatanlığı yoxlamaq
    return false;
  }, [user, isSuperAdmin, isRegionAdmin]);
  
  return {
    userRole,
    userId: user?.id,
    regionId: user?.region_id,
    sectorId: user?.sector_id,
    schoolId: user?.school_id,
    isSuperAdmin,
    isRegionAdmin,
    isSectorAdmin,
    isSchoolAdmin,
    checkRegionAccess,
    checkSectorAccess,
    checkSchoolAccess,
    checkCategoryAccess,
    checkColumnAccess,
    canManageCategories,
    canManageSchools,
    canManageUsers,
    canManageRegions,
    canManageSectors,
    canViewSectorCategories,
    canApproveData,
  };
};
