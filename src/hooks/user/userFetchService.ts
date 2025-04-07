
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';
import { fetchAdminEntityData, formatUserData } from './useUserData';

// Mövcud istifadəçiləri əldə etmək üçün servis
export async function fetchAvailableUsersService() {
  try {
    console.log('İstifadəçiləri əldə etmə servisində...');
    
    // Birinci, bütün profilləri əldə edək
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
      
    if (profilesError) {
      console.error("Profil məlumatlarını əldə edərkən xəta:", profilesError);
      return { 
        error: new Error(`Profil məlumatları əldə edilə bilmədi: ${profilesError.message}`),
        users: [] 
      };
    }
    
    if (!profilesData || profilesData.length === 0) {
      console.log('Heç bir profil tapılmadı');
      return { users: [] };
    }
    
    // İkinci, mövcud admin rollarını əldə edək
    const { data: existingAdmins, error: adminsError } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .in('role', ['superadmin', 'regionadmin', 'sectoradmin']);
      
    if (adminsError) {
      console.error("Mövcud adminləri əldə edərkən xəta:", adminsError);
      return { 
        error: new Error(`Mövcud adminlər əldə edilə bilmədi: ${adminsError.message}`),
        users: [] 
      };
    }
    
    // Admin olmayan profilləri filtrləyək
    const adminUserIds = existingAdmins.map(admin => admin.user_id);
    console.log(`${adminUserIds.length} mövcud admin tapıldı, bunlar filtrlənəcək`);
    
    // Bütün user_roles məlumatlarını əldə edək (rolsuz istifadəçiləri də saxlamaq üçün)
    const { data: userRolesData, error: userRolesError } = await supabase
      .from('user_roles')
      .select('*');
    
    if (userRolesError) {
      console.error("User roles məlumatları əldə edilərkən xəta:", userRolesError);
      return { 
        error: new Error(`User roles məlumatları əldə edilə bilmədi: ${userRolesError.message}`),
        users: [] 
      };
    }
    
    // Profilləri və rolları birləşdirək
    // Admin olmayan və ya rolsuz olan istifadəçiləri seçək
    const availableUserIds = profilesData
      .filter(profile => !adminUserIds.includes(profile.id))
      .map(profile => profile.id);
    
    console.log(`${availableUserIds.length} potensial istifadəçi filtrləndi`);
    
    // User roles və profileri birləşdirək
    const combinedUserData = [];
    
    for (const userId of availableUserIds) {
      // Profil məlumatını tap
      const profile = profilesData.find(p => p.id === userId);
      if (!profile) continue;
      
      // İstifadəçi rolunu tap (varsa)
      const userRole = userRolesData.find(ur => ur.user_id === userId) || {
        user_id: userId,
        role: 'user', // default rol
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      combinedUserData.push({
        id: userId,
        ...profile,
        ...userRole
      });
    }
    
    console.log(`${combinedUserData.length} istifadəçi məlumatları birləşdirildi`);
    
    // Email məlumatlarını əldə edək
    const { data: emailsData } = await supabase.rpc('get_user_emails_by_ids', { 
      user_ids: availableUserIds 
    });
    
    // Email-ləri map formatına keçirək
    const emailMap = {};
    if (emailsData) {
      emailsData.forEach((item: { id: string, email: string }) => {
        emailMap[item.id] = item.email;
      });
    }
    
    // Admin entity məlumatlarını əldə edək (əgər varsa)
    const adminEntityPromises = combinedUserData.map(async (userData) => {
      return await fetchAdminEntityData(userData);
    });
    
    const adminEntities = await Promise.all(adminEntityPromises);
    
    // Profilləri map formatına keçirək
    const profilesMap = {};
    profilesData.forEach(profile => {
      profilesMap[profile.id] = profile;
    });
    
    // Formatlanmış istifadəçiləri yaradaq
    const formattedUsers = formatUserData(combinedUserData, profilesMap, adminEntities);
    
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
