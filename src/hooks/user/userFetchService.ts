
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';
import { fetchAdminEntityData, formatUserData } from './useUserData';

// Mövcud istifadəçiləri əldə etmək üçün servis
export async function fetchAvailableUsersService() {
  try {
    console.log('İstifadəçiləri əldə etmə servisində...');
    
    // 1. İstifadəçi rollarını əldə edək
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("*");
      
    if (roleError) {
      console.error('İstifadəçi rollarını əldə edərkən xəta:', roleError);
      return { 
        error: roleError,
        users: [] 
      };
    }
    
    console.log(`${roleData?.length || 0} istifadəçi rolu tapıldı:`, roleData);
    
    // İstifadəçi ID-lərini toplayaq
    const userIds = roleData.map(role => role.user_id);
    
    // 2. Profil məlumatlarını əldə edək
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .in("id", userIds.length > 0 ? userIds : ['00000000-0000-0000-0000-000000000000']); // Boş array problemi
    
    if (profilesError) {
      console.error('Profil məlumatlarını əldə edərkən xəta:', profilesError);
      return { 
        error: profilesError,
        users: [] 
      };
    }
    
    console.log(`${profilesData?.length || 0} profil tapıldı`);
    
    // 3. E-poçt məlumatlarını əldə edək - yalnız userIds varsa
    let emailsData = [];
    let emailsError = null;
    
    if (userIds.length > 0) {
      const emailResult = await supabase.rpc(
        'get_user_emails_by_ids',
        { user_ids: userIds }
      );
      
      emailsData = emailResult.data || [];
      emailsError = emailResult.error;
      
      if (emailsError) {
        console.error('Email məlumatlarını əldə edərkən xəta:', emailsError);
      }
    }
    
    console.log(`${emailsData?.length || 0} email tapıldı`);
    
    // Profil məlumatlarını ID-yə görə map edək
    const profilesMap: Record<string, any> = {};
    if (profilesData) {
      profilesData.forEach(profile => {
        profilesMap[profile.id] = profile;
      });
    }
    
    // Email məlumatlarını ID-yə görə map edək
    const emailMap: Record<string, string> = {};
    if (emailsData && Array.isArray(emailsData)) {
      emailsData.forEach((item: any) => {
        if (item && item.id) {
          emailMap[item.id] = item.email;
        }
      });
    }
    
    // Admin entity məlumatlarını əldə et - yalnız valid roleData varsa
    if (!roleData || roleData.length === 0) {
      console.log('İstifadəçi rolu tapılmadı, boş siyahı qaytarılır');
      return { users: [] };
    }
    
    const adminEntityPromises = roleData.map(async (role: any) => {
      if (!role || !role.user_id) return null;
      
      const modifiedUser = { 
        ...role, 
        id: role.user_id,
        email: emailMap[role.user_id] || 'N/A'
      };
      return await fetchAdminEntityData(modifiedUser);
    });
    
    const adminEntities = await Promise.all(adminEntityPromises);
    const validAdminEntities = adminEntities.filter(entity => entity !== null);
    
    // İstifadəçiləri formatlaşdıraq
    const formattedUsers = formatUserData(
      roleData.filter(role => !!role && !!role.user_id).map(role => ({ ...role, id: role.user_id })), 
      profilesMap, 
      validAdminEntities
    );
    
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
