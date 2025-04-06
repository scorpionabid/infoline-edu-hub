
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
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: userError?.message || "İstifadəçi autentifikasiya olunmayıb" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
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
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: userRoleError.message || "İstifadəçi rolu tapılmadı" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    const userRole = userRoleData.role;
    console.log("İstifadəçi rolu:", userRole);

    // Yalnız superadmin və regionadmin rolları icazəlidir
    if (userRole !== "superadmin" && userRole !== "regionadmin") {
      console.error("İcazəsiz giriş - yalnız superadmin və regionadmin");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Bu əməliyyat üçün superadmin və ya regionadmin səlahiyyətləri tələb olunur" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
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

    // Region admini üçün əlavə yoxlamalar
    if (userRole === "regionadmin") {
      // Sektoru yoxla
      const { data: sector, error: sectorError } = await supabase
        .from("sectors")
        .select("*")
        .eq("id", sectorId)
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

      // Region admini yalnız öz regionuna aid sektorlara admin təyin edə bilər
      if (sector.region_id !== userRoleData.region_id) {
        console.error("İcazəsiz giriş - region admini yalnız öz regionuna aid sektorlara admin təyin edə bilər");
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Siz yalnız öz regionunuza aid sektorlara admin təyin edə bilərsiniz" 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
        );
      }
    }

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
