
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';
import { fetchAdminEntityData, formatUserData } from './useUserData';

export async function fetchAvailableUsersService() {
  try {
    console.log('İstifadəçiləri əldə etmə servisində...');
    
    // 1. Edge funksiyası vasitəsilə bütün istifadəçiləri əldə et
    const { data, error } = await supabase.functions.invoke('get_all_users_with_roles');
    
    if (error) {
      console.error('Edge funksiyası xətası:', error);
      return { 
        error: new Error(`İstifadəçiləri əldə edərkən xəta: ${error.message}`),
        users: [] 
      };
    }
    
    if (!data || !data.users || data.users.length === 0) {
      console.log('Heç bir istifadəçi tapılmadı');
      return { users: [] };
    }
    
    const userData = data.users;
    console.log(`${userData.length} istifadəçi tapıldı`, userData);
    
    // İstifadəçi ID-lərini toplayaq
    const userIds = userData.map((user: any) => user.id);
    
    // 2. profiles cədvəlindən məlumatları alaq
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);
    
    if (profilesError) {
      return { 
        error: profilesError,
        users: [] 
      };
    }
    
    console.log(`${profilesData?.length || 0} profil tapıldı`);
    
    // Profil məlumatlarını ID-yə görə map edək
    const profilesMap: Record<string, any> = {};
    if (profilesData) {
      profilesData.forEach(profile => {
        profilesMap[profile.id] = profile;
      });
    }
    
    // Admin entity məlumatlarını əldə et
    const adminEntityPromises = userData.map(async (user: any) => {
      return await fetchAdminEntityData(user);
    });
    
    const adminEntities = await Promise.all(adminEntityPromises);
    
    // Tam istifadəçi məlumatlarını formatlaşdır
    const formattedUsers = formatUserData(userData, profilesMap, adminEntities);
    
    console.log(`${formattedUsers.length} istifadəçi formatlandı`);
    return { users: formattedUsers };
    
  } catch (err) {
    console.error('İstifadəçi sorğusu servisində xəta:', err);
    return { 
      error: err instanceof Error ? err : new Error('İstifadəçilər yüklənərkən xəta baş verdi'),
      users: [] 
    };
  }
}
