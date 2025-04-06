
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { supabaseUrl, supabaseAnonKey } from "./config.ts";

interface UserData {
  id: string;
  email: string;
  role: string;
  regionId?: string;
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

  // Autentifikasiya olunmuş istifadəçiyə bağlı client
  const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: authHeader },
    },
  });

  // İstifadəçi məlumatlarını əldə et
  const { data: { user: currentUser }, error: userError } = await supabaseAuth.auth.getUser();

  if (userError || !currentUser) {
    console.error("İstifadəçi autentifikasiya xətası:", userError);
    return { 
      authorized: false, 
      error: userError?.message || "İstifadəçi autentifikasiya olunmayıb",
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
  console.log("İstifadəçi rolu:", userRole);

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
      regionId: userRoleData.region_id
    }
  };
}
