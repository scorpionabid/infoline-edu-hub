
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';
import { fetchAdminEntityData, formatUserData } from './useUserData';

// Mövcud istifadəçiləri əldə etmək üçün servis
export async function fetchAvailableUsersService() {
  try {
    console.log('İstifadəçiləri əldə etmə servisində...');
    
    // Cari sessiyadan JWT tokeni əldə et
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
    
    // Service key ilə işləyən edge funksiyası çağırılır
    const response = await fetch(`https://olbfnauhzpdskqnxtwav.supabase.co/functions/v1/get_all_users_with_roles`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('Edge funksiya xətası:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return { 
        error: new Error(`Edge funksiya xətası: ${response.status} ${response.statusText}`),
        users: [] 
      };
    }
    
    const data = await response.json();
    
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
