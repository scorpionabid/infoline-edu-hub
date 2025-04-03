
import { FullUserData } from "@/types/supabase";
import { supabase } from "@/integrations/supabase/client";

// İstifadəçi məlumatlarını əldə etmək üçün funksiya
export async function fetchUserData(userId: string): Promise<FullUserData | null> {
  try {
    // Full user data'nı əldə edirik
    const { data: userData, error: userError } = await supabase
      .rpc('get_full_user_data', { user_id_param: userId });
    
    if (userError) {
      console.error('İstifadəçi məlumatı əldə edilərkən xəta baş verdi:', userError);
      return null;
    }
    
    // Tipləri əgər doğrulaya bilmirsə, manual təyin edirik
    if (userData && typeof userData === 'object') {
      const fullUserData: FullUserData = {
        id: userId,
        email: typeof userData.email === 'string' ? userData.email : '',
        full_name: typeof userData.full_name === 'string' ? userData.full_name : '',
        name: typeof userData.full_name === 'string' ? userData.full_name : 
              typeof userData.name === 'string' ? userData.name : '',
        role: typeof userData.role === 'string' ? userData.role as any : 'schooladmin',
        regionId: typeof userData.region_id === 'string' ? userData.region_id : null,
        sectorId: typeof userData.sector_id === 'string' ? userData.sector_id : null,
        schoolId: typeof userData.school_id === 'string' ? userData.school_id : null,
        phone: typeof userData.phone === 'string' ? userData.phone : '',
        position: typeof userData.position === 'string' ? userData.position : '',
        language: typeof userData.language === 'string' ? userData.language : 'az',
        status: typeof userData.status === 'string' ? userData.status : 'active',
        avatar: typeof userData.avatar === 'string' ? userData.avatar : null,
        last_login: typeof userData.last_login === 'string' ? userData.last_login : null,
        created_at: typeof userData.created_at === 'string' ? userData.created_at : '',
        updated_at: typeof userData.updated_at === 'string' ? userData.updated_at : '',
        region_id: typeof userData.region_id === 'string' ? userData.region_id : null,
        sector_id: typeof userData.sector_id === 'string' ? userData.sector_id : null,
        school_id: typeof userData.school_id === 'string' ? userData.school_id : null,
        createdAt: typeof userData.created_at === 'string' ? userData.created_at : '',
        updatedAt: typeof userData.updated_at === 'string' ? userData.updated_at : '',
        lastLogin: typeof userData.last_login === 'string' ? userData.last_login : null
      };
      return fullUserData;
    }
    
    return null;
  } catch (error) {
    console.error('İstifadəçi məlumatı əldə edilərkən xəta baş verdi:', error);
    return null;
  }
}

// İstifadəçilərin siyahısını əldə etmək üçün funksiya
export async function fetchAllUsers(): Promise<FullUserData[]> {
  try {
    // İstifadəçilərin müxtəlif atributlarını əldə edirik
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesError) {
      throw profilesError;
    }
    
    // User roles cədvəlindən rol məlumatlarını əldə edirik
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*');
      
    if (rolesError) {
      throw rolesError;
    }
    
    // Auth istifadəçilərinin email məlumatlarını əldə etmək üçün funksiya çağırırıq
    const userIds = profiles.map(profile => profile.id);
    const { data: emails, error: emailsError } = await supabase
      .rpc('get_user_emails_by_ids', { user_ids: userIds });
      
    if (emailsError) {
      throw emailsError;
    }
    
    // Məlumatları birləşdiririk
    const users: FullUserData[] = profiles.map(profile => {
      const userRole = roles?.find(role => role.user_id === profile.id);
      const emailData = emails?.find(e => e.id === profile.id);
      const email = emailData && typeof emailData === 'object' && 'email' in emailData ? 
                    emailData.email as string : '';
      
      return {
        id: profile.id,
        email,
        full_name: profile.full_name,
        name: profile.full_name,
        role: userRole?.role || 'schooladmin',
        regionId: userRole?.region_id || null,
        sectorId: userRole?.sector_id || null,
        schoolId: userRole?.school_id || null,
        phone: profile.phone || '',
        position: profile.position || '',
        language: profile.language || 'az',
        avatar: profile.avatar || null,
        status: profile.status || 'active',
        last_login: profile.last_login || null,
        created_at: profile.created_at || '',
        updated_at: profile.updated_at || '',
        region_id: userRole?.region_id || null,
        sector_id: userRole?.sector_id || null,
        school_id: userRole?.school_id || null,
        createdAt: profile.created_at || '',
        updatedAt: profile.updated_at || '',
        lastLogin: profile.last_login || null,
        twoFactorEnabled: false,
        notificationSettings: {
          email: true,
          system: true
        }
      };
    });
    
    return users;
  } catch (error) {
    console.error('İstifadəçi məlumatları əldə edilərkən xəta baş verdi:', error);
    return [];
  }
}

// Exported alias for compatibility
export const getUserData = fetchUserData;
