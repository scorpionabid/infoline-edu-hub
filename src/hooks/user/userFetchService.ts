
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';
import { fetchAdminEntityData, formatUserData } from './useUserData';

// Mövcud istifadəçiləri əldə etmək üçün servis
export async function fetchAvailableUsersService() {
  try {
    console.log('İstifadəçiləri əldə etmə servisində...');
    
    // get_all_users_with_roles edge funksiyasını çağırır
    const { data, error } = await supabase.functions.invoke('get_all_users_with_roles');
    
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
    
    // İstifadəçiləri formatlaşdıraq və qaytaraq
    return { users: data.users as FullUserData[] };
  } catch (err) {
    console.error('İstifadəçi sorğusu servisində xəta:', err);
    return { 
      error: err instanceof Error ? err : new Error('İstifadəçilər yüklənərkən xəta baş verdi'),
      users: [] 
    };
  }
}
