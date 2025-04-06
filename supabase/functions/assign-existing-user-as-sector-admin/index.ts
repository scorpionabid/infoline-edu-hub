
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// Supabase URL və anahtarları əldə etmək
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

console.log("Supabase URL:", supabaseUrl);

// CORS başlıqları
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
    // İstifadəçi autentifikasiyasını yoxla
    const authHeader = req.headers.get("Authorization");
    
    if (!authHeader) {
      console.error("Auth header mövcud deyil");
      return new Response(
        JSON.stringify({ success: false, error: "İstifadəçi autentifikasiya olunmayıb" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // İstəyin məlumatlarını əldə et
    const requestData = await req.json();
    console.log("Gələn məlumatları:", {
      sectorId: requestData.sectorId,
      userId: requestData.userId,
    });

    const { sectorId, userId } = requestData;

    // Parametrləri yoxla
    if (!sectorId || !userId) {
      const errorMessage = !sectorId 
        ? "Sektor ID təyin edilməyib" 
        : "İstifadəçi ID təyin edilməyib";
      
      console.error(errorMessage);
      return new Response(
        JSON.stringify({ success: false, error: errorMessage }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Admin client yaratmaq
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // SQL funksiyasını çağır
    console.log(`SQL funksiyası çağırılır: assign_sector_admin(${userId}, ${sectorId})`);
    const { data, error } = await supabase.rpc(
      'assign_sector_admin',
      {
        user_id_param: userId,
        sector_id_param: sectorId
      }
    );

    if (error) {
      console.error('Sektor admin təyin etmə xətası:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message || "Sektor admini təyin edilərkən xəta baş verdi" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (data && !data.success) {
      console.error('SQL funksiyası xətası:', data.error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: data.error || "Sektor admini təyin edilərkən xəta baş verdi" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log('Sektor admin uğurla təyin edildi:', data);

    // Uğurlu nəticə qaytarma
    return new Response(
      JSON.stringify({
        success: true,
        message: "İstifadəçi sektor admini olaraq təyin edildi",
        data: data
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Xəta:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Funksiya icra edilərkən xəta baş verdi",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
