
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

// Auth istifadəçisinin mövcudluğunu yoxlamaq üçün funksiya
async function checkUserEmailExists(email: string): Promise<boolean> {
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

// Admin istifadəçisi yaratmaq üçün funksiya
async function createAdminUser(name: string, email: string, password: string, sectorId: string) {
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
      throw authError;
    }

    if (!authUser.user) {
      throw new Error("Auth istifadəçisi yaradıla bilmədi");
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
      throw profileError;
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
      throw roleError;
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
      throw sectorError;
    }

    return { success: true, adminId: userId };
  } catch (error) {
    console.error("Admin yaradılarkən xəta:", error);
    throw error;
  }
}

// Region admini təyin etmək üçün əsas funksiya
async function assignSectorAdmin(sectorId: string, adminName: string, adminEmail: string, adminPassword: string) {
  try {
    // İstifadəçinin mövcudluğunu yoxlayaq
    const userExists = await checkUserEmailExists(adminEmail);
    
    if (userExists) {
      throw new Error(`"${adminEmail}" email ünvanı ilə istifadəçi artıq mövcuddur.`);
    }

    // Sektorun mövcudluğunu yoxlayaq
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: sector, error: sectorError } = await supabase
      .from("sectors")
      .select("*")
      .eq("id", sectorId)
      .single();

    if (sectorError || !sector) {
      console.error("Sektor mövcudluq yoxlaması xətası:", sectorError);
      throw new Error("Sektor tapılmadı");
    }

    // Sektorun admininin artıq təyin edilib-edilmədiyini yoxlayaq
    if (sector.admin_id) {
      throw new Error("Bu sektora artıq admin təyin edilib");
    }

    // Admin istifadəçisini yaradaq
    const result = await createAdminUser(adminName, adminEmail, adminPassword, sectorId);
    return { success: true, message: "Sektor admini uğurla təyin edildi", adminId: result.adminId };
  } catch (error) {
    console.error("Sektor admini təyin edilərkən xəta:", error);
    return { success: false, error: error.message || "Sektor admini təyin edilərkən xəta baş verdi" };
  }
}

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
      adminName: "***",
      adminEmail: requestData.adminEmail ? `${requestData.adminEmail.substring(0, 3)}***` : undefined,
      currentUserEmail: requestData.currentUserEmail ? `${requestData.currentUserEmail.substring(0, 3)}***` : undefined,
    });

    // Admin təyin et
    const result = await assignSectorAdmin(
      requestData.sectorId,
      requestData.adminName,
      requestData.adminEmail,
      requestData.adminPassword
    );

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: result.success ? 200 : 400,
    });
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
