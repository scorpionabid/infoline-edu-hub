import { supabase } from '@/integrations/supabase/client';
import { Region } from '@/types/region';

interface CreateRegionParams {
  name: string;
  description?: string;
  status?: string;
  adminEmail?: string;
  adminName?: string;
  adminPassword?: string;
}

// Regionları yükləmək üçün funksiya
export const fetchRegions = async (): Promise<Region[]> => {
  try {
    console.log('Regionlar sorğusu göndərilir...');
    
    // Daha müfəssəl sorğu
    const { data, error } = await supabase
      .from('regions')
      .select('*')  // Bütün sahələri seçirik
      .order('name');

    if (error) {
      console.error('Regions sorğusunda xəta:', error);
      throw error;
    }
    
    if (!data) {
      console.warn('Regions sorğusu boş data qaytardı');
      return [];
    }
    
    console.log(`${data.length} region uğurla yükləndi`);
    
    // Məlumatları formatlaşdırırıq və undefined olmamasını təmin edirik
    const formattedData = data.map(region => ({
      ...region,
      id: region.id || '',
      name: region.name || '',
      description: region.description || '',
      status: region.status || 'inactive',
      created_at: region.created_at || new Date().toISOString(),
      updated_at: region.updated_at || new Date().toISOString()
    }));
    
    return formattedData as Region[];
  } catch (error) {
    console.error('Regionları yükləmə xətası:', error);
    return []; // Xəta zamanı boş array qaytarırıq
  }
};

// Regionu Supabase edge function istifadə edərək yaratmaq
export const createRegion = async (regionData: CreateRegionParams): Promise<any> => {
  try {
    console.log('Region data being sent to API:', regionData);
    
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
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Region yaratma xətası:', error);
    throw error;
  }
};

// Regionu birbaşa verilənlər bazasına əlavə etmək (adi halda)
export const addRegion = async (regionData: CreateRegionParams): Promise<Region> => {
  try {
    if (regionData.adminEmail && regionData.adminName) {
      // Əgər admin məlumatları varsa, edge function istifadə edirik
      const result = await createRegion(regionData);
      
      if (!result || !result.success) {
        throw new Error(result?.error || 'Region yaradılması xətası');
      }
      
      // Created_at sahəsinin undefined olmamasını təmin edirik
      if (result.data.region && !result.data.region.created_at) {
        result.data.region.created_at = new Date().toISOString();
      }
      
      return result.data.region;
    } else {
      // Sadə region yaratma - admin olmadan
      const region = {
        name: regionData.name,
        description: regionData.description,
        status: regionData.status || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('regions')
        .insert([region])
        .select('*')
        .single();

      if (error) throw error;
      
      // Null check əlavə edirik
      if (!data) {
        throw new Error('Region yaradıldı, lakin qaytarılan data undefined idi');
      }
      
      // Created_at sahəsinin undefined olmamasını təmin edirik
      if (!data.created_at) {
        data.created_at = new Date().toISOString();
      }
      
      return data as Region;
    }
  } catch (error) {
    console.error('Region əlavə etmə xətası:', error);
    throw error;
  }
};

// Regionu silmək
export const deleteRegion = async (regionId: string): Promise<any> => {
  try {
    // Regionla bağlı məktəb və sektorları yoxlayaq
    const { count: sectorsCount, error: sectorsError } = await supabase
      .from('sectors')
      .select('*', { count: 'exact', head: true })
      .eq('region_id', regionId);
      
    if (sectorsError) throw sectorsError;
      
    // Regionu silin
    const { error } = await supabase
      .from('regions')
      .delete()
      .eq('id', regionId);
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Region silmə xətası:', error);
    throw error;
  }
};

// Regionla bağlı statistikaları əldə etmək (məktəblər, sektorlar, istifadəçilər)
export const getRegionStats = async (regionId: string): Promise<any> => {
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