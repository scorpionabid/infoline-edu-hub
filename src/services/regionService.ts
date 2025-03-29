
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
    
    // Region ilə bağlı adminlərin məlumatları
    const { data: adminData, error: adminDataError } = await supabase.rpc('execute_sql', { 
      query_text: `
        SELECT p.id, p.full_name, a.email 
        FROM profiles p 
        JOIN auth.users a ON p.id = a.id 
        JOIN user_roles ur ON p.id = ur.user_id 
        WHERE ur.region_id = '${regionId}' AND ur.role = 'regionadmin'
      `
    });
    
    if (adminDataError) throw adminDataError;
    
    return {
      sectorCount: sectors?.length || 0,
      schoolCount: schools?.length || 0,
      adminCount: admins?.length || 0,
      admins: adminData || []
    };
  } catch (error) {
    console.error('Region statistikalarını əldə etmə xətası:', error);
    throw error;
  }
};
