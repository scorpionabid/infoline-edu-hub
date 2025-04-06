
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
  try {
    console.log(`callAssignSectorAdminFunction başladı: userId=${userId}, sectorId=${sectorId}`);
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

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
    
    console.log("İstifadəçi məlumatları alındı:", userData);
    
    // Email məlumatını əldə edək
    const { data: emailData, error: emailError } = await supabase
      .from("auth")
      .select("email")
      .eq("id", userId)
      .single();
    
    let userEmail = userData.email;
    
    // Əgər profile email yoxdursa, auth cədvəlindən əldə etməyə çalış
    if (!userEmail && emailData && emailData.email) {
      userEmail = emailData.email;
    }
    
    if (!userEmail) {
      console.warn("İstifadəçi email məlumatı tapılmadı, email olmadan davam edilir");
    } else {
      console.log("İstifadəçi email məlumatı alındı:", userEmail);
    }
    
    // Sektor məlumatlarını yoxla
    const { data: sectorData, error: sectorError } = await supabase
      .from("sectors")
      .select("*")
      .eq("id", sectorId)
      .single();
      
    if (sectorError) {
      console.error("Sektor məlumatı əldə edilərkən xəta:", sectorError);
      return {
        success: false,
        error: "Sektor tapılmadı"
      };
    }
    
    console.log("Sektor məlumatları alındı:", sectorData);
    
    // 1. user_roles cədvəlinə sektor admin rolu əlavə et
    const { error: rolError } = await supabase
      .from("user_roles")
      .upsert({
        user_id: userId,
        role: "sectoradmin",
        sector_id: sectorId,
        region_id: sectorData.region_id,
        updated_at: new Date().toISOString()
      });
      
    if (rolError) {
      console.error("Rol təyin edilərkən xəta:", rolError);
      return {
        success: false,
        error: "İstifadəçiyə sektor admin rolu təyin edilərkən xəta baş verdi"
      };
    }
    
    console.log("İstifadəçiyə sectoradmin rolu təyin edildi");
    
    // 2. Sektor cədvəlini yenilə - admin_id və admin_email ilə
    const { error: updateError } = await supabase
      .from("sectors")
      .update({
        admin_id: userId,
        admin_email: userEmail || null,
        updated_at: new Date().toISOString()
      })
      .eq("id", sectorId);
      
    if (updateError) {
      console.error('Sektor yeniləmə xətası:', updateError);
      
      // Xəta olduqda, rol təyinatını geri qaytaraq
      await supabase
        .from("user_roles")
        .delete()
        .match({ user_id: userId, role: "sectoradmin" });
        
      return {
        success: false,
        error: updateError.message || "Sektor yeniləməsi baş tutmadı"
      };
    }

    console.log("Sektor uğurla yeniləndi, admin təyin edildi");
    return { 
      success: true, 
      data: {
        sector: sectorData.name,
        userId,
        email: userEmail
      } 
    };
  } catch (error) {
    console.error('Sektor admin təyin etmə xətası:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Sektor admini təyin edilərkən xəta baş verdi" 
    };
  }
}
