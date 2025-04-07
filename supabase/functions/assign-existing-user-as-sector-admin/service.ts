
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { supabaseUrl } from "./config.ts";

export async function callAssignSectorAdminFunction(userId: string, sectorId: string) {
  try {
    console.log(`callAssignSectorAdminFunction çağırıldı - User ID: ${userId}, Sector ID: ${sectorId}`);
    
    // Parametrləri yoxla
    if (!userId || !sectorId) {
      console.error("Əskik parametrlər:", { userId, sectorId });
      const errorMessage = !userId ? "İstifadəçi ID təyin edilməyib" : "Sektor ID təyin edilməyib";
      return { success: false, error: errorMessage };
    }
    
    // SUPABASE_SERVICE_ROLE_KEY-i Deno.env-dən al
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("Server konfiqurasiyası xətası: URL veya ServiceRoleKey yoxdur");
      return {
        success: false,
        error: "Server konfigurasiyası xətası"
      };
    }
    
    // Supabase service client yaradırıq
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
    console.log("Supabase client yaradıldı, user_roles cədvəlinə sorğu göndərilir...");
    
    // Əvvəlcə sektora admin təyin edilmiş istifadəçini null ilə yeniləyirik
    const { error: clearAdminError } = await supabase
      .from("sectors")
      .update({ admin_id: null })
      .eq("id", sectorId);
    
    if (clearAdminError) {
      console.error("Mövcud admini təmizləyərkən xəta:", clearAdminError);
      return {
        success: false,
        error: `Mövcud admini təmizləyərkən xəta: ${clearAdminError.message}`
      };
    }
    
    console.log("Köhnə admin təmizləndi, indi yeni admini təyin edirik...");
    
    // İstifadəçi rolunu yoxlayırıq və ya əlavə edirik
    const { data: existingRoleData, error: roleCheckError } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    
    if (roleCheckError) {
      console.error("İstifadəçi rolunu yoxlarkən xəta:", roleCheckError);
      return {
        success: false,
        error: `İstifadəçi rolunu yoxlarkən xəta: ${roleCheckError.message}`
      };
    }
    
    // İstifadəçini sektoradmin olaraq yeniləyirik
    if (existingRoleData) {
      console.log("Mövcud istifadəçi rolu tapıldı, yenilənir:", existingRoleData);
      
      // Əvvəlki bütün təyinatları sıfırla
      const { error: updateRoleError } = await supabase
        .from("user_roles")
        .update({
          role: "sectoradmin",
          region_id: null,
          sector_id: sectorId,
          school_id: null,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId);
      
      if (updateRoleError) {
        console.error("İstifadəçi rolunu yenilərkən xəta:", updateRoleError);
        return {
          success: false,
          error: `İstifadəçi rolunu yenilərkən xəta: ${updateRoleError.message}`
        };
      }
    } else {
      console.log("İstifadəçi rolu tapılmadı, yeni rol yaradılır");
      
      // İstifadəçi üçün yeni rol yaradırıq
      const { error: insertRoleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: userId,
          role: "sectoradmin",
          sector_id: sectorId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (insertRoleError) {
        console.error("İstifadəçi rolu yaradarkən xəta:", insertRoleError);
        return {
          success: false,
          error: `İstifadəçi rolu yaradarkən xəta: ${insertRoleError.message}`
        };
      }
    }
    
    console.log("İstifadəçi rolu uğurla yeniləndi, indi sektoru yeniləyirik...");
    
    // Sektoru yeniləyərək admin_id-ni təyin et
    const { error: updateSectorError } = await supabase
      .from("sectors")
      .update({ admin_id: userId })
      .eq("id", sectorId);
    
    if (updateSectorError) {
      console.error("Sektoru yenilərkən xəta:", updateSectorError);
      return {
        success: false,
        error: `Sektoru yenilərkən xəta: ${updateSectorError.message}`
      };
    }
    
    console.log("Sektor admin təyinatı uğurla tamamlandı");
    
    return {
      success: true,
      data: {
        message: "İstifadəçi sektor admini olaraq təyin edildi",
        user_id: userId,
        sector_id: sectorId
      }
    };
  } catch (error) {
    console.error("SQL funksiyası çağırılarkən xəta:", error);
    return {
      success: false,
      error: `SQL funksiyası çağırılarkən xəta: ${error instanceof Error ? error.message : "Bilinməyən xəta"}`
    };
  }
}
