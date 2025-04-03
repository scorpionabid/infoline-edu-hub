
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
    if (userData) {
      const fullUserData: FullUserData = {
        id: userData.id || userId,
        email: userData.email || '',
        full_name: userData.full_name || '',
        name: userData.full_name || userData.name || '',
        role: userData.role || 'schooladmin',
        regionId: userData.region_id || null,
        sectorId: userData.sector_id || null,
        schoolId: userData.school_id || null,
        phone: userData.phone || '',
        position: userData.position || '',
        language: userData.language || 'az',
        status: userData.status || 'active',
        avatar: userData.avatar || null,
        last_login: userData.last_login || null,
        created_at: userData.created_at || '',
        updated_at: userData.updated_at || '',
        region_id: userData.region_id || null,
        sector_id: userData.sector_id || null,
        school_id: userData.school_id || null,
        createdAt: userData.created_at || '',
        updatedAt: userData.updated_at || '',
        lastLogin: userData.last_login || null
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
