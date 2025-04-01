
import { supabase } from '@/integrations/supabase/client';
import { RegionStats } from './types';

/**
 * Region statistikalarını əldə etmək üçün servis funksiyası
 * @param regionId Region ID
 * @returns Region statistikaları
 */
export const getRegionStats = async (regionId: string): Promise<RegionStats> => {
  try {
    // Region ilə bağlı sektorların sayı
    const { count: sectorCount, error: sectorsError } = await supabase
      .from('sectors')
      .select('*', { count: 'exact', head: true })
      .eq('region_id', regionId);
      
    if (sectorsError) {
      console.error('Sektor statistikaları əldə edilərkən xəta:', sectorsError);
      return {
        sectorCount: 0,
        schoolCount: 0,
        adminCount: 0
      };
    }
    
    // Region ilə bağlı məktəblərin sayı
    const { count: schoolCount, error: schoolsError } = await supabase
      .from('schools')
      .select('*', { count: 'exact', head: true })
      .eq('region_id', regionId);
      
    if (schoolsError) {
      console.error('Məktəb statistikaları əldə edilərkən xəta:', schoolsError);
      return {
        sectorCount: sectorCount || 0,
        schoolCount: 0,
        adminCount: 0
      };
    }
    
    // Region ilə bağlı adminlərin sayı
    const { count: adminCount, error: adminsError } = await supabase
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .eq('region_id', regionId)
      .eq('role', 'regionadmin');
      
    if (adminsError) {
      console.error('Admin statistikaları əldə edilərkən xəta:', adminsError);
      return {
        sectorCount: sectorCount || 0,
        schoolCount: schoolCount || 0,
        adminCount: 0
      };
    }
    
    return {
      sectorCount: sectorCount || 0,
      schoolCount: schoolCount || 0,
      adminCount: adminCount || 0
    };
  } catch (error) {
    console.error('Region statistikalarını əldə etmə xətası:', error);
    // Xəta halında default dəyərlər qaytaraq
    return {
      sectorCount: 0,
      schoolCount: 0,
      adminCount: 0
    };
  }
};
