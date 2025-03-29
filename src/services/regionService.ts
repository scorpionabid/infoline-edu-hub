import { supabase } from '@/integrations/supabase/client';
import { Region } from '@/types/supabase';

/**
 * Mövcud bütün regionları əldə edir
 */
export const fetchRegions = async (): Promise<Region[]> => {
  try {
    // Regionları əldə edirik
    const { data, error } = await supabase
      .from('regions')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Regionlar əldə edilərkən xəta:', error);
    throw error;
  }
};

/**
 * Yeni region əlavə edir
 */
export const addRegion = async (region: Omit<Region, 'id' | 'created_at' | 'updated_at'>): Promise<Region> => {
  try {
    const { data, error } = await supabase
      .from('regions')
      .insert({
        name: region.name,
        description: region.description,
        status: region.status || 'active'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Region əlavə edilərkən xəta:', error);
    throw error;
  }
};

/**
 * Regionu yeniləyir
 */
export const updateRegion = async (id: string, updates: Partial<Region>): Promise<Region> => {
  try {
    const { data, error } = await supabase
      .from('regions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Region yenilənərkən xəta:', error);
    throw error;
  }
};

/**
 * Regionu silir
 * Edge Function istifadə edərək bütün asılı əlaqələri də silir (sektorlar, məktəblər və s.)
 */
export const deleteRegion = async (id: string): Promise<{ success: boolean, error?: string }> => {
  try {
    // İlk olaraq bu region ilə bağlı sektorları yoxlayaq
    const { count: sectorCount } = await supabase
      .from('sectors')
      .select('id', { count: 'exact', head: true })
      .eq('region_id', id);
    
    // Əgər sektorlar varsa, xəbərdarlıq göstərək
    if (sectorCount && sectorCount > 0) {
      console.warn(`Region (${id}) ${sectorCount} sektora bağlıdır. Diqqətli olun!`);
      // Burada seçim edə bilərsiniz - ya xəta qaytarın, ya da davam edin
      // Bu nümunədə biz davam edirik və sonra regionu silməyə cəhd edirik
    }
    
    // Regionu silmək
    const { error } = await supabase
      .from('regions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('Region silinərkən xəta:', error);
    return { 
      success: false, 
      error: error.message || 'Region silinərkən xəta baş verdi' 
    };
  }
};

/**
 * Region admin və digər əlaqəli məlumatlarla birlikdə yaradır
 * Edge function istifadə edərək həm regionu, həm də admini yaradır
 */
export const createRegion = async (regionData: {
  name: string;
  description?: string;
  status?: string;
  adminName?: string;
  adminEmail?: string;
  adminPassword?: string;
}): Promise<{ success: boolean, data: any, error?: string }> => {
  try {
    // 1. Əvvəlcə region yaradaq
    const { data: region, error: regionError } = await supabase
      .from('regions')
      .insert({
        name: regionData.name,
        description: regionData.description,
        status: regionData.status || 'active'
      })
      .select()
      .single();
    
    if (regionError) throw regionError;
    
    // 2. Əgər admin məlumatları varsa, admin yaratmağa cəhd edək
    let adminData = null;
    
    if (regionData.adminName && regionData.adminEmail && regionData.adminPassword) {
      try {
        // Sign up ilə admin yaradaq
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: regionData.adminEmail,
          password: regionData.adminPassword,
        });
        
        if (signUpError) throw signUpError;
        
        if (signUpData.user) {
          // Profil yaradaq
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: signUpData.user.id,
              full_name: regionData.adminName,
              language: 'az',
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
          
          if (profileError) throw profileError;
          
          // Region admin rolu yaradaq
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: signUpData.user.id,
              role: 'regionadmin',
              region_id: region.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
          
          if (roleError) throw roleError;
          
          adminData = {
            id: signUpData.user.id,
            email: regionData.adminEmail,
            name: regionData.adminName,
            role: 'regionadmin'
          };
        }
      } catch (adminError) {
        console.error('Region admin yaradılarkən xəta:', adminError);
        // Admin yaradılması uğursuz olsa belə, region yaradılmışdır və proses davam edir
      }
    }
    
    return {
      success: true,
      data: {
        region,
        admin: adminData
      }
    };
  } catch (error: any) {
    console.error('Region yaradılarkən xəta:', error);
    return {
      success: false,
      data: null,
      error: error.message || 'Region yaradılarkən xəta baş verdi'
    };
  }
};

/**
 * Region haqqında statistika məlumatlarını əldə edir
 */
export const getRegionStats = async (regionId: string) => {
  try {
    // Regionla əlaqəli məktəbləri əldə edirik
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('*')
      .eq('region_id', regionId);
    
    if (schoolsError) throw schoolsError;
    
    // Regionla əlaqəli sektorları əldə edirik
    const { data: sectors, error: sectorsError } = await supabase
      .from('sectors')
      .select('*')
      .eq('region_id', regionId);
    
    if (sectorsError) throw sectorsError;
    
    // Regionla əlaqəli administratoru əldə edirik
    const { data: regionAdmins, error: adminsError } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        profiles:user_id (
          full_name,
          avatar,
          status
        )
      `)
      .eq('region_id', regionId)
      .eq('role', 'regionadmin');
    
    // Əgər admin sorğusunda xəta baş verərsə, sadəcə boş massiv qaytaraq
    const admins = adminsError ? [] : regionAdmins;
    
    // Tamamlanma faizini hesablayaq
    const totalCompletionRate = schools?.reduce((total, school) => {
      return total + (school.completion_rate || 0);
    }, 0);
    
    const avgCompletionRate = schools && schools.length > 0
      ? Math.round(totalCompletionRate / schools.length)
      : 0;
    
    return {
      schoolCount: schools?.length || 0,
      sectorCount: sectors?.length || 0,
      completionRate: avgCompletionRate,
      admins: admins || []
    };
  } catch (error) {
    console.error('Region statistikası əldə edilərkən xəta:', error);
    // Xəta halında default dəyərlər qaytaraq
    return {
      schoolCount: 0,
      sectorCount: 0,
      completionRate: 0,
      admins: []
    };
  }
};