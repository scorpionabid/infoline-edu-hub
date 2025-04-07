
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { supabaseUrl } from "./config.ts";

interface AuthResult {
  authorized: boolean;
  userData?: {
    id: string;
    email: string;
    role: string;
    region_id?: string;
  };
  error?: string;
  status?: number;
}

/**
 * JWT Token doğrulama və istifadəçi məlumatlarını əldə etmə
 * @param authHeader Authorization başlığı
 * @returns Auth nəticəsi
 */
export async function authenticateAndAuthorize(authHeader: string): Promise<AuthResult> {
  try {
    // SUPABASE_SERVICE_ROLE_KEY-i birbaşa Deno.env-dən alırıq
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseServiceRoleKey) {
      console.error("SUPABASE_SERVICE_ROLE_KEY mövcud deyil");
      return {
        authorized: false,
        error: "Server konfigurasiyası xətası",
        status: 500
      };
    }
    
    if (!authHeader.startsWith("Bearer ")) {
      console.error("Dözgün olmayan auth header formatı");
      return {
        authorized: false,
        error: "Avtorizasiya başlığı düzgün formatda deyil",
        status: 401
      };
    }

    // JWT Token
    const token = authHeader.replace("Bearer ", "");
    console.log("JWT token mövcuddur, uzunluq:", token.length);
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
    // JWT token-dən istifadəçi ID-ni əldə et
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !userData.user) {
      console.error("İstifadəçi autentifikasiya xətası:", authError);
      return {
        authorized: false,
        error: `Avtorizasiya xətası: ${authError?.message || "Token doğrulaması uğursuz oldu"}`,
        status: 401
      };
    }
    
    console.log("Auth uğurludur, userData:", userData.user.id, userData.user.email);
    
    // İstifadəçinin rolunu əldə et
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", userData.user.id)
      .maybeSingle();
    
    if (roleError) {
      console.error("İstifadəçi rolu sorğu xətası:", roleError);
      return {
        authorized: false,
        error: "İstifadəçi rolu tapılmadı",
        status: 403
      };
    }
    
    if (!roleData) {
      console.error("İstifadəçi rolu tapılmadı");
      return {
        authorized: false,
        error: "İstifadəçi rolu tapılmadı",
        status: 403
      };
    }
    
    const role = roleData.role as string;
    console.log("İstifadəçi rolu:", role);
    
    // Yalnız superadmin və regionadmin rolları icazəlidir
    if (role !== "superadmin" && role !== "regionadmin") {
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
        email: userData.user.email || "",
        role: role,
        region_id: roleData.region_id
      }
    };
  } catch (error) {
    console.error("Auth emalı zamanı xəta:", error);
    return {
      authorized: false,
      error: `Auth emalı zamanı xəta: ${error instanceof Error ? error.message : 'Bilinməyən xəta'}`,
      status: 500
    };
  }
}
