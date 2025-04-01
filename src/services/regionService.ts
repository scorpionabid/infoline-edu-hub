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
    console.log('Regionlar sorğusu göndərilir - xəta idarəetməsi ilə...');
    
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
      console.log('Heç bir region tapılmadı');
      return [];
    }
    
    console.log(`${regions.length} region tapıldı, admin emailləri əldə edilir...`);
    
    // Hər region üçün admin email-lərini əldə etmək üçün bir map yaradaq
    const regionAdminEmails = new Map();
    
    // Bütün region adminlərini bir sorgu ilə əldə edək
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select('user_id, region_id')
      .eq('role', 'regionadmin');
    
    if (userRolesError) {
      console.error('Region adminləri sorğusunda xəta:', userRolesError);
    } else if (userRoles && userRoles.length > 0) {
      console.log(`${userRoles.length} region admin tapıldı`);
      
      // Bütün admin istifadəçilərinin ID-lərini toplayaq
      const adminUserIds = userRoles.map(role => role.user_id);
      
      // Profiles cədvəlindən bütün admin istifadəçilərinin email-lərini əldə edək
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', adminUserIds);
      
      if (profilesError) {
        console.error('Admin profilləri sorğusunda xəta:', profilesError);
      } else if (profiles && profiles.length > 0) {
        console.log(`${profiles.length} admin profili tapıldı`);
        
        // Profillərdən user ID -> email mapı yaradaq
        const userIdToEmailMap = new Map();
        profiles.forEach(profile => {
          if (profile.id && profile.email) {
            userIdToEmailMap.set(profile.id, profile.email);
          }
        });
        
        // İndi user_roles-dan region ID -> user ID -> email mapı yaradaq
        userRoles.forEach(role => {
          if (role.region_id && role.user_id) {
            const email = userIdToEmailMap.get(role.user_id);
            if (email) {
              regionAdminEmails.set(role.region_id, email);
              console.log(`Region ${role.region_id} üçün admin email tapıldı: ${email}`);
            }
          }
        });
      }
    }
    
    // Regionları admin emailləri ilə formalaşdır
    const formattedRegions = await Promise.all(regions.map(async (region) => {
      // Map-dən admin email-i əldə edək
      let adminEmail = regionAdminEmails.get(region.id) || null;
      
      // Əgər map-də yoxdursa, birbaşa fetchRegionAdminEmail funksiyamızı çağıraq
      if (!adminEmail) {
        try {
          adminEmail = await fetchRegionAdminEmail(region.id);
          console.log(`Region ${region.name} üçün fetchRegionAdminEmail ilə əldə edilən email: ${adminEmail || 'yoxdur'}`);
        } catch (emailError) {
          console.error(`Region ${region.name} üçün admin email əldə etmə xətası:`, emailError);
        }
      }
      
      // Debug - hər region üçün admin məlumatlarını göstər
      console.log(`Region: ${region.name}, Admin Email: ${adminEmail || 'yoxdur'}`);
      
      return {
        ...region,
        adminEmail,
        sectorCount: 0,
        schoolCount: 0,
        adminCount: adminEmail ? 1 : 0
      };
    }));
    
    console.log('Formatlanmış regionlar:', formattedRegions.map(r => ({ name: r.name, adminEmail: r.adminEmail })));
    return formattedRegions as Region[];
  } catch (error) {
    console.error('Regionları əldə edərkən ümumi xəta:', error);
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
    console.log('Region əlavə edilir:', regionData);
    
    // Edge function vasitəsilə regionu və admini yaradaq
    // Bu üsul auth.admin.createUser-i server tərəfdə işlədir
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
      
      // Əgər admin yaradılıbsa, amma region-a admin_id təyin edilməyibsə
      if (admin && admin.id && (!region.admin_id || region.admin_id === null)) {
        try {
          console.log(`Admin ID (${admin.id}) region-a (${region.id}) təyin edilir...`);
          
          // Region-a admin_id təyin edək
          const { data: updatedRegion, error: updateError } = await supabase
            .from('regions')
            .update({ admin_id: admin.id })
            .eq('id', region.id)
            .select('*')
            .single();
            
          if (updateError) {
            console.error('Region admin_id yeniləmə xətası:', updateError);
          } else if (updatedRegion) {
            console.log('Region admin_id uğurla yeniləndi:', updatedRegion);
            Object.assign(region, updatedRegion);
          } else {
            console.log('Region yeniləndi, amma məlumatlar qaytarılmadı');
            region.admin_id = admin.id;
          }
          
          // User_roles cədvəlinə yazı əlavə edək
          const { error: roleError } = await supabase
            .from('user_roles')
            .upsert([{
              user_id: admin.id,
              role: 'regionadmin',
              region_id: region.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }]);
          
          if (roleError) {
            console.error('Rol əlavə etmə xətası:', roleError);
          } else {
            console.log(`Rol uğurla əlavə edildi: user_id=${admin.id}, region_id=${region.id}`);
          }
          
          // Yoxlayaq ki, region_id düzgün təyin edilib
          const { data: checkRegion, error: checkError } = await supabase
            .from('regions')
            .select('*')
            .eq('id', region.id)
            .single();
            
          if (checkError) {
            console.error('Region yoxlama xətası:', checkError);
          } else if (checkRegion) {
            console.log('Yoxlama nəticəsi:', checkRegion);
            if (checkRegion.admin_id !== admin.id) {
              console.warn(`Region admin_id hələ də düzgün deyil. Gözlənilən: ${admin.id}, Faktiki: ${checkRegion.admin_id}`);
              // Bir daha cəhd edək
              await supabase
                .from('regions')
                .update({ admin_id: admin.id })
                .eq('id', region.id);
              region.admin_id = admin.id;
            }
          }
        } catch (e) {
          console.error('Admin təyin etmə xətası:', e);
        }
      }
      
      // Əgər hələ də admin_id null-dırsa, amma admin obyekti varsa
      if ((!region.admin_id || region.admin_id === null) && admin && admin.id) {
        region.admin_id = admin.id;
      }
      
      return {
        ...region,
        adminEmail: admin?.email || null,
        admin_id: region.admin_id || admin?.id || null
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
    
    // Əvvəlcə regionla əlaqəli admin istifadəçiləri əldə edək
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('region_id', regionId)
      .eq('role', 'regionadmin');
    
    if (rolesError) {
      console.error('Admin istifadəçiləri əldə etmə xətası:', rolesError);
    }
    
    // Admin istifadəçiləri varsa, onları deaktiv edək
    if (userRoles && userRoles.length > 0) {
      const userIds = userRoles.map(role => role.user_id);
      try {
        // Profilləri deaktiv edək
        await supabase
          .from('profiles')
          .update({ status: 'inactive' })
          .in('id', userIds);
          
        console.log(`${userIds.length} admin istifadəçisi deaktiv edildi`);
      } catch (profileError) {
        console.error('Admin profillərini deaktiv etmə xətası:', profileError);
      }
    }
    
    // Regionu silək
    const { error: deleteError } = await supabase
      .from('regions')
      .delete()
      .eq('id', regionId);
    
    if (deleteError) {
      console.error('Region silmə xətası:', deleteError);
      throw deleteError;
    }
    
    console.log('Region uğurla silindi:', regionId);
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
