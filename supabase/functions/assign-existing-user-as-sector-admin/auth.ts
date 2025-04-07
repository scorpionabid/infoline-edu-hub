
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
    console.log('Auth header başlanğıcı:', authHeader.substring(0, 30) + '...');

    const token = authHeader.split(' ')[1];
    console.log('Token uzunluğu:', token.length);
    console.log('Token başlanğıcı:', token.substring(0, 20) + '...');

    // Autentifikasiya olunmuş istifadəçiyə bağlı client
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    try {
      // İstifadəçi məlumatlarını əldə et
      const { data: { user: currentUser }, error: userError } = await supabaseAuth.auth.getUser();

      if (userError) {
        console.error("İstifadəçi autentifikasiya xətası:", userError);
        return { 
          authorized: false, 
          error: userError?.message || "İstifadəçi autentifikasiya olunmayıb",
          status: 401 
        };
      }

      if (!currentUser) {
        console.error("Cari istifadəçi tapılmadı");
        return { 
          authorized: false, 
          error: "İstifadəçi tapılmadı",
          status: 401 
        };
      }

      console.log("Cari istifadəçi:", currentUser.id, currentUser.email);

      // İstifadəçi rolunu yoxla
      const { data: userRoleData, error: userRoleError } = await supabaseAuth
        .from("user_roles")
        .select("*")
        .eq("user_id", currentUser.id)
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
          id: currentUser.id,
          email: currentUser.email || '',
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
