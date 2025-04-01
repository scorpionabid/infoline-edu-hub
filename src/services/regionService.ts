
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

// Regionları yükləmək üçün funksiya
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
    
    // Admin emailləri əldə etmək üçün bir map yaradaq
    const adminEmails = new Map<string, string>();
    
    // Profillərdən və user_roles ilişkilərindən admin e-poçtlarını əldə edək
    for (const region of regions) {
      try {
        // user_roles cədvəlindən regionun admin ID-sini əldə et
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'regionadmin')
          .eq('region_id', region.id)
          .limit(1);
        
        if (rolesError) {
          console.error(`Region ${region.id} üçün admin ID sorğusunda xəta:`, rolesError);
          continue;
        }
        
        if (!userRoles || userRoles.length === 0) {
          console.log(`Region ${region.id} üçün admin tapılmadı`);
          continue;
        }
        
        const adminId = userRoles[0].user_id;
        
        // Profiles cədvəlindən email məlumatını əldə et
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', adminId)
          .single();
        
        if (!profileError && profile && profile.email) {
          console.log(`Region ${region.id} üçün admin emaili tapıldı: ${profile.email}`);
          adminEmails.set(region.id, profile.email);
        } else {
          console.log(`Region ${region.id} üçün admin profili tapılmadı:`, profileError);
          
          // Auth cədvəlindən e-poçt əldə etmək üçün function çağırışı
          const { data, error } = await supabase.functions
            .invoke('region-operations', {
              body: { 
                action: 'get-admin-email',
                userId: adminId
              }
            });
          
          if (!error && data && data.email) {
            console.log(`Region ${region.id} üçün edge function ilə email alındı: ${data.email}`);
            adminEmails.set(region.id, data.email);
          } else {
            console.log(`Region ${region.id} üçün edge function ilə email alınamadı`);
          }
        }
      } catch (err) {
        console.error(`Region ${region.id} üçün admin email əldə edilməsi xətası:`, err);
      }
    }
    
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

// Regionu Supabase edge function istifadə edərək yaratmaq
export const createRegion = async (regionData: CreateRegionParams): Promise<any> => {
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
      throw error;
    }
    
    console.log('Region yaratma nəticəsi:', data);
    return data;
  } catch (error) {
    console.error('Region yaratma xətası:', error);
    throw error;
  }
};

// Regionu Supabase edge function istifadə edərək yaratmaq
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
  } catch (error) {
    console.error('Region əlavə etmə xətası:', error);
    throw error;
  }
};

// Regionu silmək
export const deleteRegion = async (regionId: string): Promise<any> => {
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
    // Regionun admin_id-sini tapmağa çalışaq
    const { data: region, error: regionError } = await supabase
      .from('regions')
      .select('admin_id')
      .eq('id', regionId)
      .single();
    
    if (regionError || !region || !region.admin_id) {
      // admin_id yoxdur, user_roles cədvəlindən baxaq
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('region_id', regionId)
        .eq('role', 'regionadmin');
      
      if (rolesError || !roles || roles.length === 0) {
        console.log('Bu region üçün admin tapılmadı:', regionId);
        return null;
      }
      
      const userId = roles[0].user_id;
      
      // profiles cədvəlindən email-i yoxlayaq
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();
        
      if (!profileError && profile && profile.email) {
        console.log('Profildən email tapıldı:', profile.email);
        return profile.email;
      }
      
      // Edge function vasitəsilə email əldə edək
      const { data, error } = await supabase.functions
        .invoke('region-operations', {
          body: { 
            action: 'get-admin-email',
            userId
          }
        });
      
      if (error || !data || !data.email) {
        console.error('Admin email ünvanını əldə etmə xətası:', error || 'Məlumat tapılmadı');
        return null;
      }
      
      console.log('Edge function-dan email alındı:', data.email);
      return data.email;
    } else {
      // admin_id var, bu istifadəçinin email-ini əldə edək
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', region.admin_id)
        .single();
        
      if (!profileError && profile && profile.email) {
        console.log('Profildən email tapıldı (admin_id ilə):', profile.email);
        return profile.email;
      }
      
      // Edge function vasitəsilə email əldə edək
      const { data, error } = await supabase.functions
        .invoke('region-operations', {
          body: { 
            action: 'get-admin-email',
            userId: region.admin_id
          }
        });
      
      if (error || !data || !data.email) {
        console.error('Admin email ünvanını əldə etmə xətası:', error || 'Məlumat tapılmadı');
        return null;
      }
      
      console.log('Edge function-dan email alındı (admin_id ilə):', data.email);
      return data.email;
    }
  } catch (error) {
    console.error('Region admin emaili əldə etmə xətası:', error);
    return null;
  }
};
