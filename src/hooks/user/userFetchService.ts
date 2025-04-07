
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';
import { fetchAdminEntityData, formatUserData } from './useUserData';

// Mövcud istifadəçiləri əldə etmək üçün servis
export async function fetchAvailableUsersService() {
  try {
    console.log('İstifadəçiləri əldə etmə servisində...');
    
    // Mövcud adminləri əldə edək - bunlar filtrələnəcək
    const { data: existingAdmins, error: adminsError } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .in('role', ['superadmin', 'sectoradmin', 'regionadmin']);
      
    if (adminsError) {
      console.error("Mövcud adminləri əldə edərkən xəta:", adminsError);
      return { 
        error: new Error("Mövcud adminləri əldə edilə bilmədi: " + adminsError.message),
        users: [] 
      };
    }
    
    // Mövcud adminlərin ID-lərini saxlayaq
    const existingAdminIds = existingAdmins.map(admin => admin.user_id);
    console.log(`${existingAdminIds.length} mövcud admin tapıldı, bunlar filtrlənəcək`);
    
    // User roles tablosundan bütün istifadəçiləri əldə edək
    const { data: userRolesData, error: userRolesError } = await supabase
      .from('user_roles')
      .select('*');
      
    if (userRolesError) {
      console.error("User roles əldə edilərkən xəta:", userRolesError);
      return { 
        error: new Error("User roles əldə edilə bilmədi: " + userRolesError.message),
        users: [] 
      };
    }
    
    // Admin olmayan (və ya sadəcə schooladmin olan) istifadəçiləri filtirləyək
    const filteredUserRoles = userRolesData.filter(userRole => 
      !existingAdminIds.includes(userRole.user_id) || 
      (userRole.role === 'schooladmin' && !userRole.sector_id)
    );
    
    console.log(`${userRolesData.length} istifadəçidən ${filteredUserRoles.length} uyğun istifadəçi filterləndi`);
    
    if (filteredUserRoles.length === 0) {
      return { users: [] };
    }
    
    // İstifadəçi ID-lərini alaq
    const userIds = filteredUserRoles.map(ur => ur.user_id);
    
    // Profil məlumatlarını əldə edək
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);
      
    if (profilesError) {
      console.error("Profiles əldə edilərkən xəta:", profilesError);
      return { 
        error: new Error("Profiles əldə edilə bilmədi: " + profilesError.message),
        users: [] 
      };
    }
    
    // Profil məlumatlarını map formatına keçirək
    const profilesMap = {};
    if (profilesData) {
      profilesData.forEach(profile => {
        profilesMap[profile.id] = profile;
      });
    }
    
    // Email məlumatlarını əldə edək
    const { data: emailsData } = await supabase.rpc('get_user_emails_by_ids', { user_ids: userIds });
    
    // Email-ləri map formatına keçirək
    const emailMap = {};
    if (emailsData) {
      emailsData.forEach((item: any) => {
        emailMap[item.id] = item.email;
      });
    }
    
    // Admin entity məlumatlarını əldə edək
    const adminEntityPromises = filteredUserRoles.map(async (roleItem) => {
      return await fetchAdminEntityData(roleItem);
    });
    
    const adminEntities = await Promise.all(adminEntityPromises);
    
    // Formatlanmış istifadəçiləri yaradaq
    const formattedUsers = formatUserData(filteredUserRoles, profilesMap, adminEntities);
    
    console.log(`${formattedUsers.length} istifadəçi tam formatlandı və hazırdır`);
    
    return { users: formattedUsers };
  } catch (err) {
    console.error('İstifadəçi sorğusu servisində xəta:', err);
    return { 
      error: err instanceof Error ? err : new Error('İstifadəçilər yüklənərkən xəta baş verdi'),
      users: [] 
    };
  }
}
