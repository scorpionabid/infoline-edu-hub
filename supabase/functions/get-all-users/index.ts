
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// Supabase URL və ANON KEY-i əldə etmək
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

console.log("Supabase URL:", supabaseUrl);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // CORS preflight sorğuları
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // İstifadəçinin autentifikasiya məlumatlarını əldə et
    const authHeader = req.headers.get("Authorization");
    console.log("Auth header:", authHeader ? "Mövcuddur" : "Mövcud deyil");

    // Supabase client yaratma - autentifikasiya ilə
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader || "" },
      },
    });

    // İstifadəçinin kim olduğunu yoxlayaq
    const { data: { user: currentUser }, error: userError } = await supabaseAuth.auth.getUser();

    if (userError || !currentUser) {
      console.error("İstifadəçi autentifikasiya xətası:", userError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: userError?.message || "İstifadəçi autentifikasiya olunmayıb" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    console.log("Cari istifadəçi:", currentUser.id, currentUser.email);

    // İstifadəçinin rolunu əldə et
    const { data: userRoleData, error: userRoleError } = await supabaseAuth
      .from("user_roles")
      .select("*")
      .eq("user_id", currentUser.id)
      .single();

    if (userRoleError) {
      console.error("İstifadəçi rolu sorğusu xətası:", userRoleError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: userRoleError?.message || "İstifadəçi rolu tapılmadı" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const userRole = userRoleData?.role || "user";
    console.log("İstifadəçi rolu:", userRole);

    // Admin client yaratmaq
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // RPC funksiyasını çağır - bütün istifadəçiləri əldə et
    const { data, error } = await supabase.rpc("get_all_users");
    
    if (error) {
      console.error("RPC funksiya xətası:", error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message || "İstifadəçiləri əldə edərkən xəta baş verdi" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Uğurlu nəticə qaytarma
    return new Response(
      JSON.stringify({
        success: true,
        data
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Xəta:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Funksiya icra edilərkən xəta baş verdi",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
