
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { supabaseUrl } from "./config.ts";

interface ValidationResult {
  valid: boolean;
  error?: string;
}

export async function validateRequiredParams(sectorId: string, userId: string): Promise<ValidationResult> {
  if (!sectorId) {
    return { valid: false, error: "Sektor ID tələb olunur" };
  }
  
  if (!userId) {
    return { valid: false, error: "İstifadəçi ID tələb olunur" };
  }
  
  return { valid: true };
}

export async function validateRegionAdminAccess(
  userData: { id: string; email: string; role: string; region_id?: string },
  sectorId: string
): Promise<ValidationResult> {
  try {
    // SUPABASE_SERVICE_ROLE_KEY-i birbaşa Deno.env-dən alırıq
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
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
      return { valid: true };
    }
    
    // Region admin üçün, sektorun regionunu yoxla
    if (userData.role === "regionadmin") {
      // Sektorun regionunu əldə et
      const { data: sector, error: sectorError } = await supabase
        .from("sectors")
        .select("region_id")
        .eq("id", sectorId)
        .single();
      
      if (sectorError) {
        return {
          valid: false,
          error: `Sektor məlumatları əldə edilərkən xəta: ${sectorError.message}`
        };
      }
      
      // Sektorun regionu ilə admin regionunu müqayisə et
      if (sector.region_id !== userData.region_id) {
        return {
          valid: false,
          error: "Bu sektora admin təyin etmək üçün icazəniz yoxdur"
        };
      }
      
      return { valid: true };
    }
    
    return {
      valid: false,
      error: "Bu əməliyyat üçün superadmin və ya regionadmin səlahiyyətləri tələb olunur"
    };
  } catch (error) {
    return {
      valid: false,
      error: `Giriş hüququ yoxlanarkən xəta: ${error instanceof Error ? error.message : "Bilinməyən xəta"}`
    };
  }
}

export async function validateSectorAdminExists(sectorId: string): Promise<ValidationResult> {
  try {
    // SUPABASE_SERVICE_ROLE_KEY-i birbaşa Deno.env-dən alırıq
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
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
    
    // Sektor məlumatlarını əldə et
    const { data: sector, error: sectorError } = await supabase
      .from("sectors")
      .select("admin_id")
      .eq("id", sectorId)
      .single();
    
    if (sectorError) {
      return {
        valid: false,
        error: `Sektor məlumatları əldə edilərkən xəta: ${sectorError.message}`
      };
    }
    
    // Sektorun artıq admin-i olub-olmadığını yoxla
    if (sector.admin_id !== null) {
      // Mövcud admini user_roles-dan yoxla
      const { data: adminRole, error: adminRoleError } = await supabase
        .from("user_roles")
        .select("id")
        .eq("sector_id", sectorId)
        .eq("role", "sectoradmin")
        .maybeSingle();
      
      // Əgər user_roles-də tapılırsa, xəta qaytar
      if (!adminRoleError && adminRole) {
        return {
          valid: false,
          error: "Bu sektora artıq bir admin təyin edilib. Əvvəlcə onu silməlisiniz."
        };
      }
      
      // Əgər admin_id var, amma user_roles-də qeyd olunmayıbsa, davam edə bilərik
      console.log("Sektor admin ID var, ancaq user_roles-də rolu tapılmadı");
    }
    
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: `Sektorun admin statusu yoxlanarkən xəta: ${error instanceof Error ? error.message : "Bilinməyən xəta"}`
    };
  }
}
