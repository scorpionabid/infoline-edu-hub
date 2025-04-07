
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';
import { fetchAdminEntityData, formatUserData } from './useUserData';

// Mövcud istifadəçiləri əldə etmək üçün servis
export async function fetchAvailableUsersService() {
  try {
    console.log('İstifadəçiləri əldə etmə servisində...');
    
    // Cari JWT tokeni əldə et
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Sessiya əldə edilərkən xəta:", sessionError);
      return { 
        error: new Error("Sessiya əldə edilə bilmədi: " + sessionError.message),
        users: [] 
      };
    }
    
    if (!sessionData.session) {
      console.error("Aktiv istifadəçi sesiyası tapılmadı");
      return { 
        error: new Error("Avtorizasiya xətası - aktiv sessiya tapılmadı"),
        users: [] 
      };
    }
    
    const accessToken = sessionData.session.access_token;
    console.log("JWT token mövcuddur, uzunluq:", accessToken.length);
    console.log("JWT token başlanğıcı:", accessToken.substring(0, 20) + "...");
    
    // get_all_users_with_roles edge funksiyasını çağırır 
    const { data, error } = await supabase.functions.invoke('get_all_users_with_roles', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (error) {
      console.error('İstifadəçiləri əldə edərkən edge funksiya xətası:', error);
      return { 
        error,
        users: [] 
      };
    }
    
    if (!data || !data.users || !Array.isArray(data.users)) {
      console.error('Edge funksiyasından qayıdan cavab düzgün formatda deyil:', data);
      return { 
        error: new Error('Server cavabı düzgün formatda deyil'),
        users: [] 
      };
    }
    
    console.log(`${data.users.length} istifadəçi edge funksiyasından əldə edildi`);
    
    // İstifadəçiləri filterləyək - superadminlər və sektor adminləri olmasın
    const filteredUsers = data.users.filter(user => {
      // Superadminləri çıxar
      if (user.role === 'superadmin') return false;
      
      // Mövcud sektor adminlərini çıxar
      if (user.role === 'sectoradmin' && user.sector_id) return false;
      
      // Region adminlərini çıxar (region admini digər region admini ola bilməz)
      if (user.role === 'regionadmin') return false;
      
      return true;
    });
    
    console.log(`${filteredUsers.length} istifadəçi filterləndi və hazırdır`);
    
    // İstifadəçiləri formatlaşdıraq və qaytaraq
    return { users: filteredUsers as FullUserData[] };
  } catch (err) {
    console.error('İstifadəçi sorğusu servisində xəta:', err);
    return { 
      error: err instanceof Error ? err : new Error('İstifadəçilər yüklənərkən xəta baş verdi'),
      users: [] 
    };
  }
}
