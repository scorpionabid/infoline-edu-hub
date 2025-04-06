
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { supabaseUrl, supabaseServiceRoleKey } from "./config.ts";

/**
 * SQL assign_sector_admin funksiyasını çağırır
 * @param userId İstifadəçi ID
 * @param sectorId Sektor ID
 * @returns SQL funksiya nəticəsi
 */
export async function callAssignSectorAdminFunction(userId: string, sectorId: string): Promise<{ 
  success: boolean; 
  data?: any; 
  error?: string;
}> {
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log(`SQL funksiyası çağırılır: assign_sector_admin(${userId}, ${sectorId})`);
  
  try {
    // Əvvəlcə istifadəçi və sektor məlumatlarını əldə edək
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
      
    if (userError) {
      console.error("İstifadəçi məlumatı əldə edilərkən xəta:", userError);
      return {
        success: false,
        error: "İstifadəçi tapılmadı"
      };
    }
    
    // Email məlumatını əldə edək
    const { data: emailData, error: emailError } = await supabase.rpc(
      'get_user_emails_by_ids',
      { user_ids: [userId] }
    );
    
    const userEmail = emailData && emailData.length > 0 ? emailData[0].email : null;
    
    if (emailError || !userEmail) {
      console.error("İstifadəçi email məlumatı əldə edilərkən xəta:", emailError);
      return {
        success: false,
        error: "İstifadəçi email məlumatı tapılmadı"
      };
    }
    
    // SQL funksiyasını çağır - parametr adlarını dəqiq uyğunlaşdırırıq
    const { data, error } = await supabase.rpc(
      'assign_sector_admin',
      {
        user_id_param: userId,
        sector_id_param: sectorId
      }
    );

    console.log('SQL funksiyası nəticəsi:', data, error);

    if (error) {
      console.error('Sektor admin təyin etmə xətası:', error);
      return { 
        success: false, 
        error: error.message || "Sektor admini təyin edilərkən xəta baş verdi" 
      };
    }

    // SQL funksiyasından qaytarılan nəticənin success olmasını yoxlayırıq
    if (data && typeof data === 'object' && 'success' in data && !data.success) {
      console.error('SQL funksiyası xətası:', data.error || 'Naməlum xəta');
      return { 
        success: false, 
        error: data.error || "Sektor admini təyin edilərkən xəta baş verdi" 
      };
    }
    
    // Uğurlu olduqda, sektoru yeniləyək - admin_id və admin_email ilə
    const { error: updateError } = await supabase
      .from("sectors")
      .update({
        admin_id: userId,
        admin_email: userEmail,
        updated_at: new Date().toISOString()
      })
      .eq("id", sectorId);
      
    if (updateError) {
      console.error('Sektor yeniləmə xətası:', updateError);
      return {
        success: false,
        error: updateError.message || "Sektor yeniləməsi baş tutmadı"
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Sektor admin təyin etmə xətası:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Sektor admini təyin edilərkən xəta baş verdi" 
    };
  }
}
