
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { supabaseUrl, supabaseServiceRoleKey } from "./config.ts";

/**
 * Admin istifadəçisi yaratmaq üçün funksiya
 * @param name İstifadəçi adı
 * @param email İstifadəçi e-poçtu
 * @param password İstifadəçi şifrəsi
 * @param sectorId Sektor ID
 * @returns Yaradılma nəticəsi
 */
export async function createAdminUser(name: string, email: string, password: string, sectorId: string): Promise<{
  success: boolean;
  adminId?: string;
  error?: string;
}> {
  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log("Admin yaradılır...", { name, email });

    // Auth istifadəçisi yaradaq
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        role: "sectoradmin",
        sector_id: sectorId,
      },
    });

    if (authError) {
      console.error("Admin yaradılma xətası:", authError);
      console.error("Admin yaradılma xətası (ətraflı):", JSON.stringify(authError));
      return { 
        success: false, 
        error: authError.message || "Auth istifadəçisi yaradıla bilmədi" 
      };
    }

    if (!authUser.user) {
      return { 
        success: false, 
        error: "Auth istifadəçisi yaradıla bilmədi" 
      };
    }

    const userId = authUser.user.id;

    // Profil məlumatlarını əlavə edək
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: userId,
        full_name: name,
        email: email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: "active",
      });

    if (profileError) {
      console.error("Profil yaradılma xətası:", profileError);
      return { 
        success: false, 
        error: profileError.message || "Profil yaradıla bilmədi" 
      };
    }

    // İstifadəçi rolunu əlavə edək
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: userId,
        role: "sectoradmin",
        sector_id: sectorId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (roleError) {
      console.error("Rol əlavə edilmə xətası:", roleError);
      return { 
        success: false, 
        error: roleError.message || "İstifadəçi rolu əlavə edilə bilmədi" 
      };
    }

    // Sektora admini təyin edək
    const { error: sectorError } = await supabaseAdmin
      .from("sectors")
      .update({
        admin_id: userId,
        admin_email: email,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sectorId);

    if (sectorError) {
      console.error("Sektor güncəlləmə xətası:", sectorError);
      return { 
        success: false, 
        error: sectorError.message || "Sektor güncəllənə bilmədi" 
      };
    }

    return { success: true, adminId: userId };
  } catch (error: any) {
    console.error("Admin yaradılarkən xəta:", error);
    return { 
      success: false, 
      error: error.message || "Admin yaradılarkən xəta baş verdi" 
    };
  }
}
