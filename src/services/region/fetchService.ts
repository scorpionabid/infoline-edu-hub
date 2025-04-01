
import { supabase } from '@/integrations/supabase/client';
import { Region } from '@/types/region';
import { fetchRegionAdminEmails } from './adminUtils';

/**
 * Regionları yükləmək üçün servis funksiyası
 * @returns Regionlar siyahısı
 */
export const fetchRegions = async (): Promise<Region[]> => {
  try {
    console.log('Regionlar sorğusu göndərilir...');
    
    // 1. Regionları əldə et
    const { data: regions, error: regionsError } = await supabase
      .from('regions')
      .select('*')
      .order('name');
      
    if (regionsError) {
      console.error('Regions sorğusunda xəta:', regionsError);
      return []; 
    }
    
    if (!regions || regions.length === 0) {
      console.log('Heç bir region tapılmadı');
      return [];
    }
    
    console.log(`${regions.length} region tapıldı, admin emailləri əldə edilir...`);
    
    // Admin emailləri əldə et
    const adminEmails = await fetchRegionAdminEmails(regions);
    
    // Regionları admin emailləri ilə birlikdə qaytaraq
    const formattedRegions = regions.map(region => {
      const adminEmail = adminEmails.get(region.id) || null;
      console.log(`Region ${region.name} üçün admin email: ${adminEmail || 'Yoxdur'}`);
      
      return {
        ...region,
        adminEmail
      };
    });
    
    return formattedRegions as Region[];
  } catch (error) {
    console.error('Regionları əldə edərkən xəta:', error);
    return [];
  }
};
