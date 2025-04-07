
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';
import { fetchAdminEntityData, formatUserData } from './useUserData';

// Mövcud istifadəçiləri əldə etmək üçün servis
export async function fetchAvailableUsersService() {
  try {
    console.log('İstifadəçiləri əldə etmə servisində...');
    
    // İlk olaraq mövcud admin rollarını əldə edək 
    // və filter üçün istifadəçi ID-lərini alaq
    const { data: existingAdmins, error: adminsError } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .in('role', ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin']);
      
    if (adminsError) {
      console.error("Mövcud adminləri əldə edərkən xəta:", adminsError);
      return { 
        error: new Error(`Mövcud adminlər əldə edilə bilmədi: ${adminsError.message}`),
        users: [] 
      };
    }
    
    // Admin olan istifadəçilərin ID-lərini toplayaq
    const adminUserIds = existingAdmins?.map(admin => admin.user_id) || [];
    console.log(`${adminUserIds.length} mövcud admin tapıldı, bunlar filtrlənəcək`);
    
    // Auth sistemindən bütün istifadəçiləri əldə edək
    // Edge funksiyasını çağıraq
    const { data: allUsersData, error: allUsersError } = await supabase.functions.invoke('get_all_users_with_roles');
    
    if (allUsersError) {
      console.error("Bütün istifadəçiləri əldə edərkən xəta:", allUsersError);
      
      // Edge function xəta verərsə, local əməliyyata keçirik
      // Profil məlumatlarını əldə edək
      console.log("Edge function xəta verdi, profil məlumatlarını bilavasitə əldə etməyə çalışırıq...");
      
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
      
      // Admin olmayan profilləri filtrləyək
      const availableProfiles = profilesData.filter(profile => 
        !adminUserIds.includes(profile.id)
      );
      
      console.log(`${availableProfiles.length} potensial istifadəçi filtrləndi`);
      
      // FullUserData formatına çeviririk
      const formattedUsers = availableProfiles.map(profile => {
        return {
          id: profile.id,
          email: profile.email || `user-${profile.id.substring(0, 6)}@example.com`,
          full_name: profile.full_name || 'İsimsiz İstifadəçi',
          role: 'user',
          region_id: null,
          sector_id: null,
          school_id: null,
          phone: profile.phone,
          position: profile.position,
          language: profile.language || 'az',
          avatar: profile.avatar,
          status: profile.status || 'active',
          last_login: profile.last_login,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          
          // JavaScript/React tərəfində istifadə üçün CamelCase əlavə edir
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
          
          // Admin olmadığı üçün boşdur
          adminEntity: null
        } as FullUserData;
      });
      
      console.log(`${formattedUsers.length} istifadəçi hazırdır`);
      return { users: formattedUsers };
    }
    
    // Əgər edge function uğurlu olsa, qaytarılan datanı istifadə edək
    if (!allUsersData || !allUsersData.users || allUsersData.users.length === 0) {
      console.log('İstifadəçi tapılmadı (edge function)');
      return { users: [] };
    }
    
    console.log(`Edge funksiyasından ${allUsersData.users.length} istifadəçi əldə edildi`);
    
    // Admin olmayan istifadəçiləri filtrləyək
    const availableUsers = allUsersData.users.filter(user => 
      !adminUserIds.includes(user.id) && 
      user.role !== 'superadmin' && 
      user.role !== 'regionadmin' && 
      user.role !== 'sectoradmin' && 
      user.role !== 'schooladmin'
    );
    
    console.log(`${availableUsers.length} istifadəçi admin olmadığı üçün seçildi`);
    
    // İstifadəçi məlumatlarını formatlandıraq
    const formattedUsers = availableUsers.map(user => {
      return {
        id: user.id,
        email: user.email,
        full_name: user.full_name || 'İsimsiz İstifadəçi',
        role: user.role || 'user',
        region_id: user.region_id,
        sector_id: user.sector_id,
        school_id: user.school_id,
        phone: user.phone,
        position: user.position,
        language: user.language || 'az',
        avatar: user.avatar,
        status: user.status || 'active',
        last_login: user.last_login,
        created_at: user.created_at,
        updated_at: user.updated_at,
        
        // JavaScript/React tərəfində istifadə üçün CamelCase əlavə edir
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        
        // Admin olmadığı üçün boşdur
        adminEntity: null
      } as FullUserData;
    });
    
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
