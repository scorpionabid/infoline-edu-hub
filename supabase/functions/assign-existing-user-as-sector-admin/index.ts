
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// Supabase URL və anahtarları əldə etmək
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

console.log("Supabase URL:", supabaseUrl);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// İstifadəçi autentifikasiyası və yoxlanması funksiyası
async function authenticateUser(authHeader: string | null) {
  if (!authHeader) {
    console.error("Auth header mövcud deyil");
    throw new Error("İstifadəçi autentifikasiya olunmayıb");
  }

  const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: authHeader },
    },
  });

  const { data: { user: currentUser }, error: userError } = await supabaseAuth.auth.getUser();

  if (userError || !currentUser) {
    console.error("İstifadəçi autentifikasiya xətası:", userError);
    throw new Error(userError?.message || "İstifadəçi autentifikasiya olunmayıb");
  }

  console.log("Cari istifadəçi:", currentUser.id, currentUser.email);
  return { supabaseAuth, currentUser };
}

// İstifadəçi rolunu yoxlama funksiyası
async function checkUserRole(supabaseAuth: any, userId: string) {
  const { data: userRoleData, error: userRoleError } = await supabaseAuth
    .from("user_roles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (userRoleError || !userRoleData) {
    console.error("İstifadəçi rolu sorğusu xətası:", userRoleError);
    throw new Error(userRoleError?.message || "İstifadəçi rolu tapılmadı");
  }

  return userRoleData;
}

// İstəyin parametrlərini yoxlama funksiyası
function validateRequestParams(params: { sectorId?: string, userId?: string }) {
  if (!params.sectorId || !params.userId) {
    const errorMessage = !params.sectorId 
      ? "Sektor ID təyin edilməyib" 
      : "İstifadəçi ID təyin edilməyib";
    
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}

// Sektoru yoxlama funksiyası
async function checkSector(supabase: any, sectorId: string) {
  const { data: sector, error: sectorError } = await supabase
    .from("sectors")
    .select("*")
    .eq("id", sectorId)
    .single();

  if (sectorError || !sector) {
    console.error("Sektor sorğusu xətası:", sectorError);
    throw new Error(sectorError?.message || "Sektor tapılmadı");
  }

  return sector;
}

// Region admini səlahiyyətlərini yoxlama funksiyası
function checkRegionAdminPermissions(userRoleData: any, sector: any) {
  if (userRoleData.role === "regionadmin" && sector.region_id !== userRoleData.region_id) {
    console.error("İcazəsiz giriş - region admini yalnız öz regionuna aid sektorlara admin təyin edə bilər");
    throw new Error("Siz yalnız öz regionunuza aid sektorlara admin təyin edə bilərsiniz");
  }
}

// Sektorun mövcud adminini yoxlama funksiyası
function checkExistingSectorAdmin(sector: any) {
  if (sector.admin_id) {
    const errorMessage = "Bu sektora artıq admin təyin edilib";
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}

// İstifadəçini yoxlama funksiyası
async function checkUser(supabase: any, userId: string) {
  const { data: authUser, error: userError } = await supabase.auth.admin.getUserById(userId);

  if (userError || !authUser.user) {
    console.error("İstifadəçi sorğusu xətası:", userError);
    throw new Error(userError?.message || "İstifadəçi tapılmadı");
  }

  return authUser;
}

// İstifadəçi metadatasını yeniləmə funksiyası
async function updateUserMetadata(supabase: any, userId: string, authUser: any, sectorId: string) {
  const { error: updateUserError } = await supabase.auth.admin.updateUserById(
    userId,
    {
      user_metadata: {
        ...authUser.user.user_metadata,
        role: "sectoradmin",
        sector_id: sectorId
      }
    }
  );

  if (updateUserError) {
    console.error("İstifadəçi metadata yeniləmə xətası:", updateUserError);
    throw new Error(updateUserError.message || "İstifadəçi metadata yeniləmə xətası");
  }
}

// İstifadəçi rolunu əlavə etmə funksiyası
async function addUserRole(supabase: any, userId: string, sectorId: string, regionId: string) {
  const { error: userRoleError } = await supabase
    .from("user_roles")
    .upsert({
      user_id: userId,
      role: "sectoradmin",
      sector_id: sectorId,
      region_id: regionId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "user_id,role"
    });

  if (userRoleError) {
    console.error("İstifadəçi rolu əlavə edilmə xətası:", userRoleError);
    throw new Error(userRoleError.message || "İstifadəçi rolu əlavə edilmə xətası");
  }
}

// Sektora admin təyin etmə funksiyası
async function updateSectorAdmin(supabase: any, sectorId: string, userId: string, userEmail: string) {
  const { error: updateSectorError } = await supabase
    .from("sectors")
    .update({
      admin_id: userId,
      admin_email: userEmail,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sectorId);

  if (updateSectorError) {
    console.error("Sektor güncəlləmə xətası:", updateSectorError);
    throw new Error(updateSectorError.message || "Sektor güncəlləmə xətası");
  }
}

// Audit log əlavə etmə funksiyası
async function addAuditLog(supabase: any, currentUserId: string, action: string, entityType: string, 
                          entityId: string, newValue: any) {
  const { error: auditLogError } = await supabase
    .from("audit_logs")
    .insert({
      user_id: currentUserId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      new_value: newValue
    });
  
  if (auditLogError) {
    console.warn("Audit log əlavə edilmə xətası:", auditLogError);
    // Bu xəta əsas işi bloklamasın - sadəcə loglanır
  }
}

// Əsas servis funksiyası
serve(async (req) => {
  // CORS preflight sorğuları
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // İstifadəçinin autentifikasiya məlumatlarını əldə et
    const authHeader = req.headers.get("Authorization");
    console.log("Auth header:", authHeader ? "Mövcuddur" : "Mövcud deyil");

    // İstifadəçi autentifikasiyası və məlumatların əldə edilməsi
    const { supabaseAuth, currentUser } = await authenticateUser(authHeader);

    // İstifadəçinin rolunu əldə et və yoxla
    const userRoleData = await checkUserRole(supabaseAuth, currentUser.id);
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
    try {
      validateRequestParams(requestData);
    } catch (error) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
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

    try {
      // Sektoru yoxla
      const sector = await checkSector(supabase, requestData.sectorId);

      // Region admini üçün əlavə yoxlamalar
      try {
        checkRegionAdminPermissions(userRoleData, sector);
      } catch (error) {
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
        );
      }

      // Sektorun mövcud admininin olub-olmadığını yoxla
      try {
        checkExistingSectorAdmin(sector);
      } catch (error) {
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      // İstifadəçini yoxla
      const authUser = await checkUser(supabase, requestData.userId);

      // İstifadəçi metadatasını yenilə
      await updateUserMetadata(supabase, requestData.userId, authUser, requestData.sectorId);

      // İstifadəçi rolunu əlavə et
      await addUserRole(supabase, requestData.userId, requestData.sectorId, sector.region_id);

      // Sektora admin təyin et
      await updateSectorAdmin(supabase, requestData.sectorId, requestData.userId, authUser.user.email);

      // Audit logu əlavə et
      await addAuditLog(
        supabase, 
        currentUser.id, 
        "assign_sector_admin",
        "sector",
        requestData.sectorId,
        {
          admin_id: requestData.userId,
          admin_email: authUser.user.email,
          sector_id: requestData.sectorId,
          sector_name: sector.name,
          assigned_by: currentUser.email,
          assigned_by_role: userRole
        }
      );

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
      console.error("Funksiya icra xətası:", error);
      return new Response(
        JSON.stringify({ success: false, error: error.message || "Funksiya icra xətası" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
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
