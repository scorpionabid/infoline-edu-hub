import { supabase } from '@/integrations/supabase/client';
import { Sector } from '@/types/sector';

// Sektor yaratmaq üçün parametrlər
export interface CreateSectorParams {
  name: string;
  description?: string;
  regionId: string;
  status?: string;
  adminEmail?: string;
  adminName?: string;
  adminPassword?: string;
}

// Sektorları yükləmək üçün funksiya
export const fetchSectors = async (regionId?: string): Promise<Sector[]> => {
  try {
    console.log('Sektorlar sorğusu göndərilir...');
    
    let query = supabase
      .from('sectors')
      .select('*')
      .order('name');
    
    // Əgər regionId varsa, filtrlə
    if (regionId) {
      query = query.eq('region_id', regionId);
    }
    
    const { data: sectors, error } = await query;
    
    if (error) {
      console.error('Sektorları yükləmə xətası:', error);
      return [];
    }
    
    if (!sectors || sectors.length === 0) {
      console.log('Heç bir sektor tapılmadı');
      return [];
    }
    
    console.log(`${sectors.length} sektor tapıldı, admin emailləri əldə edilir...`);
    
    // Hər sektor üçün admin email-lərini əldə etmək üçün bir map yaradaq
    const sectorAdminEmails = new Map();
    
    // Bütün sektor adminlərini bir sorgu ilə əldə edək
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select('user_id, sector_id')
      .eq('role', 'sectoradmin');
    
    if (userRolesError) {
      console.error('Sektor adminləri sorğusunda xəta:', userRolesError);
    } else if (userRoles && userRoles.length > 0) {
      console.log(`${userRoles.length} sektor admin tapıldı`);
      
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
        
        // İndi user_roles-dan sector ID -> user ID -> email mapı yaradaq
        userRoles.forEach(role => {
          if (role.sector_id && role.user_id) {
            const email = userIdToEmailMap.get(role.user_id);
            if (email) {
              sectorAdminEmails.set(role.sector_id, email);
              console.log(`Sektor ${role.sector_id} üçün admin email tapıldı: ${email}`);
            }
          }
        });
      }
    }
    
    // Sektorları admin emailləri ilə formalaşdır
    const formattedSectors = sectors.map(sector => {
      // Map-dən admin email-i əldə edək
      const adminEmail = sectorAdminEmails.get(sector.id) || null;
      
      // Debug - hər sektor üçün admin məlumatlarını göstər
      console.log(`Sektor: ${sector.name}, Admin Email: ${adminEmail || 'yoxdur'}`);
      
      return {
        ...sector,
        adminEmail,
        schoolCount: 0, // Bu məlumatlar başqa sorğu ilə əldə edilə bilər
        adminCount: adminEmail ? 1 : 0
      };
    });
    
    console.log('Formatlanmış sektorlar:', formattedSectors.map(s => ({ name: s.name, adminEmail: s.adminEmail })));
    return formattedSectors as Sector[];
  } catch (error) {
    console.error('Sektorları əldə edərkən ümumi xəta:', error);
    return [];
  }
};

// Sektoru yaratmaq
export const addSector = async (sectorData: CreateSectorParams): Promise<Sector> => {
  try {
    console.log('Sektor əlavə edilir:', sectorData);
    
    // Edge function vasitəsilə sektoru və admini yaradaq
    // Bu üsul auth.admin.createUser-i server tərəfdə işlədir
    const { data, error } = await supabase.functions
      .invoke('sector-operations', {
        body: { 
          action: 'create',
          name: sectorData.name,
          description: sectorData.description,
          regionId: sectorData.regionId,
          status: sectorData.status,
          adminEmail: sectorData.adminEmail,
          adminName: sectorData.adminName,
          adminPassword: sectorData.adminPassword
        }
      });
    
    if (error) {
      console.error('Sektor yaratma sorğusu xətası:', error);
      throw error;
    }
    
    console.log('Sektor yaratma nəticəsi:', data);
    
    // Edge function-dan qaytarılan məlumatları formalaşdır
    if (data && data.sector) {
      return {
        ...data.sector,
        adminEmail: data.adminEmail || null,
        admin_id: data.adminId || null
      };
    } else {
      // Xəta halında boş obyekt qaytar
      throw new Error('Sektor yaradıldı, amma məlumatlar qaytarılmadı');
    }
  } catch (error) {
    console.error('Sektor əlavə etmə xətası:', error);
    throw error;
  }
};

// Sektoru silmək
export const deleteSector = async (sectorId: string): Promise<any> => {
  try {
    // Əvvəlcə sektora bağlı adminləri tapaq
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('sector_id', sectorId)
      .eq('role', 'sectoradmin');
    
    if (rolesError) {
      console.error('Sektor adminlərini tapma xətası:', rolesError);
    } else if (roles && roles.length > 0) {
      // Adminlərin rollarını siləcəyik
      const adminIds = roles.map(role => role.user_id);
      
      // User_roles cədvəlindən rolları silək
      const { error: deleteRolesError } = await supabase
        .from('user_roles')
        .delete()
        .eq('sector_id', sectorId)
        .eq('role', 'sectoradmin');
      
      if (deleteRolesError) {
        console.error('Admin rollarını silmə xətası:', deleteRolesError);
      }
      
      // Not: İstifadəçiləri silmirik, sadəcə rollarını silirik
    }
    
    // Sektoru silək
    const { error: deleteSectorError } = await supabase
      .from('sectors')
      .delete()
      .eq('id', sectorId);
    
    if (deleteSectorError) {
      console.error('Sektoru silmə xətası:', deleteSectorError);
      throw deleteSectorError;
    }
    
    return { success: true, message: 'Sektor uğurla silindi' };
  } catch (error) {
    console.error('Sektor silmə xətası:', error);
    throw error;
  }
};

// Sektor admin email-ini əldə etmək üçün metod
export const fetchSectorAdminEmail = async (sectorId: string): Promise<string | null> => {
  try {
    // 1. Sektorun adminini user_roles cədvəlindən tapaq
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('sector_id', sectorId)
      .eq('role', 'sectoradmin');
    
    if (rolesError) {
      console.error('Sektor admin rolları sorğusunda xəta:', rolesError);
      return null;
    }
    
    if (!roles || roles.length === 0) {
      console.log(`Sektor ${sectorId} üçün admin tapılmadı`);
      return null;
    }
    
    const adminId = roles[0].user_id;
    
    // 2. Admin istifadəçisinin email-ini profiles cədvəlindən əldə edək
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', adminId)
      .single();
    
    if (profileError) {
      console.error('Admin profili sorğusunda xəta:', profileError);
      return null;
    }
    
    if (!profile || !profile.email) {
      console.log(`Admin ${adminId} üçün email tapılmadı`);
      return null;
    }
    
    return profile.email;
  } catch (error) {
    console.error('Sektor admin email-ini əldə etmə xətası:', error);
    return null;
  }
};
