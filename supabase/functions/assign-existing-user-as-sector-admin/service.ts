
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { supabaseUrl, supabaseServiceRoleKey } from "./config.ts";

/**
 * Sektor admini təyin etmək üçün SQL funksiyasını çağırır
 * @param userId İstifadəçi ID
 * @param sectorId Sektor ID
 * @returns SQL funksiyasının nəticəsi
 */
export async function callAssignSectorAdminFunction(userId: string, sectorId: string): Promise<{ 
  success: boolean; 
  error?: string;
  data?: any;
}> {
  try {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("Server konfiqurasiyası xətası: URL və ya Service Key mövcud deyil");
      return { success: false, error: "Server konfigurasiyası xətası" };
    }

    console.log(`Sektor admin təyin etmə funksiyası çağırılır: userId=${userId}, sectorId=${sectorId}`);
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
    // SQL funksiyasını çağır
    const { data, error } = await supabase.rpc(
      'assign_sector_admin',
      {
        user_id_param: userId,
        sector_id_param: sectorId
      }
    );
    
    if (error) {
      console.error("SQL funksiya xətası:", error);
      return { success: false, error: error.message };
    }
    
    console.log("SQL funksiyası uğurla yerinə yetirildi:", data);
    return { success: true, data };
    
  } catch (error) {
    console.error("SQL funksiyası çağırılarkən xəta:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "SQL funksiyası çağırılarkən gözlənilməz xəta"
    };
  }
}
