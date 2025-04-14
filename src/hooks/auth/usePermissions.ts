
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * İstifadəçi səlahiyyətlərini idarə etmək üçün hook
 */
export const usePermissions = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | undefined>(user?.role);
  const [sectorId, setSectorId] = useState<string | undefined>(user?.sectorId);
  const [regionId, setRegionId] = useState<string | undefined>(user?.regionId);
  const [canRegionAdminManageCategoriesColumns, setCanRegionAdminManageCategoriesColumns] = useState<boolean>(false);

  // İstifadəçi dəyişdikdə rolunu yenilə
  useEffect(() => {
    setUserRole(user?.role);
    setSectorId(user?.sectorId);
    setRegionId(user?.regionId);
    
    // SuperAdmin və RegionAdmin-lər kategoriya/sütunları idarə edə bilər
    setCanRegionAdminManageCategoriesColumns(
      user?.role === 'superadmin' || user?.role === 'regionadmin'
    );
  }, [user]);

  /**
   * İstifadəçinin müəyyən rol olub olmadığını yoxlayır
   * @param role Yoxlanılacaq rol
   */
  const hasRole = useCallback(async (role: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('has_role_safe', { role_to_check: role });
      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Rol yoxlama xətası:', error);
      return false;
    }
  }, [user]);

  /**
   * İstifadəçinin region üzərində səlahiyyəti olub olmadığını yoxlayır
   * @param regionId Region ID
   */
  const hasRegionAccess = useCallback(async (regionId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('has_region_access', { region_id_param: regionId });
      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Region səlahiyyəti yoxlama xətası:', error);
      return false;
    }
  }, [user]);

  /**
   * İstifadəçinin sektor üzərində səlahiyyəti olub olmadığını yoxlayır
   * @param sectorId Sektor ID
   */
  const hasSectorAccess = useCallback(async (sectorId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('has_sector_access', { sector_id_param: sectorId });
      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Sektor səlahiyyəti yoxlama xətası:', error);
      return false;
    }
  }, [user]);

  /**
   * İstifadəçinin məktəb üzərində səlahiyyəti olub olmadığını yoxlayır
   * @param schoolId Məktəb ID
   */
  const hasSchoolAccess = useCallback(async (schoolId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('has_school_access', { school_id_param: schoolId });
      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Məktəb səlahiyyəti yoxlama xətası:', error);
      return false;
    }
  }, [user]);

  return {
    userRole,
    sectorId,
    regionId,
    canRegionAdminManageCategoriesColumns,
    hasRole,
    hasRegionAccess,
    hasSectorAccess,
    hasSchoolAccess
  };
};
