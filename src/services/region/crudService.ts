
import { supabase } from '@/integrations/supabase/client';
import { CreateRegionParams, RegionOperationResult } from './types';
import { Region } from '@/types/region';

/**
 * Yeni region yaratmaq üçün edge function istifadə edərək servis funksiyası
 * @param regionData Yeni region məlumatları
 * @returns Edge function əməliyyatının nəticəsi
 */
export const createRegion = async (regionData: CreateRegionParams): Promise<RegionOperationResult> => {
  try {
    console.log('Edge function ilə region yaradılır:', regionData);
    
    // Edge function çağırırıq
    const { data, error } = await supabase.functions
      .invoke('region-operations', {
        body: { 
          action: 'create',
          name: regionData.name,
          description: regionData.description,
          status: regionData.status,
          adminEmail: regionData.adminEmail,
          adminName: regionData.adminName,
          adminPassword: regionData.adminPassword
        }
      });
    
    if (error) {
      console.error('Region yaratma sorğusu xətası:', error);
      return { 
        success: false, 
        error: error.message || 'Region yaratma xətası' 
      };
    }
    
    console.log('Region yaratma nəticəsi:', data);
    return { success: true, data };
  } catch (error: any) {
    console.error('Region yaratma xətası:', error);
    return { 
      success: false, 
      error: error.message || 'Region yaratma xətası'
    };
  }
};

/**
 * Region əlavə etmək üçün servis funksiyası
 * @param regionData Region məlumatları
 * @returns Yaradılmış region
 */
export const addRegion = async (regionData: CreateRegionParams): Promise<Region> => {
  try {
    console.log('Region əlavə edilir:', regionData);
    
    // Edge function vasitəsilə regionu və admini yaradaq
    const { data, error } = await supabase.functions
      .invoke('region-operations', {
        body: { 
          action: 'create',
          name: regionData.name,
          description: regionData.description,
          status: regionData.status,
          adminEmail: regionData.adminEmail,
          adminName: regionData.adminName,
          adminPassword: regionData.adminPassword
        }
      });
    
    if (error) {
      console.error('Region yaratma sorğusu xətası:', error);
      throw error;
    }
    
    console.log('Region yaratma nəticəsi:', data);
    
    // Edge function-dan qaytarılan məlumatları formalaşdır
    if (data && data.success) {
      const region = data.data?.region;
      const admin = data.data?.admin;
      
      if (!region) {
        throw new Error('Region məlumatları qaytarılmadı');
      }
      
      return {
        ...region,
        adminEmail: admin?.email || null
      };
    } else {
      // Xəta halında boş obyekt qaytar
      throw new Error('Region yaradıldı, amma məlumatlar qaytarılmadı');
    }
  } catch (error: any) {
    console.error('Region əlavə etmə xətası:', error);
    throw error;
  }
};

/**
 * Region silmək üçün servis funksiyası
 * @param regionId Region ID
 * @returns Əməliyyatın nəticəsi
 */
export const deleteRegion = async (regionId: string): Promise<RegionOperationResult> => {
  try {
    console.log('Region silmə əməliyyatı başlanır:', regionId);
    
    // Edge function vasitəsilə regionu silək
    const { data, error } = await supabase.functions
      .invoke('region-operations', {
        body: { 
          action: 'delete',
          regionId
        }
      });
    
    if (error) {
      console.error('Region silmə sorğusu xətası:', error);
      return {
        success: false,
        error: error.message || 'Region silmə xətası'
      };
    }
    
    console.log('Region silmə nəticəsi:', data);
    return { success: true, data };
  } catch (error: any) {
    console.error('Region silmə xətası:', error);
    return {
      success: false,
      error: error.message || 'Region silmə xətası'
    };
  }
};
