
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { supabaseUrl, supabaseServiceRoleKey } from "./config.ts";

/**
 * İstifadəçi e-poçtunun mövcudluğunu yoxlayır
 * @param email İstifadəçi emaili
 * @returns İstifadəçinin mövcud olub-olmadığı
 */
export async function checkUserEmailExists(email: string): Promise<boolean> {
  try {
    // Service role keyini istifadə edərək auth işləmləri üçün client yaradaq
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log("Email yoxlanışı:", email);

    // İstifadəçinin mövcudluğunu yoxlayaq
    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers({
      filters: {
        email: email,
      },
    });

    if (error) {
      console.error("Auth istifadəçi yoxlama xətası:", error);
      throw error;
    }

    const exists = users.users.length > 0;
    console.log(`Email "${email}" yoxlanışı: ${exists ? "Mövcuddur" : "Mövcud deyil"}`);
    return exists;
  } catch (error) {
    console.error("İstifadəçi yoxlama xətası:", error);
    return false;
  }
}
