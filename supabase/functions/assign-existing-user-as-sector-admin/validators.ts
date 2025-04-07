
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { supabaseUrl } from "./config.ts";

/**
 * Sektor admin təyin etmək üçün parametrləri doğrulayır
 * @param sectorId Sektor ID
 * @param userId İstifadəçi ID
 * @returns Doğrulama nəticəsi
 */
export function validateRequiredParams(sectorId?: string, userId?: string): {
  valid: boolean;
  error?: string;
} {
  if (!sectorId) {
    return {
      valid: false,
      error: "Sektor ID tələb olunur"
    };
  }
  
  if (!userId) {
    return {
      valid: false,
      error: "İstifadəçi ID tələb olunur"
    };
  }
  
  return { valid: true };
}

/**
 * Region admin səlahiyyətlərini doğrulayır
 * @param userData İstifadəçi məlumatları
 * @param sectorId Sektor ID
 * @returns Doğrulama nəticəsi
 */
export async function validateRegionAdminAccess(
  userData: { id: string; role: string; region_id?: string; },
  sectorId: string
): Promise<{
  valid: boolean;
  error?: string;
}> {
  try {
    // Superadmin üçün yoxlama etmirik
    if (userData.role === 'superadmin') {
      return { valid: true };
    }
    
    // Əgər region admin deyilsə
    if (userData.role !== 'regionadmin') {
      return {
        valid: false,
        error: "Bu əməliyyat üçün superadmin və ya regionadmin səlahiyyətləri tələb olunur"
      };
    }
    
    // SUPABASE_SERVICE_ROLE_KEY-i alaq
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("Server konfiqurasiyası xətası: URL və ya Service Key mövcud deyil");
      return {
        valid: false,
        error: "Server konfigurasiya xətası",
      };
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
    // Sektorun region ID-ni əldə edək
    const { data: sectorData, error: sectorError } = await supabase
      .from('sectors')
      .select('region_id')
      .eq('id', sectorId)
      .single();
      
    if (sectorError) {
      console.error("Sektor məlumatları əldə edilərkən xəta:", sectorError);
      return {
        valid: false,
        error: "Sektor məlumatları əldə edilərkən xəta: " + sectorError.message
      };
    }
    
    // Region admin öz regionuna aid olmayan sektorlara admin təyin edə bilməz
    if (sectorData.region_id !== userData.region_id) {
      return {
        valid: false,
        error: "Bu sektora admin təyin etmək üçün icazəniz yoxdur"
      };
    }
    
    return { valid: true };
  } catch (error) {
    console.error("Region giriş hüququ yoxlanarkən xəta:", error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Region giriş hüququ yoxlanarkən xəta"
    };
  }
}

/**
 * Sektorun artıq admini olub-olmadığını yoxlayır
 * @param sectorId Sektor ID
 * @returns Doğrulama nəticəsi
 */
export async function validateSectorAdminExists(sectorId: string): Promise<{
  valid: boolean;
  error?: string;
}> {
  try {
    // SUPABASE_SERVICE_ROLE_KEY-i alaq
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("Server konfiqurasiyası xətası: URL və ya Service Key mövcud deyil");
      return {
        valid: false,
        error: "Server konfigurasiya xətası",
      };
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
    // Sektorun admin ID-ni yoxlayaq
    const { data: sectorData, error: sectorError } = await supabase
      .from('sectors')
      .select('admin_id, name')
      .eq('id', sectorId)
      .single();
      
    if (sectorError) {
      console.error("Sektor məlumatları əldə edilərkən xəta:", sectorError);
      return {
        valid: false,
        error: "Sektor məlumatları əldə edilərkən xəta: " + sectorError.message
      };
    }
    
    // Artıq admin təyin edilib
    if (sectorData.admin_id) {
      return {
        valid: false,
        error: `Sektor "${sectorData.name}" artıq bir admin ilə təyin edilib`
      };
    }
    
    return { valid: true };
  } catch (error) {
    console.error("Sektor admin yoxlama xətası:", error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Sektor admin yoxlaması zamanı xəta"
    };
  }
}
