
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { supabaseUrl, supabaseAnonKey } from "./config.ts";

interface UserData {
  id: string;
  email: string;
  role: string;
  region_id?: string;
}

/**
 * İstifadəçi autentikasiyasını və səlahiyyətlərini yoxlayır
 * @param authHeader Authorization başlığı
 * @returns İstifadəçi məlumatlarını və ya xəta
 */
export async function authenticateAndAuthorize(authHeader: string | null): Promise<{ 
  authorized: boolean; 
  userData?: UserData; 
  error?: string;
  status?: number;
}> {
  if (!authHeader) {
    console.error("Auth header mövcud deyil");
    return { 
      authorized: false, 
      error: "İstifadəçi autentifikasiya olunmayıb",
      status: 401
    };
  }

  // Auth header formatını yoxla
  if (!authHeader.startsWith('Bearer ')) {
    console.error("Auth header yanlış formatdadır, 'Bearer' ilə başlamalıdır");
    return {
      authorized: false,
      error: "Autentifikasiya başlığı yanlış formatdadır",
      status: 401
    };
  }

  try {
    console.log('Auth header ilə autentifikasiya başlayır');
    console.log('Auth header tipi:', typeof authHeader);
    console.log('Auth header uzunluğu:', authHeader.length);
    
    const token = authHeader.split(' ')[1];
    console.log('Token uzunluğu:', token.length);
    
    // Service Role key ilə supabase client yaradaq
    const supabaseAdmin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '', {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    try {
      // Tokendən istifadəçini əldə et
      const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);

      if (userError) {
        console.error("Token yoxlaması xətası:", userError);
        return { 
          authorized: false, 
          error: userError.message || "Token yoxlaması zamanı xəta",
          status: 401 
        };
      }

      if (!userData || !userData.user) {
        console.error("Cari istifadəçi tapılmadı");
        return { 
          authorized: false, 
          error: "İstifadəçi tapılmadı",
          status: 401 
        };
      }

      console.log("Cari istifadəçi:", userData.user.id, userData.user.email);

      // İstifadəçi rolunu yoxla
      const { data: userRoleData, error: userRoleError } = await supabaseAdmin
        .from("user_roles")
        .select("*")
        .eq("user_id", userData.user.id)
        .single();

      if (userRoleError) {
        console.error("İstifadəçi rolu sorğusu xətası:", userRoleError);
        return { 
          authorized: false, 
          error: userRoleError.message || "İstifadəçi rolu tapılmadı",
          status: 403
        };
      }

      const userRole = userRoleData.role;
      console.log("İstifadəçi rolu:", userRole, "Bölgə ID:", userRoleData.region_id);

      // Yalnız superadmin və regionadmin rolları icazəlidir
      if (userRole !== "superadmin" && userRole !== "regionadmin") {
        console.error("İcazəsiz giriş - yalnız superadmin və regionadmin");
        return { 
          authorized: false,
          error: "Bu əməliyyat üçün superadmin və ya regionadmin səlahiyyətləri tələb olunur",
          status: 403 
        };
      }

      return { 
        authorized: true, 
        userData: {
          id: userData.user.id,
          email: userData.user.email || '',
          role: userRole,
          region_id: userRoleData.region_id
        }
      };
    } catch (error) {
      console.error("Autentifikasiya xətası:", error);
      return { 
        authorized: false, 
        error: error instanceof Error ? error.message : "Autentifikasiya zamanı gözlənilməz xəta",
        status: 401
      };
    }
  } catch (error) {
    console.error("Giriş yoxlanışı zamanı xəta:", error);
    return {
      authorized: false,
      error: error instanceof Error ? error.message : "Giriş yoxlanışı zamanı gözlənilməz xəta",
      status: 500
    };
  }
}
