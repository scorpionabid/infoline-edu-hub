
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { supabaseUrl, supabaseServiceRoleKey } from "./config.ts";

interface UserData {
  id: string;
  email: string;
  role: string;
  regionId?: string;
}

/**
 * Regionadmin üçün əlavə yoxlamalar
 * @param userData İstifadəçi məlumatları
 * @param sectorId Sektor ID
 * @returns Yoxlama nəticəsi
 */
export async function validateRegionAdminAccess(userData: UserData, sectorId: string): Promise<{ 
  valid: boolean; 
  sector?: any; 
  error?: string;
}> {
  if (userData.role !== "regionadmin") {
    return { valid: true }; // Superadmin üçün yoxlamaya ehtiyac yoxdur
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Sektoru yoxla
  const { data: sector, error: sectorError } = await supabase
    .from("sectors")
    .select("*")
    .eq("id", sectorId)
    .single();

  if (sectorError || !sector) {
    console.error("Sektor sorğusu xətası:", sectorError);
    return { 
      valid: false, 
      error: sectorError?.message || "Sektor tapılmadı" 
    };
  }

  // Region admini yalnız öz regionuna aid sektorlara admin təyin edə bilər
  if (sector.region_id !== userData.regionId) {
    console.error("İcazəsiz giriş - region admini yalnız öz regionuna aid sektorlara admin təyin edə bilər");
    return { 
      valid: false, 
      error: "Siz yalnız öz regionunuza aid sektorlara admin təyin edə bilərsiniz" 
    };
  }

  return { valid: true, sector };
}

/**
 * Tələb olunan parametrlərin olmasını yoxlayır
 * @param sectorId Sektor ID
 * @param userId İstifadəçi ID
 * @returns Yoxlama nəticəsi
 */
export function validateRequiredParams(sectorId?: string, userId?: string): { 
  valid: boolean; 
  error?: string;
} {
  if (!sectorId || !userId) {
    const missingParams = [];
    if (!sectorId) missingParams.push("sectorId");
    if (!userId) missingParams.push("userId");
    
    const errorMessage = `Tələb olunan parametrlər çatışmır: ${missingParams.join(", ")}`;
    console.error(errorMessage);
    
    return { valid: false, error: errorMessage };
  }

  return { valid: true };
}
