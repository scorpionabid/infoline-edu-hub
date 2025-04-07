
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
    
    console.log("Supabase client yaradıldı, işləmə başlayır...");
    
    try {
      // İstifadəçi email-ni profiles-dan əldə et
      const { data: userProfileData, error: userProfileError } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", userId)
        .single();
      
      if (userProfileError) {
        console.error("İstifadəçi profili əldə edilərkən xəta:", userProfileError);
        return {
          success: false,
          error: `İstifadəçi profili əldə edilərkən xəta: ${userProfileError.message}`
        };
      }
      
      if (!userProfileData) {
        console.error("İstifadəçi profili tapılmadı:", userId);
        return {
          success: false,
          error: "İstifadəçi profili tapılmadı"
        };
      }
      
      const userEmail = userProfileData.email;
      const userName = userProfileData.full_name;
      console.log(`İstifadəçi məlumatları: Email: ${userEmail || 'yoxdur'}, Ad: ${userName || 'yoxdur'}`);
      
      // Sektorun region_id məlumatını əldə et
      const { data: sectorData, error: sectorError } = await supabase
        .from("sectors")
        .select("region_id, name")
        .eq("id", sectorId)
        .single();
        
      if (sectorError) {
        console.error("Sektor məlumatları əldə edilərkən xəta:", sectorError);
        return {
          success: false,
          error: `Sektor məlumatları əldə edilərkən xəta: ${sectorError.message}`
        };
      }
      
      if (!sectorData) {
        console.error("Sektor tapılmadı:", sectorId);
        return {
          success: false,
          error: "Sektor tapılmadı"
        };
      }
      
      const regionId = sectorData.region_id;
      const sectorName = sectorData.name;
      console.log(`Sektor məlumatları: Region ID: ${regionId}, Ad: ${sectorName}`);
      
      // Mövcud admin-i yoxlayaq və əgər varsa, onu təmizləyək
      const { data: currentSectorAdmin, error: currentSectorError } = await supabase
        .from("sectors")
        .select("admin_id")
        .eq("id", sectorId)
        .single();
      
      if (currentSectorError) {
        console.error("Mövcud admin yoxlanarkən xəta:", currentSectorError);
        return {
          success: false,
          error: `Mövcud admin yoxlanarkən xəta: ${currentSectorError.message}`
        };
      }
      
      if (currentSectorAdmin && currentSectorAdmin.admin_id) {
        console.log("Sektorun mövcud admini var. Köhnə admin təmizlənir...");
        
        // Köhnə admini təmizlə
        const { error: clearAdminError } = await supabase
          .from("sectors")
          .update({ admin_id: null, admin_email: null })
          .eq("id", sectorId);
        
        if (clearAdminError) {
          console.error("Köhnə admin təmizlənərkən xəta:", clearAdminError);
          return {
            success: false, 
            error: `Köhnə admin təmizlənərkən xəta: ${clearAdminError.message}`
          };
        }
        
        console.log("Köhnə admin uğurla təmizləndi");
      }
      
      // İndi birbaşa yeni admini təyin edək
      console.log("assign_sector_admin database funksiyası çağırılır...");
      
      try {
        // Əvvəlcə sektorun admin məlumatlarını birbaşa update edək
        const { error: updateSectorError } = await supabase
          .from("sectors")
          .update({ 
            admin_id: userId, 
            admin_email: userEmail
          })
          .eq("id", sectorId);
        
        if (updateSectorError) {
          console.error("Sektor admin məlumatları yenilənərkən xəta:", updateSectorError);
          return {
            success: false,
            error: `Sektor admin məlumatları yenilənərkən xəta: ${updateSectorError.message}`
          };
        }
        
        // İndi istifadəçi rolunu yeniləyək
        // Əvvəlcə mövcud rolu yoxlayaq
        const { data: existingRole, error: roleCheckError } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", userId)
          .single();
        
        if (roleCheckError && !roleCheckError.message.includes('No rows found')) {
          console.error("İstifadəçi rolu yoxlanarkən xəta:", roleCheckError);
          return {
            success: false,
            error: `İstifadəçi rolu yoxlanarkən xəta: ${roleCheckError.message}`
          };
        }
        
        // Mövcud rol varsa update, yoxdursa insert edək
        let roleUpdateError = null;
        
        if (existingRole) {
          const { error } = await supabase
            .from("user_roles")
            .update({
              role: "sectoradmin",
              sector_id: sectorId,
              region_id: regionId,
              school_id: null
            })
            .eq("user_id", userId);
            
          roleUpdateError = error;
        } else {
          const { error } = await supabase
            .from("user_roles")
            .insert({
              user_id: userId,
              role: "sectoradmin",
              sector_id: sectorId,
              region_id: regionId,
              school_id: null
            });
            
          roleUpdateError = error;
        }
        
        if (roleUpdateError) {
          console.error("İstifadəçi rolu yenilənərkən xəta:", roleUpdateError);
          return {
            success: false,
            error: `İstifadəçi rolu yenilənərkən xəta: ${roleUpdateError.message}`
          };
        }
        
        console.log("Sektor admin və istifadəçi rolu uğurla təyin edildi");
        
        // Uğurlu nəticə
        return {
          success: true,
          data: {
            message: "İstifadəçi sektor admini olaraq təyin edildi",
            user_id: userId,
            sector_id: sectorId,
            region_id: regionId,
            user_name: userName,
            user_email: userEmail,
            sector_name: sectorName
          }
        };
      } catch (rpcError: any) {
        console.error("Database əməliyyatı xətası:", rpcError);
        return {
          success: false,
          error: `Database əməliyyatı xətası: ${rpcError.message || "Bilinməyən xəta"}`
        };
      }
    } catch (dbError: any) {
      console.error("Verilənlər bazası əməliyyatı zamanı xəta:", dbError);
      
      // İstisna ilə bağlı daha ətraflı məlumat loqla
      if (dbError.stack) {
        console.error("Stack trace:", dbError.stack);
      }
      
      return {
        success: false,
        error: `Verilənlər bazası əməliyyatı zamanı xəta: ${dbError instanceof Error ? dbError.message : "Bilinməyən xəta"}`
      };
    }
  } catch (error: any) {
    console.error("SQL funksiyası çağırılarkən xəta:", error);
    
    // İstisna ilə bağlı daha ətraflı məlumat loqla
    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }
    
    return {
      success: false,
      error: `SQL funksiyası çağırılarkən xəta: ${error instanceof Error ? error.message : "Bilinməyən xəta"}`
    };
  }
}
