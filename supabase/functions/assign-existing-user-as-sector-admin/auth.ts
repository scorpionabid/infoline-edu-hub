// @deno-types="https://deno.land/x/types/index.d.ts"
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { supabaseUrl } from "./config.ts";

/**
 * Auth authorization header-ini yoxlayıb doğrulayır
 * @param authHeader Authorization header dəyəri
 * @returns Doğrulama nəticəsi
 */
export async function authenticateAndAuthorize(authHeader: string) {
  try {
    // JWT token-i extract et
    const token = authHeader.replace("Bearer ", "");
    
    if (!token) {
      return {
        authorized: false,
        error: "Token təqdim edilməyib",
        status: 401
      };
    }
    
    // SUPABASE_ANON_KEY environment variable-ını al
    // @ts-ignore
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Ətraf dəyişənlər mövcud deyil: SUPABASE_URL və ya SUPABASE_ANON_KEY");
      return {
        authorized: false,
        error: "Server konfiqurasiyası xətası",
        status: 500
      };
    }
    
    // Supabase client yaradırıq
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });
    
    // İstifadəçi məlumatlarını əldə edirik
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("JWT token yoxlaması xətası:", userError);
      return {
        authorized: false,
        error: userError?.message || "Etibarsız token",
        status: 401
      };
    }
    
    // İstifadəçi rolunu əldə edirik
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role, region_id')
      .eq('user_id', user.id)
      .single();
    
    if (roleError || !roleData) {
      console.error("İstifadəçi rolu əldə edilərkən xəta:", roleError);
      return {
        authorized: false,
        error: "İstifadəçi rolu tapılmadı",
        status: 403
      };
    }
    
    // İstifadəçinin superadmin, regionadmin və ya sectoradmin olduğunu yoxlayırıq
    if (!['superadmin', 'regionadmin'].includes(roleData.role)) {
      console.error("İcazə yoxdur, rol:", roleData.role);
      return {
        authorized: false,
        error: "Bu əməliyyat üçün admin səlahiyyətləri tələb olunur",
        status: 403
      };
    }
    
    // Yoxlamaları keçən istifadəçi
    console.log(`İstifadəçi ${user.id} doğrulandı, rol: ${roleData.role}`);
    
    return {
      authorized: true,
      userData: {
        id: user.id,
        email: user.email,
        role: roleData.role,
        region_id: roleData.region_id
      }
    };
  } catch (error) {
    console.error("Autentifikasiya zamanı xəta:", error);
    return {
      authorized: false,
      error: `Autentifikasiya xətası: ${error instanceof Error ? error.message : "Bilinməyən xəta"}`,
      status: 500
    };
  }
}
