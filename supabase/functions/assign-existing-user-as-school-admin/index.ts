
// Assign an existing user as school admin function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders } from "./cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

type UserData = {
  id: string;
  email: string;
  full_name?: string;
};

type SchoolData = {
  id: string;
  name: string;
  region_id: string;
  sector_id: string;
};

type RequestBody = {
  userId: string;
  schoolId: string;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Əgər method POST deyilsə, xəta qaytaraq
    if (req.method !== "POST") {
      console.error("Invalid method:", req.method);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Method not allowed. Only POST is supported." 
        }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // JWT token-i yoxla
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "No authorization header" 
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Supabase klienti yaradan düzgün açarları yoxlayaq
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Server configuration error. Missing Supabase environment variables." 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase clients
    const supabaseAdmin = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const supabaseClient = createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Request body-ni JSON olaraq alaq
    let body: RequestBody;
    try {
      body = await req.json();
    } catch (error) {
      console.error("Invalid JSON in request body:", error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid JSON in request body" 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { userId, schoolId } = body;

    // Parametrləri yoxla
    if (!userId || !schoolId) {
      const missingParam = !userId ? "userId" : "schoolId";
      console.error(`Missing required parameter: ${missingParam}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Missing required parameter: ${missingParam}` 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Əvvəlcə user və school məlumatlarını əldə et
    const { data: userData, error: userError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      console.error("Error fetching user data:", userError || "User not found");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: userError?.message || "User not found" 
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: schoolData, error: schoolError } = await supabaseAdmin
      .from("schools")
      .select("id, name, region_id, sector_id")
      .eq("id", schoolId)
      .single();

    if (schoolError || !schoolData) {
      console.error("Error fetching school data:", schoolError || "School not found");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: schoolError?.message || "School not found" 
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // DB transaksiyalarını başlat
    // 1. Əgər istifadəçi artıq admin təyin olunubsa, user_roles-u yoxla və yenilə
    const { data: existingRole, error: roleCheckError } = await supabaseAdmin
      .from("user_roles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (roleCheckError && roleCheckError.code !== "PGRST116") {
      // PGRST116 - no rows found, and that's fine
      console.error("Error checking existing user role:", roleCheckError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Error checking existing user role: ${roleCheckError.message}` 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 2. Məktəbin mövcud adminini yoxla
    const { data: existingSchoolAdmin, error: schoolAdminCheckError } = await supabaseAdmin
      .from("schools")
      .select("admin_id, admin_email")
      .eq("id", schoolId)
      .single();

    if (schoolAdminCheckError) {
      console.error("Error checking existing school admin:", schoolAdminCheckError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Error checking existing school admin: ${schoolAdminCheckError.message}` 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Transaksiyalara başla
    let success = true;
    let errorMessage = "";

    // 1. İstifadəçinin rolunu təyin et (yeni əlavə et və ya mövcudu yenilə)
    const roleOperation = existingRole
      ? supabaseAdmin
          .from("user_roles")
          .update({
            role: "schooladmin",
            school_id: schoolId,
            region_id: schoolData.region_id,
            sector_id: schoolData.sector_id,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
      : supabaseAdmin
          .from("user_roles")
          .insert({
            user_id: userId,
            role: "schooladmin",
            school_id: schoolId,
            region_id: schoolData.region_id,
            sector_id: schoolData.sector_id,
          });

    const { error: roleUpdateError } = await roleOperation;

    if (roleUpdateError) {
      console.error("Error updating user role:", roleUpdateError);
      success = false;
      errorMessage = `Error updating user role: ${roleUpdateError.message}`;
    }

    // 2. Məktəbi yenilə
    if (success) {
      const { error: schoolUpdateError } = await supabaseAdmin
        .from("schools")
        .update({
          admin_id: userId,
          admin_email: userData.email,
          updated_at: new Date().toISOString(),
        })
        .eq("id", schoolId);

      if (schoolUpdateError) {
        console.error("Error updating school:", schoolUpdateError);
        success = false;
        errorMessage = `Error updating school: ${schoolUpdateError.message}`;
      }
    }

    // 3. Audit log əlavə et
    if (success) {
      try {
        const { error: auditLogError } = await supabaseAdmin
          .from("audit_logs")
          .insert({
            entity_type: "school_admin",
            action: "assign",
            entity_id: schoolId,
            user_id: userId,
            old_value: existingSchoolAdmin
              ? { admin_id: existingSchoolAdmin.admin_id, admin_email: existingSchoolAdmin.admin_email }
              : null,
            new_value: { admin_id: userId, admin_email: userData.email },
          });

        if (auditLogError) {
          console.error("Error creating audit log:", auditLogError);
          // Audit log xətası əsas əməliyyatı dayandırmasın
        }
      } catch (err) {
        console.error("Exception in audit log:", err);
        // Audit log xətası əsas əməliyyatı dayandırmasın
      }
    }

    if (!success) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMessage 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Uğurlu halda cavab
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          user: {
            id: userData.id,
            email: userData.email,
            full_name: userData.full_name,
          },
          school: {
            id: schoolData.id,
            name: schoolData.name,
          },
          isNewAssignment: !existingSchoolAdmin?.admin_id,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Unexpected error: ${error instanceof Error ? error.message : String(error)}` 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
