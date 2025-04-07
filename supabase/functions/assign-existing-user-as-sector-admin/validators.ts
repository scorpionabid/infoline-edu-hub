
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { supabaseUrl } from "./config.ts";

// İstifadəçi məlumatları tipi
interface UserData {
  id: string;
  email: string;
  role: string;
  region_id?: string;
}

/**
 * Tələb olunan parametrləri doğrulayır
 * @param sectorId Sektor ID
 * @param userId İstifadəçi ID
 * @returns Doğrulama nəticəsi
 */
export function validateRequiredParams(sectorId: string, userId: string) {
  if (!sectorId) {
    return { valid: false, error: "Sektor ID tələb olunur" };
  }
  
  if (!userId) {
    return { valid: false, error: "İstifadəçi ID tələb olunur" };
  }
  
  return { valid: true };
}

/**
 * Region admini üçün sektora giriş icazəsini yoxlayır
 * @param userData İstifadəçi məlumatları
 * @param sectorId Sektor ID
 * @returns Doğrulama nəticəsi
 */
export async function validateRegionAdminAccess(userData: UserData, sectorId: string) {
  // Superadminlər bütün sektorlara giriş hüququna malikdir
  if (userData.role === "superadmin") {
    return { valid: true };
  }
  
  // RegionAdmin yalnız öz regionuna aid olan sektorlara giriş hüququna malikdir
  if (userData.role === "regionadmin" && userData.region_id) {
    try {
      // SUPABASE_SERVICE_ROLE_KEY-i birbaşa Deno.env-dən alırıq
      const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (!supabaseServiceRoleKey) {
        console.error("SUPABASE_SERVICE_ROLE_KEY mövcud deyil");
        return { valid: false, error: "Server konfiqurasiyası xətası" };
      }
      
      const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
      
      // Sektorun regionunu yoxla
      const { data: sector, error } = await supabase
        .from("sectors")
        .select("region_id")
        .eq("id", sectorId)
        .single();
      
      if (error) {
        console.error("Sektor sorğusu xətası:", error);
        return { valid: false, error: "Sektor tapılmadı" };
      }
      
      if (sector.region_id !== userData.region_id) {
        return { 
          valid: false, 
          error: "Bu sektor sizin regionunuza aid deyil və ona giriş hüququnuz yoxdur" 
        };
      }
      
      return { valid: true };
    } catch (error) {
      console.error("Region icazəsi yoxlanılarkən xəta:", error);
      return { 
        valid: false, 
        error: "Region icazəsi yoxlanılarkən xəta baş verdi" 
      };
    }
  }
  
  // Digər rolların icazəsi yoxdur
  return { valid: false, error: "Bu əməliyyat üçün icazəniz yoxdur" };
}

/**
 * Sektor admini artıq təyin olunub-olunmadığını yoxlayır
 * @param sectorId Sektor ID
 * @returns Doğrulama nəticəsi
 */
export async function validateSectorAdminExists(sectorId: string) {
  try {
    // SUPABASE_SERVICE_ROLE_KEY-i birbaşa Deno.env-dən alırıq
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseServiceRoleKey) {
      console.error("SUPABASE_SERVICE_ROLE_KEY mövcud deyil");
      return { valid: false, error: "Server konfigurasiyası xətası" };
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
    // Sektorun mövcud admin ID-sini yoxla
    const { data: sector, error } = await supabase
      .from("sectors")
      .select("admin_id")
      .eq("id", sectorId)
      .single();
    
    if (error) {
      console.error("Sektor admin yoxlama xətası:", error);
      return { valid: false, error: "Sektor tapılmadı" };
    }
    
    if (sector.admin_id) {
      return { 
        valid: false, 
        error: "Bu sektora artıq admin təyin edilib" 
      };
    }
    
    return { valid: true };
  } catch (error) {
    console.error("Sektor admin yoxlanılarkən xəta:", error);
    return { 
      valid: false, 
      error: "Sektor admin yoxlanılarkən xəta baş verdi" 
    };
  }
}
