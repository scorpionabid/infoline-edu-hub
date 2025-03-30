
import { supabase, supabaseUrl } from '@/integrations/supabase/client';
import { Region } from '@/types/region';

interface CreateRegionParams {
  name: string;
  description?: string;
  status?: string;
  adminEmail?: string;
  adminName?: string;
  adminPassword?: string;
}

// Regionları yükləmək üçün funksiya - genişləndirilmiş debug məlumatları ilə
// Regionları yükləmək üçün funksiya - sadələşdirilmiş versiya
// src/services/regionService.ts faylında dəyişikliklər

export const fetchRegions = async (): Promise<Region[]> => {
  try {
    console.log('Regionlar sorğusu göndərilir - tamamilə sadələşdirilmiş...');
    
    // 1. Sadəcə regionları əldə et
    const { data: regions, error: regionsError } = await supabase
      .from('regions')
      .select('*')
      .order('name');
      
    if (regionsError) {
      console.error('Regions sorğusunda xəta:', regionsError);
      return []; 
    }
    
    if (!regions || regions.length === 0) {
      return [];
    }
    
    // 2. User Roles əldə et (RLS düzəltdikdən sonra işləməlidir)
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, region_id')
      .eq('role', 'regionadmin');
    
    if (rolesError) {
      console.error('User roles sorğusunda xəta:', rolesError);
      return regions.map(region => ({
        ...region,
        adminEmail: null
      }));
    }
    
    // Region ID və user ID map yarat
    const regionToAdminMap = new Map();
    userRoles?.forEach(role => {
      if (role.region_id && role.user_id) {
        regionToAdminMap.set(role.region_id, role.user_id);
      }
    });
    
    // Admin ID-lərini əldə et
    const adminIds = Array.from(regionToAdminMap.values());
    
    // Seçim 1: Profiles cədvəlindən email əldə et
    let adminEmailMap = new Map();
    
    if (adminIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', adminIds);
        
      if (!profilesError && profiles) {
        profiles.forEach(profile => {
          if (profile.id) {
            adminEmailMap.set(profile.id, profile.email || null);
          }
        });
      } else {
        console.error('Profiles sorğusunda xəta:', profilesError);
      }
    }
    
    // Regionları admin emailləri ilə formalaşdır
    const formattedRegions = regions.map(region => {
      const adminId = regionToAdminMap.get(region.id);
      const adminEmail = adminId ? adminEmailMap.get(adminId) || null : null;
      
      return {
        ...region,
        adminEmail,
        // Sadə demo göstərilməsi üçün random məlumatlar əlavə edin
        sectorCount: 0,
        schoolCount: 0,
        adminCount: adminId ? 1 : 0
      };
    });
    
    return formattedRegions as Region[];
  } catch (error) {
    console.error('Regionları yükləmə xətası:', error);
    return [];
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
    
    console.log('Region yaratma nəticəsi:', data);
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
      console.log('Admin məlumatları mövcuddur, edge function istifadə edirik');
      const result = await createRegion(regionData);
      
      if (!result || !result.success) {
        throw new Error(result?.error || 'Region yaradılması xətası');
      }
      
      // Created_at sahəsinin undefined olmamasını təmin edirik
      if (result.data && result.data.region && !result.data.region.created_at) {
        result.data.region.created_at = new Date().toISOString();
      }
      
      if (result.data && result.data.region && !result.data.region.updated_at) {
        result.data.region.updated_at = new Date().toISOString();
      }
      
      // Admin email məlumatını region obyektinə əlavə edirik
      const regionWithAdmin = {
        ...result.data?.region,
        adminEmail: regionData.adminEmail
      };
      
      console.log('Edge function ilə yaradılan region:', regionWithAdmin);
      return regionWithAdmin;
    } else {
      // Sadə region yaratma - admin olmadan
      console.log('Sadə region yaratma - admin məlumatları olmadan');
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

      if (error) {
        console.error('Supabase insert xətası:', error);
        throw error;
      }
      
      // Null check əlavə edirik
      if (!data) {
        throw new Error('Region yaradıldı, lakin qaytarılan data undefined idi');
      }
      
      // Created_at və updated_at sahələrinin undefined olmamasını təmin edirik
      if (!data.created_at) {
        data.created_at = new Date().toISOString();
      }
      
      if (!data.updated_at) {
        data.updated_at = new Date().toISOString();
      }
      
      console.log('Yaradılan region:', data);
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
    console.log('Region silmə əməliyyatı başlanır:', regionId);
    
    // Edge function vasitəsilə regionu və onunla əlaqəli adminləri silək
    const { data, error } = await supabase.functions
      .invoke('region-operations', {
        body: { 
          action: 'delete',
          regionId: regionId
        }
      });
    
    if (error) {
      console.error('Region silmə sorğusu xətası:', error);
      throw error;
    }
    
    console.log('Region silmə nəticəsi:', data);
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

// Region admin email-ini əldə etmək üçün metod
export const fetchRegionAdminEmail = async (regionId: string): Promise<string | null> => {
  try {
    // Regionla əlaqəli region admin rollarını tapırıq
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('region_id', regionId)
      .eq('role', 'regionadmin');
    
    if (rolesError || !roles || roles.length === 0) {
      console.log('Bu region üçün admin tapılmadı:', regionId);
      return null;
    }
    
    // Əvvəlcə profiles cədvəlindən email-i yoxlayaq
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', roles[0].user_id)
      .single();
      
    if (!profileError && profile && profile.email) {
      console.log('Profildən email tapıldı:', profile.email);
      return profile.email;
    }
    
    // İlk admin user_id ilə auth.users cədvəlindən email ünvanını əldə etmək üçün
    // edge function istifadə edirik (çünki auth.users cədvəlinə birbaşa çıxışımız yoxdur)
    const { data, error } = await supabase.functions
      .invoke('region-operations', {
        body: { 
          action: 'get-admin-email',
          userId: roles[0].user_id
        }
      });
    
    if (error || !data || !data.email) {
      console.error('Admin email ünvanını əldə etmə xətası:', error || 'Məlumat tapılmadı');
      return null;
    }
    
    console.log('Edge function-dan email alındı:', data.email);
    return data.email;
  } catch (error) {
    console.error('Region admin emaili əldə etmə xətası:', error);
    return null;
  }
};
