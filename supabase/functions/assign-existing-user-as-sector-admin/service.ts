
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
      // İstifadəçi email-ni profiles-dan əldə et (auth.users əvəzinə)
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
      
      // Tranzaksiya əməliyyatlarını yerinə yetirmək üçün database funksiyası çağırırıq
      console.log("assign_sector_admin database funksiyası çağırılır...");
      const { data: assignResult, error: assignError } = await supabase.rpc(
        'assign_sector_admin',
        { 
          user_id_param: userId,
          sector_id_param: sectorId
        }
      );
      
      if (assignError) {
        console.error("Database funksiyası xətası:", assignError);
        
        // Daha spesifik xəta mesajı üçün mesajı yoxla
        if (assignError.message.includes("permission denied")) {
          return {
            success: false,
            error: "İcazə xətası: Bu əməliyyatı yerinə yetirmək üçün kifayət qədər icazələr yoxdur"
          };
        }
        
        // Əgər artıq admin varsa
        if (assignError.message.includes("artıq admin təyin edilib")) {
          // Mövcud admini təmizləyək və yenidən cəhd edək
          console.log("Sektor artıq adminə malikdir. Köhnə admin təmizlənir...");
          
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
          
          // Yenidən assign et
          console.log("Köhnə admin təmizləndi, yenidən təyinat edilir...");
          const { data: retryResult, error: retryError } = await supabase.rpc(
            'assign_sector_admin',
            { 
              user_id_param: userId,
              sector_id_param: sectorId
            }
          );
          
          if (retryError) {
            console.error("Təkrar təyinat xətası:", retryError);
            return {
              success: false,
              error: `Təkrar təyinat xətası: ${retryError.message}`
            };
          }
          
          console.log("Təkrar təyinat uğurlu oldu:", retryResult);
          return {
            success: true,
            data: {
              message: "İstifadəçi sektor admini olaraq təyin edildi (köhnə admin əvəz edildi)",
              user_id: userId,
              sector_id: sectorId,
              region_id: regionId,
              user_name: userName,
              user_email: userEmail,
              sector_name: sectorName
            }
          };
        }
        
        return {
          success: false,
          error: `Database funksiyası xətası: ${assignError.message}`
        };
      }
      
      if (!assignResult || !assignResult.success) {
        console.error("Database funksiyası qayıtdı, amma uğursuz nəticə:", assignResult);
        return {
          success: false,
          error: assignResult?.error || "Bilinməyən xəta"
        };
      }
      
      console.log("Database funksiyası uğurla icra edildi:", assignResult);
      
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
