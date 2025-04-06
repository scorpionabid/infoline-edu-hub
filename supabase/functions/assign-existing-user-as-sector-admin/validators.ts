
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
      return { valid: false, error: "Server konfiqurasiyası xətası" };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Əgər superadmin isə, daima giriş icazəsi var
    if (userData.role === "superadmin") {
      return { valid: true };
    }

    // Region admininin yoxlanması
    if (userData.role === "regionadmin" && userData.region_id) {
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

      // Region adminin öz regionuna aid sektorlar üçün icazəsi var
      if (sector && sector.region_id === userData.region_id) {
        return { valid: true };
      }

      return {
        valid: false,
        error: "Bu regiona aid olmayan sektorlar üçün admin təyin etmə icazəniz yoxdur",
      };
    }

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
