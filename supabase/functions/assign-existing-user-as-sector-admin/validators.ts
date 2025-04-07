
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { supabaseUrl } from "./config.ts";

interface ValidationResult {
  valid: boolean;
  error?: string;
}

export async function validateRequiredParams(sectorId: string, userId: string): Promise<ValidationResult> {
  console.log("validateRequiredParams çağırıldı:", { sectorId, userId });

  if (!sectorId) {
    console.error("Sektor ID yoxdur:", sectorId);
    return { valid: false, error: "Sektor ID tələb olunur" };
  }
  
  if (!userId) {
    console.error("İstifadəçi ID yoxdur:", userId);
    return { valid: false, error: "İstifadəçi ID tələb olunur" };
  }
  
  console.log("Parametrlər uğurla doğrulandı");
  return { valid: true };
}

export async function validateRegionAdminAccess(
  userData: { id: string; email: string; role: string; region_id?: string },
  sectorId: string
): Promise<ValidationResult> {
  try {
    console.log("validateRegionAdminAccess çağırıldı:", { userData, sectorId });
    
    // SUPABASE_SERVICE_ROLE_KEY-i birbaşa Deno.env-dən alırıq
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("Server konfiqurasiyası xətası: URL veya ServiceRoleKey yoxdur");
      return {
        valid: false,
        error: "Server konfiqurasiyası xətası"
      };
    }
    
    // Supabase service client yaradırıq
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
    // Əgər superadmindirsə, bütün sektorlara girişi var
    if (userData.role === "superadmin") {
      console.log("SuperAdmin səlahiyyəti ilə giriş təsdiqləndi");
      return { valid: true };
    }
    
    // Region admin üçün, sektorun regionunu yoxla
    if (userData.role === "regionadmin") {
      console.log("RegionAdmin səlahiyyəti yoxlanılır...");
      
      // Sektorun regionunu əldə et
      const { data: sector, error: sectorError } = await supabase
        .from("sectors")
        .select("region_id")
        .eq("id", sectorId)
        .single();
      
      if (sectorError) {
        console.error("Sektor məlumatları əldə edilərkən xəta:", sectorError);
        return {
          valid: false,
          error: `Sektor məlumatları əldə edilərkən xəta: ${sectorError.message}`
        };
      }
      
      console.log("Sektor və admin region məlumatları:", {
        sectorRegionId: sector.region_id,
        userRegionId: userData.region_id
      });
      
      // Sektorun regionu ilə admin regionunu müqayisə et
      if (sector.region_id !== userData.region_id) {
        console.error("İcazə yoxdur: sektor və admin regionları uyğun gəlmir");
        return {
          valid: false,
          error: "Bu sektora admin təyin etmək üçün icazəniz yoxdur"
        };
      }
      
      console.log("RegionAdmin səlahiyyəti ilə giriş təsdiqləndi");
      return { valid: true };
    }
    
    console.error("Uyğun rol tapılmadı:", userData.role);
    return {
      valid: false,
      error: "Bu əməliyyat üçün superadmin və ya regionadmin səlahiyyətləri tələb olunur"
    };
  } catch (error) {
    console.error("Giriş hüququ yoxlanarkən xəta:", error);
    return {
      valid: false,
      error: `Giriş hüququ yoxlanarkən xəta: ${error instanceof Error ? error.message : "Bilinməyən xəta"}`
    };
  }
}

export async function validateSectorAdminExists(sectorId: string): Promise<ValidationResult> {
  try {
    console.log("validateSectorAdminExists çağırıldı:", { sectorId });
    
    // SUPABASE_SERVICE_ROLE_KEY-i birbaşa Deno.env-dən alırıq
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("Server konfiqurasiyası xətası: URL veya ServiceRoleKey yoxdur");
      return {
        valid: false,
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
    
    // Sektor məlumatlarını əldə et
    const { data: sector, error: sectorError } = await supabase
      .from("sectors")
      .select("admin_id")
      .eq("id", sectorId)
      .single();
    
    if (sectorError) {
      console.error("Sektor məlumatları əldə edilərkən xəta:", sectorError);
      return {
        valid: false,
        error: `Sektor məlumatları əldə edilərkən xəta: ${sectorError.message}`
      };
    }
    
    // Əvvəlki admin mövcudluğunu loqlayaq, amma sektor admin dəyişikliyinə icazə verək
    if (sector.admin_id !== null) {
      console.log(`Sektor ${sectorId} üçün mövcud admin ID: ${sector.admin_id}`);
      console.log("Mövcud admin silinib yenisi ilə əvəz ediləcək");
    }
    
    // Admin dəyişikliyinə icazə veririk
    console.log("Sektor admin vəziyyəti doğrulandı");
    return { valid: true };
  } catch (error) {
    console.error("Sektorun admin statusu yoxlanarkən xəta:", error);
    return {
      valid: false,
      error: `Sektorun admin statusu yoxlanarkən xəta: ${error instanceof Error ? error.message : "Bilinməyən xəta"}`
    };
  }
}
