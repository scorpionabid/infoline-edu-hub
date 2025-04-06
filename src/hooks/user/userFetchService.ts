
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';
import { fetchAdminEntityData, formatUserData } from './useUserData';

// Mövcud istifadəçiləri əldə etmək üçün servis
export async function fetchAvailableUsersService() {
  try {
    console.log('İstifadəçiləri əldə etmə servisində...');
    
    // 1. Əvvəlcə edge funksiyası vasitəsilə bütün istifadəçiləri əldə etməyə çalışırıq
    try {
      const { data, error } = await supabase.functions.invoke('get_all_users_with_roles');
      
      if (error) {
        console.error('Edge funksiyası xətası:', error);
        throw new Error(`İstifadəçiləri əldə edərkən xəta: ${error.message}`);
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
    } catch (edgeError) {
      // Edge funksiyası xəta verərsə, alternatif yolla əldə etməyə çalışırıq
      console.warn('Edge funksiyası xətası baş verdi, birbaşa sorğu istifadə ediləcək:', edgeError);
      
      // Birbaşa user_roles cədvəlindən əldə etməyə çalışırıq
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*');
        
      if (roleError) {
        console.error('İstifadəçi rollarını əldə edərkən xəta:', roleError);
        return { 
          error: roleError,
          users: [] 
        };
      }
      
      // Burada sadəcə rol məlumatlarına əsaslanaraq istifadəçiləri formatlaşdırırıq
      const userData = roleData || [];
      const userIds = userData.map(user => user.user_id);
      
      // profiles cədvəlindən məlumatları alaq
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
      
      // Profil məlumatlarını ID-yə görə map edək
      const profilesMap: Record<string, any> = {};
      if (profilesData) {
        profilesData.forEach(profile => {
          profilesMap[profile.id] = profile;
        });
      }
      
      // E-poçt məlumatlarını əldə etməyə çalışırıq
      const { data: emailsData } = await supabase.rpc('get_user_emails_by_ids', { user_ids: userIds });
      
      const emailMap: Record<string, string> = {};
      if (emailsData) {
        emailsData.forEach((item: any) => {
          emailMap[item.id] = item.email;
        });
      }
      
      // Admin entity məlumatlarını əldə et
      const adminEntityPromises = userData.map(async (user: any) => {
        const modifiedUser = { 
          ...user, 
          id: user.user_id,
          email: emailMap[user.user_id] || 'N/A'
        };
        return await fetchAdminEntityData(modifiedUser);
      });
      
      const adminEntities = await Promise.all(adminEntityPromises);
      
      // İstifadəçiləri formatlaşdıraq
      const formattedUsers = userData.map((user, index) => {
        const profile = profilesMap[user.user_id] || {};
        const now = new Date().toISOString();
        
        return {
          id: user.user_id,
          email: emailMap[user.user_id] || 'N/A',
          full_name: profile.full_name || 'İsimsiz İstifadəçi',
          role: user.role,
          region_id: user.region_id,
          sector_id: user.sector_id,
          school_id: user.school_id,
          phone: profile.phone,
          position: profile.position,
          language: profile.language || 'az',
          avatar: profile.avatar,
          status: profile.status || 'active',
          last_login: profile.last_login,
          created_at: profile.created_at || now,
          updated_at: profile.updated_at || now,
          
          name: profile.full_name || 'İsimsiz İstifadəçi',
          regionId: user.region_id,
          sectorId: user.sector_id,
          schoolId: user.school_id,
          lastLogin: profile.last_login,
          createdAt: profile.created_at || now,
          updatedAt: profile.updated_at || now,
          
          adminEntity: adminEntities[index],
          
          twoFactorEnabled: false,
          notificationSettings: {
            email: true,
            system: true
          }
        } as FullUserData;
      });
      
      return { users: formattedUsers };
    }
  } catch (err) {
    console.error('İstifadəçi sorğusu servisində xəta:', err);
    return { 
      error: err instanceof Error ? err : new Error('İstifadəçilər yüklənərkən xəta baş verdi'),
      users: [] 
    };
  }
}
