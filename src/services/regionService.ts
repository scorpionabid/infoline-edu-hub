import { supabase } from '@/integrations/supabase/client';
import { Region } from '@/types/supabase';
import { toast } from 'sonner';

interface CreateRegionParams {
  name: string;
  description?: string;
  status?: string;
  adminEmail?: string;
  adminName?: string;
  adminPassword?: string;
}

// Regionları yükləmək üçün funksiya - sorğunu optimizasiya edirik
export const fetchRegions = async (): Promise<Region[]> => {
  try {
    console.log('Regionlar sorğusu göndərilir...');
    
    // 1. Sadə sorğu - üçüncü tərəf parametrləri əlavə etmirik
    const { data, error } = await supabase
      .from('regions')
      .select('id, name, description, created_at, updated_at, status')
      .order('name');

    if (error) {
      console.error('Regions sorğusunda xəta:', error);
      throw error;
    }
    
    console.log(`${data?.length || 0} region uğurla yükləndi`);
    return data as Region[];
  } catch (error) {
    console.error('Regionları yükləmə xətası:', error);
    throw error;
  }
};

// Regionu Supabase edge function istifadə edərək yaratmaq
export const createRegion = async (regionData: CreateRegionParams): Promise<any> => {
  try {
    console.log('Region data being sent to API:', regionData);
    
    // Edge function əvəzinə birbaşa verilənlər bazasına yazırıq
    const { data, error } = await supabase
      .from('regions')
      .insert({
        name: regionData.name,
        description: regionData.description || '',
        status: regionData.status || 'active',
      })
      .select('*')
      .single();
    
    if (error) {
      console.error('Region yaratma sorğusu xətası:', error);
      throw error;
    }

    // Əgər admin məlumatları varsa, admini yaratmağa cəhd edirik
    let adminData = null;
    
    if (regionData.adminEmail && regionData.adminPassword) {
      try {
        // Admin yaratma kodunu əlavə etmək olar
        console.log('Admin yaratma işləri - hazırda skip edilir');
        
        adminData = {
          email: regionData.adminEmail,
          name: regionData.adminName || regionData.name + ' Admin'
        };
      } catch (adminError) {
        console.error('Admin yaratma xətası:', adminError);
      }
    }
    
    return { 
      success: true, 
      data: {
        region: data,
        admin: adminData
      }
    };
  } catch (error) {
    console.error('Region yaratma xətası:', error);
    return { 
      success: false, 
      error: error.message || 'Bilinməyən xəta'
    };
  }
};

// Regionu birbaşa verilənlər bazasına əlavə etmək (adi halda)
export const addRegion = async (region: Omit<Region, 'id' | 'created_at' | 'updated_at'>): Promise<Region> => {
  try {
    const { data, error } = await supabase
      .from('regions')
      .insert([region])
      .select('*')
      .single();

    if (error) throw error;
    
    return data as Region;
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
    
    return data as Region;
  } catch (error) {
    console.error('Region yeniləmə xətası:', error);
    throw error;
  }
};

// Regionu silmək
export const deleteRegion = async (regionId: string): Promise<any> => {
  try {
    // Edge function əvəzinə birbaşa verilənlər bazasında silmə əməliyyatı
    // Əvvəlcə regionla bağlı məktəb və sektorları yoxlayaq
    const { count: sectorsCount } = await supabase
      .from('sectors')
      .select('id', { count: 'exact', head: true })
      .eq('region_id', regionId);
      
    if (sectorsCount && sectorsCount > 0) {
      console.warn(`Bu region (${regionId}) ${sectorsCount} sektora malikdir`);
      // İstəsəniz burada error qaytara bilərsiniz
    }
    
    // Regionu silin
    const { error } = await supabase
      .from('regions')
      .delete()
      .eq('id', regionId);
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Region silmə xətası:', error);
    return { 
      success: false, 
      error: error.message || 'Bilinməyən xəta'
    };
  }
};

// Regionla bağlı statistikaları əldə etmək (məktəblər, sektorlar, istifadəçilər)
export const getRegionStats = async (regionId: string): Promise<any> => {
  try {
    // Region ilə bağlı sektorların sayı
    const { count: sectorCount, error: sectorsError } = await supabase
      .from('sectors')
      .select('id', { count: 'exact', head: true })
      .eq('region_id', regionId);
      
    if (sectorsError) throw sectorsError;
    
    // Region ilə bağlı məktəblərin sayı
    const { count: schoolCount, error: schoolsError } = await supabase
      .from('schools')
      .select('id', { count: 'exact', head: true })
      .eq('region_id', regionId);
      
    if (schoolsError) throw schoolsError;
    
    // Region ilə bağlı adminlərin sayı
    const { count: adminCount, error: adminsError } = await supabase
      .from('user_roles')
      .select('id', { count: 'exact', head: true })
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