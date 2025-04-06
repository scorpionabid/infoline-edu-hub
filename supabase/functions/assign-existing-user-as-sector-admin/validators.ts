
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// Məcburi parametrlərin yoxlanması
export function validateRequiredParams(
  sectorId: string | undefined,
  userId: string | undefined
) {
  if (!sectorId) {
    return { valid: false, error: "Sektor ID məcburidir" };
  }

  if (!userId) {
    return { valid: false, error: "İstifadəçi ID məcburidir" };
  }

  return { valid: true };
}

// Region admininin sektora giriş hüququnun yoxlanması
export async function validateRegionAdminAccess(userData: any, sectorId: string) {
  try {
    // Supabase client yaradılır
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Server konfiqurasiyası xətası: URL və ya Service Key mövcud deyil");
      return { valid: false, error: "Server konfiqurasiyası xətası" };
    }

    console.log(`RegionAdmin validation üçün userData:`, userData);
    console.log(`Yoxlanacaq sectorId:`, sectorId);

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Əgər superadmin isə, daima giriş icazəsi var
    if (userData.role === "superadmin") {
      console.log("Superadmin rolunda istifadəçi - icazə verildi");
      return { valid: true };
    }

    // Region admininin yoxlanması
    if (userData.role === "regionadmin" && userData.region_id) {
      console.log(`RegionAdmin yoxlanışı: regionId=${userData.region_id}`);
      
      // Sektorun hansı regiona aid olduğunu yoxla
      const { data: sector, error: sectorError } = await supabase
        .from("sectors")
        .select("region_id")
        .eq("id", sectorId)
        .single();

      if (sectorError) {
        console.error("Sektor məlumatları alınarkən xəta:", sectorError);
        return { valid: false, error: "Sektor məlumatları alına bilmədi" };
      }

      console.log(`Sektor məlumatları:`, sector);

      // Region adminin öz regionuna aid sektorlar üçün icazəsi var
      if (sector && sector.region_id === userData.region_id) {
        console.log("Region admin öz regionundakı sektora müraciət edir - icazə verildi");
        return { valid: true };
      }

      console.error("Region admin başqa regionun sektoruna müraciət edir - icazə verilmədi");
      return {
        valid: false,
        error: "Bu regiona aid olmayan sektorlar üçün admin təyin etmə icazəniz yoxdur",
      };
    }

    console.error("İstifadəçi SuperAdmin və ya RegionAdmin deyil");
    // Digər rollar üçün icazəni inkar et
    return {
      valid: false,
      error: "Yalnız superadmin və region adminləri sektor admini təyin edə bilər",
    };
  } catch (error) {
    console.error("Giriş yoxlanışı zamanı xəta:", error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Giriş yoxlanışı zamanı gözlənilməz xəta",
    };
  }
}
