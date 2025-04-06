
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { supabaseUrl, supabaseAnonKey } from "./config.ts";

/**
 * Sektorun mövcudluğunu və admin statusunu yoxlayır
 * @param sectorId Sektor ID
 * @returns Yoxlama nəticəsi
 */
export async function validateSector(sectorId: string): Promise<{ 
  valid: boolean; 
  sector?: any; 
  error?: string;
}> {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Sektorun mövcudluğunu yoxlayaq
  const { data: sector, error: sectorError } = await supabase
    .from("sectors")
    .select("*")
    .eq("id", sectorId)
    .single();

  if (sectorError || !sector) {
    console.error("Sektor mövcudluq yoxlaması xətası:", sectorError);
    return { valid: false, error: "Sektor tapılmadı" };
  }

  // Sektorun admininin artıq təyin edilib-edilmədiyini yoxlayaq
  if (sector.admin_id) {
    console.error("Sektora artıq admin təyin edilib:", sector.admin_id);
    return { valid: false, error: "Bu sektora artıq admin təyin edilib" };
  }
  
  return { valid: true, sector };
}

/**
 * Tələb olunan parametrlərin olmasını yoxlayır
 * @param data Giriş parametrləri
 * @returns Yoxlama nəticəsi
 */
export function validateRequiredParams(data: any): { 
  valid: boolean; 
  error?: string;
} {
  const requiredParams = ['sectorId', 'adminName', 'adminEmail', 'adminPassword'];
  const missingParams = requiredParams.filter(param => !data[param]);
  
  if (missingParams.length > 0) {
    const errorMessage = `Tələb olunan parametrlər çatışmır: ${missingParams.join(", ")}`;
    console.error(errorMessage);
    
    return { valid: false, error: errorMessage };
  }

  return { valid: true };
}
