
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

// Regionları yükləmək üçün funksiya
export const fetchRegions = async (): Promise<Region[]> => {
  try {
    const { data, error } = await supabase
      .from('regions')
      .select('*')
      .order('name');

    if (error) throw error;
    
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
    const { data, error } = await supabase.functions.invoke('region-operations/create', {
      method: 'POST',
      body: regionData
    });
    
    if (error) {
      console.error('Invoke error:', error);
      throw error;
    }
    
    console.log('API response:', data);
    return data;
  } catch (error) {
    console.error('Region yaratma xətası:', error);
    throw error;
  }
};

// Regionu birbaşa verilənlər bazasına əlavə etmək (adi halda)
export const addRegion = async (region: Omit<Region, 'id' | 'created_at' | 'updated_at'>): Promise<Region> => {
  try {
    const { data, error } = await supabase
      .from('regions')
      .insert([region])
      .select()
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
      .select()
      .single();

    if (error) throw error;
    
    return data as Region;
  } catch (error) {
    console.error('Region yeniləmə xətası:', error);
    throw error;
  }
};

// Regionu Supabase edge function istifadə edərək silmək
export const deleteRegion = async (regionId: string): Promise<any> => {
  try {
    const { data, error } = await supabase.functions.invoke('region-operations/delete', {
      method: 'POST',
      body: { regionId }
    });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Region silmə xətası:', error);
    throw error;
  }
};

// Regionla bağlı statistikaları əldə etmək (məktəblər, sektorlar, istifadəçilər)
export const getRegionStats = async (regionId: string): Promise<any> => {
  try {
    // Region ilə bağlı sektorların sayı
    const { data: sectors, error: sectorsError } = await supabase
      .from('sectors')
      .select('id')
      .eq('region_id', regionId);
      
    if (sectorsError) throw sectorsError;
    
    // Region ilə bağlı məktəblərin sayı
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('id')
      .eq('region_id', regionId);
      
    if (schoolsError) throw schoolsError;
    
    // Region ilə bağlı adminlərin sayı
    const { data: admins, error: adminsError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('region_id', regionId)
      .eq('role', 'regionadmin');
      
    if (adminsError) throw adminsError;
    
    // Region ilə bağlı adminlərin məlumatları - execute_sql əvəzinə 
    // join əməliyyatı və ya ardıcıl sorğular istifadə edirik
    const { data: adminProfiles, error: adminProfilesError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('region_id', regionId)
      .eq('role', 'regionadmin');
      
    if (adminProfilesError) throw adminProfilesError;
    
    let adminData: Array<{id: string, full_name: string, email: string}> = [];
    
    if (adminProfiles && adminProfiles.length > 0) {
      // Adminin user_id-lərini əldə etdikdən sonra profile məlumatlarını əldə edirik
      const userIds = adminProfiles.map(profile => profile.user_id);
      
      // Profiles cədvəlindən məlumatları əldə edirik
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);
        
      if (profilesError) throw profilesError;
      
      // Auth.users cədvəlindən emailləri əldə edə bilmərik,
      // ona görə də admin emailləri üçün təxmini qayda istifadə edirik
      adminData = profiles?.map(profile => {
        const fullNameLower = profile.full_name.toLowerCase().replace(/\s+/g, '.');
        return {
          id: profile.id,
          full_name: profile.full_name,
          email: `${fullNameLower}.admin@infoline.edu`
        };
      }) || [];
    }
    
    return {
      sectorCount: sectors?.length || 0,
      schoolCount: schools?.length || 0,
      adminCount: admins?.length || 0,
      admins: adminData
    };
  } catch (error) {
    console.error('Region statistikalarını əldə etmə xətası:', error);
    throw error;
  }
};
