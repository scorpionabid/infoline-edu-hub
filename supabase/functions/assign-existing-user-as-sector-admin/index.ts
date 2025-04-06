
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

    if (userRoleError || !userRoleData) {
      console.error("İstifadəçi rolu sorğusu xətası:", userRoleError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: userRoleError?.message || "İstifadəçi rolu tapılmadı" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const userRole = userRoleData.role;
    console.log("İstifadəçi rolu:", userRole);

    // Yalnız superadmin və regionadmin rollarına icazə veririk
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

    // Admin client yaratmaq
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

    // Region admini üçün əlavə yoxlamalar
    if (userRole === "regionadmin") {
      // Sektorun regionu ilə istifadəçinin regionu eyni olmalıdır
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
    const { data: authUser, error: userError2 } = await supabase.auth.admin.getUserById(
      requestData.userId
    );

    if (userError2 || !authUser.user) {
      console.error("İstifadəçi sorğusu xətası:", userError2);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: userError2?.message || "İstifadəçi tapılmadı" 
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
    const { error: userRoleError2 } = await supabase
      .from("user_roles")
      .upsert({
        user_id: requestData.userId,
        role: "sectoradmin",
        sector_id: requestData.sectorId,
        region_id: sector.region_id, // region id-ni də əlavə edirik ki, aidiyyətli region müəyyən olsun
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id,role"
      });

    if (userRoleError2) {
      console.error("İstifadəçi rolu əlavə edilmə xətası:", userRoleError2);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: userRoleError2.message || "İstifadəçi rolu əlavə edilmə xətası" 
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

    // Audit logu əlavə et
    const { error: auditLogError } = await supabase
      .from("audit_logs")
      .insert({
        user_id: currentUser.id,
        action: "assign_sector_admin",
        entity_type: "sector",
        entity_id: requestData.sectorId,
        new_value: {
          admin_id: requestData.userId,
          admin_email: authUser.user.email,
          sector_id: requestData.sectorId,
          sector_name: sector.name,
          assigned_by: currentUser.email,
          assigned_by_role: userRole
        }
      });
    
    if (auditLogError) {
      console.warn("Audit log əlavə edilmə xətası:", auditLogError);
      // Bu xəta əsas işi bloklamasın
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
