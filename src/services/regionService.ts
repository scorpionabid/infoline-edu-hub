
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
    const { data, error } = await supabase.functions.invoke('region-operations/create', {
      method: 'POST',
      body: regionData
    });
    
    if (error) throw error;
    
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
    // Regionla bağlı sektorları əldə etmək
    const { data: sectors, error: sectorsError } = await supabase
      .from('sectors')
      .select('*')
      .eq('region_id', regionId);
      
    if (sectorsError) throw sectorsError;
    
    // Regionla bağlı məktəbləri əldə etmək
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('*')
      .eq('region_id', regionId);
      
    if (schoolsError) throw schoolsError;
    
    // Regionla bağlı istifadəçiləri əldə etmək
    const { data: users, error: usersError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('region_id', regionId);
      
    if (usersError) throw usersError;
    
    return {
      sectorCount: sectors?.length || 0,
      schoolCount: schools?.length || 0,
      userCount: users?.length || 0
    };
  } catch (error) {
    console.error('Region statistikalarını əldə etmə xətası:', error);
    throw error;
  }
};
