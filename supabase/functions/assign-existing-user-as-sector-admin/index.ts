
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
    const authHeader = req.headers.get("Authorization");
    console.log("Auth header:", authHeader ? "Mövcuddur" : "Mövcud deyil");

    // İstəyin məlumatlarını əldə et
    const requestData = await req.json();
    console.log("Gələn məlumatları:", {
      sectorId: requestData.sectorId,
      userId: requestData.userId,
    });

    // Parametrləri yoxla
    if (!requestData.sectorId || !requestData.userId) {
      const errorMessage = !requestData.sectorId 
        ? "Sektor ID təyin edilməyib" 
        : "İstifadəçi ID təyin edilməyib";
      
      console.error(errorMessage);
      return new Response(
        JSON.stringify({ success: false, error: errorMessage }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Supabase client yaratma
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Sektoru yoxla
    const { data: sector, error: sectorError } = await supabase
      .from("sectors")
      .select("*")
      .eq("id", requestData.sectorId)
      .single();

    if (sectorError || !sector) {
      console.error("Sektor sorğusu xətası:", sectorError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: sectorError?.message || "Sektor tapılmadı" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Sektorun mövcud admininin olub-olmadığını yoxla
    if (sector.admin_id) {
      const errorMessage = "Bu sektora artıq admin təyin edilib";
      console.error(errorMessage);
      return new Response(
        JSON.stringify({ success: false, error: errorMessage }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // İstifadəçini yoxla
    const { data: authUser, error: userError } = await supabase.auth.admin.getUserById(
      requestData.userId
    );

    if (userError || !authUser.user) {
      console.error("İstifadəçi sorğusu xətası:", userError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: userError?.message || "İstifadəçi tapılmadı" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // İstifadəçi metadatasını yenilə
    const { error: updateUserError } = await supabase.auth.admin.updateUserById(
      requestData.userId,
      {
        user_metadata: {
          ...authUser.user.user_metadata,
          role: "sectoradmin",
          sector_id: requestData.sectorId
        }
      }
    );

    if (updateUserError) {
      console.error("İstifadəçi metadata yeniləmə xətası:", updateUserError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: updateUserError.message || "İstifadəçi metadata yeniləmə xətası" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // İstifadəçi rolunu əlavə et
    const { error: userRoleError } = await supabase
      .from("user_roles")
      .upsert({
        user_id: requestData.userId,
        role: "sectoradmin",
        sector_id: requestData.sectorId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id,role"
      });

    if (userRoleError) {
      console.error("İstifadəçi rolu əlavə edilmə xətası:", userRoleError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: userRoleError.message || "İstifadəçi rolu əlavə edilmə xətası" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Sektora admin təyin et
    const { error: updateSectorError } = await supabase
      .from("sectors")
      .update({
        admin_id: requestData.userId,
        admin_email: authUser.user.email,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestData.sectorId);

    if (updateSectorError) {
      console.error("Sektor güncəlləmə xətası:", updateSectorError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: updateSectorError.message || "Sektor güncəlləmə xətası" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Uğurlu nəticə qaytarma
    return new Response(
      JSON.stringify({
        success: true,
        message: "İstifadəçi sektor admini olaraq təyin edildi",
        data: {
          sectorId: requestData.sectorId,
          userId: requestData.userId,
          adminEmail: authUser.user.email
        }
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
