import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/supabase';

/**
 * İstifadəçinin regiona girişi olub olmadığını yoxlayır.
 * @param userId İstifadəçi ID-si
 * @param regionId Region ID-si
 * @returns İstifadəçinin regiona girişi varsa true, əks halda false
 */
export const hasRegionAccess = async (userId: string, regionId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('region_id', regionId);

    if (error) {
      console.error("Region access yoxlanılarkən xəta:", error);
      return false;
    }

    return data !== null && data.length > 0;
  } catch (error) {
    console.error("Region access yoxlanılarkən xəta:", error);
    return false;
  }
};

/**
 * İstifadəçinin sektora girişi olub olmadığını yoxlayır.
 * @param userId İstifadəçi ID-si
 * @param sectorId Sektor ID-si
 * @returns İstifadəçinin sektora girişi varsa true, əks halda false
 */
export const hasSectorAccess = async (userId: string, sectorId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('sector_id', sectorId);
  
      if (error) {
        console.error("Sektor access yoxlanılarkən xəta:", error);
        return false;
      }
  
      return data !== null && data.length > 0;
    } catch (error) {
      console.error("Sektor access yoxlanılarkən xəta:", error);
      return false;
    }
  };

/**
 * İstifadəçinin rolunu əldə edir.
 * @param userId İstifadəçi ID-si
 * @returns İstifadəçi rolu və ya null
 */
export const getUserRole = async (userId: string): Promise<UserRole | null> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error("İstifadəçi rolu əldə edilərkən xəta:", error);
      return null;
    }

    return data ? (data.role as UserRole) : null;
  } catch (error) {
    console.error("İstifadəçi rolu əldə edilərkən xəta:", error);
    return null;
  }
};
