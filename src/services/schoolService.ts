import { supabase } from '@/integrations/supabase/client';
import { School } from '@/types/school';

// Məktəb yaratmaq üçün parametrlər
export interface CreateSchoolParams {
  name: string;
  description?: string;
  regionId: string;
  sectorId: string;
  status?: string;
  adminEmail?: string;
  adminName?: string;
  adminPassword?: string;
}

// Məktəbləri yükləmək üçün funksiya
export const fetchSchools = async (sectorId?: string, regionId?: string): Promise<School[]> => {
  try {
    console.log('Məktəblər sorğusu göndərilir...');
    
    let query = supabase
      .from('schools')
      .select('*')
      .order('name');
    
    // Əgər sectorId varsa, filtrlə
    if (sectorId) {
      query = query.eq('sector_id', sectorId);
    }
    
    // Əgər regionId varsa, filtrlə
    if (regionId) {
      query = query.eq('region_id', regionId);
    }
    
    const { data: schools, error } = await query;
    
    if (error) {
      console.error('Məktəbləri yükləmə xətası:', error);
      return [];
    }
    
    if (!schools || schools.length === 0) {
      console.log('Heç bir məktəb tapılmadı');
      return [];
    }
    
    console.log(`${schools.length} məktəb tapıldı, admin emailləri əldə edilir...`);
    
    // Hər məktəb üçün admin email-lərini əldə etmək üçün bir map yaradaq
    const schoolAdminEmails = new Map();
    
    // Bütün məktəb adminlərini bir sorgu ilə əldə edək
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select('user_id, school_id')
      .eq('role', 'schooladmin');
    
    if (userRolesError) {
      console.error('Məktəb adminləri sorğusunda xəta:', userRolesError);
    } else if (userRoles && userRoles.length > 0) {
      console.log(`${userRoles.length} məktəb admin tapıldı`);
      
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
        
        // İndi user_roles-dan school ID -> user ID -> email mapı yaradaq
        userRoles.forEach(role => {
          if (role.school_id && role.user_id) {
            const email = userIdToEmailMap.get(role.user_id);
            if (email) {
              schoolAdminEmails.set(role.school_id, email);
              console.log(`Məktəb ${role.school_id} üçün admin email tapıldı: ${email}`);
            }
          }
        });
      }
    }
    
    // Məktəbləri admin emailləri ilə formalaşdır
    const formattedSchools = schools.map(school => {
      // Map-dən admin email-i əldə edək
      const adminEmail = schoolAdminEmails.get(school.id) || null;
      
      // Debug - hər məktəb üçün admin məlumatlarını göstər
      console.log(`Məktəb: ${school.name}, Admin Email: ${adminEmail || 'yoxdur'}`);
      
      return {
        ...school,
        adminEmail,
        studentCount: 0, // Bu məlumatlar başqa sorğu ilə əldə edilə bilər
        teacherCount: 0,
        adminCount: adminEmail ? 1 : 0
      };
    });
    
    console.log('Formatlanmış məktəblər:', formattedSchools.map(s => ({ name: s.name, adminEmail: s.adminEmail })));
    return formattedSchools as School[];
  } catch (error) {
    console.error('Məktəbləri əldə edərkən ümumi xəta:', error);
    return [];
  }
};

// Məktəb yaratmaq
export const addSchool = async (schoolData: CreateSchoolParams): Promise<School> => {
  try {
    console.log('Məktəb əlavə edilir:', schoolData);
    
    // 1. Əvvəlcə məktəbi yaradaq
    const { data: newSchool, error: schoolError } = await supabase
      .from('schools')
      .insert([
        {
          name: schoolData.name,
          description: schoolData.description || '',
          region_id: schoolData.regionId,
          sector_id: schoolData.sectorId,
          status: schoolData.status || 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
    
    if (schoolError) {
      console.error('Məktəb yaratma xətası:', schoolError);
      throw new Error(`Məktəb yaratma xətası: ${schoolError.message}`);
    }
    
    if (!newSchool) {
      throw new Error('Məktəb yaradıldı, amma məlumatlar qaytarılmadı');
    }
    
    console.log('Yeni məktəb yaradıldı:', newSchool);
    
    // Əgər admin məlumatları varsa, admin yaradaq
    if (schoolData.adminEmail && schoolData.adminName && schoolData.adminPassword) {
      try {
        // 2. Supabase Auth API ilə yeni istifadəçi yaradaq
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: schoolData.adminEmail,
          password: schoolData.adminPassword,
          email_confirm: true, // Email təsdiqləməni avtomatik təsdiqlə
          user_metadata: {
            full_name: schoolData.adminName
          }
        });
        
        if (authError) {
          console.error('Auth istifadəçi yaratma xətası:', authError);
          // Admin yaratma uğursuz olsa da, məktəbi qaytaraq
          return {
            ...newSchool,
            adminEmail: null
          };
        }
        
        console.log('Auth istifadəçi yaradıldı:', authUser);
        
        // 3. Profiles cədvəlinə istifadəçi məlumatlarını əlavə edək
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([
            {
              id: authUser.user.id,
              email: schoolData.adminEmail,
              full_name: schoolData.adminName,
              updated_at: new Date().toISOString()
            }
          ]);
        
        if (profileError) {
          console.error('Profil yaratma xətası:', profileError);
        }
        
        // 4. User_roles cədvəlinə schooladmin rolunu əlavə edək
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert([
            {
              user_id: authUser.user.id,
              role: 'schooladmin',
              school_id: newSchool.id,
              sector_id: schoolData.sectorId, // Məktəbin aid olduğu sektoru da qeyd edirik
              region_id: schoolData.regionId, // Məktəbin aid olduğu regionu da qeyd edirik
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);
        
        if (roleError) {
          console.error('Rol əlavə etmə xətası:', roleError);
        }
        
        // 5. Schools cədvəlində admin_id sahəsini yeniləyək (əgər belə sahə varsa)
        const { error: updateSchoolError } = await supabase
          .from('schools')
          .update({ admin_id: authUser.user.id })
          .eq('id', newSchool.id);
        
        if (updateSchoolError) {
          console.error('Məktəb admin_id yeniləmə xətası:', updateSchoolError);
        }
        
        // Admin email məlumatını məktəb obyektinə əlavə edirik
        return {
          ...newSchool,
          adminEmail: schoolData.adminEmail,
          admin_id: authUser.user.id
        };
      } catch (adminCreateError) {
        console.error('Admin yaratma prosesində xəta:', adminCreateError);
        // Admin yaratma uğursuz olsa da, məktəbi qaytaraq
        return {
          ...newSchool,
          adminEmail: null
        };
      }
    } else {
      // Admin məlumatları olmadan sadə məktəb qaytaraq
      return {
        ...newSchool,
        adminEmail: null
      };
    }
  } catch (error) {
    console.error('Məktəb əlavə etmə xətası:', error);
    throw error;
  }
};

// Məktəbi silmək
export const deleteSchool = async (schoolId: string): Promise<any> => {
  try {
    // Əvvəlcə məktəbə bağlı adminləri tapaq
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('school_id', schoolId)
      .eq('role', 'schooladmin');
    
    if (rolesError) {
      console.error('Məktəb adminlərini tapma xətası:', rolesError);
    } else if (roles && roles.length > 0) {
      // Adminlərin rollarını siləcəyik
      const adminIds = roles.map(role => role.user_id);
      
      // User_roles cədvəlindən rolları silək
      const { error: deleteRolesError } = await supabase
        .from('user_roles')
        .delete()
        .eq('school_id', schoolId)
        .eq('role', 'schooladmin');
      
      if (deleteRolesError) {
        console.error('Admin rollarını silmə xətası:', deleteRolesError);
      }
      
      // Not: İstifadəçiləri silmirik, sadəcə rollarını silirik
    }
    
    // Məktəbi silək
    const { error: deleteSchoolError } = await supabase
      .from('schools')
      .delete()
      .eq('id', schoolId);
    
    if (deleteSchoolError) {
      console.error('Məktəbi silmə xətası:', deleteSchoolError);
      throw deleteSchoolError;
    }
    
    return { success: true, message: 'Məktəb uğurla silindi' };
  } catch (error) {
    console.error('Məktəb silmə xətası:', error);
    throw error;
  }
};

// Məktəb admin email-ini əldə etmək üçün metod
export const fetchSchoolAdminEmail = async (schoolId: string): Promise<string | null> => {
  try {
    // 1. Məktəbin adminini user_roles cədvəlindən tapaq
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('school_id', schoolId)
      .eq('role', 'schooladmin');
    
    if (rolesError) {
      console.error('Məktəb admin rolları sorğusunda xəta:', rolesError);
      return null;
    }
    
    if (!roles || roles.length === 0) {
      console.log(`Məktəb ${schoolId} üçün admin tapılmadı`);
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
    console.error('Məktəb admin email-ini əldə etmə xətası:', error);
    return null;
  }
};
