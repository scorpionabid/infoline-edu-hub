
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
    
    // Əldə edilmiş tam məlumatı qaytarırıq
    return userData as FullUserData;
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
      const userRole = roles.find(role => role.user_id === profile.id);
      const email = emails?.find(e => e.id === profile.id)?.email || '';
      
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
        notificationSettings: {
          email: true,
          system: true
        },
        twoFactorEnabled: false,
        aud: 'authenticated'
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
