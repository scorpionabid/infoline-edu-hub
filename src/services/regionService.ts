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
    
    // Sadə sorğu
    const { data, error } = await supabase
      .from('regions')
      .select('id, name, description, created_at, updated_at, status')
      .order('name');

    if (error) {
      console.error('Regions sorğusunda xəta:', error);
      throw error;
    }
    
    console.log(`${data?.length || 0} region uğurla yükləndi`);
    
    // created_at və updated_at sahələrinin undefined olmamasını təmin edirik
    const formattedData = data.map(region => ({
      ...region,
      created_at: region.created_at || new Date().toISOString(),
      updated_at: region.updated_at || new Date().toISOString()
    }));
    
    return formattedData as Region[];
  } catch (error) {
    console.error('Regionları yükləmə xətası:', error);
    throw error;
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
        status: regionData.status || 'active'
      };
      
      const { data, error } = await supabase
        .from('regions')
        .insert([region])
        .select('*')
        .single();

      if (error) throw error;
      
      // Created_at sahəsinin undefined olmamasını təmin edirik
      if (data && !data.created_at) {
        data.created_at = new Date().toISOString();
      }
      
      return data as Region;
    }
  } catch (error) {
    console.error('Region əlavə etmə xətası:', error);
    throw error;
  }
};

// Regionu yeniləmək üçün funksiya
export const updateRegion = async (id: string, updates: Partial<Region>): Promise<Region> => {
  try {
    const { data, error } = await supabase
      .from('regions')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    
    // Created_at sahəsinin undefined olmamasını təmin edirik
    if (data && !data.created_at) {
      data.created_at = new Date().toISOString();
    }
    
    return data as Region;
  } catch (error) {
    console.error('Region yeniləmə xətası:', error);
    throw error;
  }
};

// Regionu silmək
export const deleteRegion = async (regionId: string): Promise<any> => {
  try {
    // Əvvəlcə regionla bağlı məktəb və sektorları yoxlayaq
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
      
    if (sectorsError) throw sectorsError;
    
    // Region ilə bağlı məktəblərin sayı
    const { count: schoolCount, error: schoolsError } = await supabase
      .from('schools')
      .select('*', { count: 'exact', head: true })
      .eq('region_id', regionId);
      
    if (schoolsError) throw schoolsError;
    
    // Region ilə bağlı adminlərin sayı
    const { count: adminCount, error: adminsError } = await supabase
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .eq('region_id', regionId)
      .eq('role', 'regionadmin');
      
    if (adminsError) throw adminsError;
    
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
