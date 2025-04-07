
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
      // Əvvəlcə sektora aid məlumatları əldə edirik
      const { data: sectorData, error: sectorError } = await supabase
        .from("sectors")
        .select("region_id")
        .eq("id", sectorId)
        .single();
        
      if (sectorError) {
        console.error("Sektor məlumatları əldə edilərkən xəta:", sectorError);
        return {
          success: false,
          error: `Sektor məlumatları əldə edilərkən xəta: ${sectorError.message}`
        };
      }
      
      const regionId = sectorData.region_id;
      console.log(`Sektor region ID: ${regionId} əldə edildi`);
      
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
      
      if (!userProfileData || !userProfileData.email) {
        console.error("İstifadəçi emaili tapılmadı");
        return {
          success: false,
          error: "İstifadəçi email məlumatı tapılmadı"
        };
      }
      
      const userEmail = userProfileData.email;
      console.log(`İstifadəçi email: ${userEmail} tapıldı`);
      
      // Transaction başlat
      console.log("Transaction başladılır...");
      
      // 1. Əvvəlcə mövcud sektora admin təyin edilmiş bütün istifadəçiləri təmizləyək
      const { error: clearRolesError } = await supabase
        .from("user_roles")
        .update({
          role: "user",
          sector_id: null,
          region_id: null,
          updated_at: new Date().toISOString()
        })
        .eq("sector_id", sectorId)
        .eq("role", "sectoradmin");
      
      if (clearRolesError) {
        console.error("Mövcud admin rollarını təmizləyərkən xəta:", clearRolesError);
        console.log("Davam edirik, kritik xəta deyil...");
      } else {
        console.log("Köhnə admin rolları uğurla təmizləndi");
      }
      
      // 2. Sektoru təmizlə (admin_id null ilə yenilə)
      const { error: clearAdminError } = await supabase
        .from("sectors")
        .update({ 
          admin_id: null,
          admin_email: null,
          updated_at: new Date().toISOString()
        })
        .eq("id", sectorId);
      
      if (clearAdminError) {
        console.error("Mövcud admini təmizləyərkən xəta:", clearAdminError);
        return {
          success: false,
          error: `Mövcud admini təmizləyərkən xəta: ${clearAdminError.message}`
        };
      }
      
      console.log("Köhnə admin təmizləndi, indi yeni admini təyin edirik...");
      
      // 3. İstifadəçi rolunu gərəksiz halda da təmizlə 
      const { error: clearUserRolesError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .in("role", ["sectoradmin", "schooladmin"]);
      
      if (clearUserRolesError) {
        console.error("İstifadəçi rollarını təmizləyərkən xəta:", clearUserRolesError);
        console.log("Davam edirik, kritik xəta deyil...");
      } else {
        console.log("İstifadəçinin köhnə admin rolları uğurla təmizləndi");
      }
      
      // 4. İstifadəçi üçün yeni rol əlavə et
      const { error: insertRoleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: userId,
          role: "sectoradmin",
          region_id: regionId,
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
      
      console.log("İstifadəçi rolu uğurla yeniləndi, indi sektoru yeniləyirik...");
      
      // 5. Sektoru yeniləyərək admin_id-ni təyin et
      const { error: updateSectorError } = await supabase
        .from("sectors")
        .update({ 
          admin_id: userId,
          admin_email: userEmail,
          updated_at: new Date().toISOString()
        })
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
          user_name: userProfileData.full_name,
          user_email: userEmail,
          sector_id: sectorId,
          region_id: regionId
        }
      };
    } catch (dbError: any) {
      console.error("Verilənlər bazası əməliyyatı zamanı xəta:", dbError);
      return {
        success: false,
        error: `Verilənlər bazası əməliyyatı zamanı xəta: ${dbError instanceof Error ? dbError.message : "Bilinməyən xəta"}`
      };
    }
  } catch (error) {
    console.error("SQL funksiyası çağırılarkən xəta:", error);
    return {
      success: false,
      error: `SQL funksiyası çağırılarkən xəta: ${error instanceof Error ? error.message : "Bilinməyən xəta"}`
    };
  }
}
