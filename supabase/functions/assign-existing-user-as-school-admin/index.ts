
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
        global: {
          headers: {
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
          }
        }
      }
    );
    
    const token = authHeader.replace('Bearer ', '');
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

    // Cari istifadəçinin kimliyini və rolunu yoxlayaq
    const { data: { user: currentUser }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !currentUser) {
      console.error("JWT token verification error:", userError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Authorization error - token not verified" 
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    console.log(`Current user ID: ${currentUser.id}`);
    
    // İstifadəçinin rolunu əldə edək
    const { data: userRoleData, error: userRoleError } = await supabaseAdmin
      .from("user_roles")
      .select("role, region_id")
      .eq("user_id", currentUser.id)
      .single();
    
    if (userRoleError) {
      console.error("Error fetching user role:", userRoleError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Error fetching user role" 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Yalnız superadmin və regionadmin bu əməliyyatı edə bilər
    if (!userRoleData || (userRoleData.role !== 'superadmin' && userRoleData.role !== 'regionadmin')) {
      console.error("Unauthorized role:", userRoleData?.role);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "You do not have permission to assign school admins" 
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

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

    // Məktəb məlumatlarını əldə et
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

    // Regionadmin üçün əlavə yoxlama - yalnız öz regionuna aid məktəblər üçün admin təyin edə bilər
    if (userRoleData.role === 'regionadmin' && userRoleData.region_id !== schoolData.region_id) {
      console.error("Region admin can only assign admins to schools in their region");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "You can only assign admins to schools in your region" 
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // İstifadəçi məlumatlarını əldə et
    const { data: userData, error: userError2 } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name")
      .eq("id", userId)
      .single();

    if (userError2 || !userData) {
      console.error("Error fetching user data:", userError2 || "User not found");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: userError2?.message || "User not found" 
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Əgər istifadəçi artıq admin təyin olunubsa, user_roles-u yoxla
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

    // Məktəbin mövcud adminini yoxla
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
    console.log(`İstifadəçi rolu yenilənir. UserId: ${userId}, SchoolId: ${schoolId}`);
    
    let roleUpdateError: any = null;
    
    try {
      // Əgər istifadəçinin mövcud rolu varsa, yenilə, yoxdursa əlavə et
      if (existingRole) {
        console.log(`Mövcud rol yenilənir. UserId: ${userId}, Role: schooladmin`);
        
        const { error: updateRoleError } = await supabaseAdmin
          .from("user_roles")
          .update({
            role: "schooladmin",
            region_id: schoolData.region_id,
            sector_id: schoolData.sector_id,
            school_id: schoolId,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", userId);
        
        if (updateRoleError) {
          console.error("Error updating user role:", updateRoleError);
          roleUpdateError = updateRoleError;
        } else {
          console.log(`İstifadəçi rolu uğurla yeniləndi. UserId: ${userId}`);
        }
      } else {
        console.log(`Yeni rol əlavə edilir. UserId: ${userId}, Role: schooladmin`);
        
        const { error: insertRoleError } = await supabaseAdmin
          .from("user_roles")
          .insert({
            user_id: userId,
            role: "schooladmin",
            region_id: schoolData.region_id,
            sector_id: schoolData.sector_id,
            school_id: schoolId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (insertRoleError) {
          console.error("Error inserting user role:", insertRoleError);
          roleUpdateError = insertRoleError;
        } else {
          console.log(`İstifadəçi rolu uğurla əlavə edildi. UserId: ${userId}`);
        }
      }
    } catch (prepError: any) {
      console.error('Rol əməliyyatı zamanı istisna:', prepError);
      roleUpdateError = { message: `İstisna: ${prepError?.message || 'Bilinməyən xəta'}` };
    }

    if (roleUpdateError) {
      console.error("Error updating user role:", roleUpdateError);
      success = false;
      errorMessage = `Error updating user role: ${roleUpdateError.message}`;
    }

    // 2. Məktəbi yenilə
    if (success) {
      try {
        console.log(`Məktəb yenilənir. SchoolId: ${schoolId}, AdminId: ${userId}`);
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
        } else {
          console.log(`Məktəb uğurla yeniləndi. SchoolId: ${schoolId}`);
        }
      } catch (schoolUpdateException: any) {
        console.error("Exception during school update:", schoolUpdateException);
        success = false;
        errorMessage = `Exception during school update: ${schoolUpdateException?.message || 'Unknown error'}`;
      }
    }

    // 3. Audit log əlavə et
    if (success) {
      try {
        console.log(`Audit log yaradılır. SchoolId: ${schoolId}, UserId: ${userId}`);
        
        // Audit log üçün məlumatları hazırla
        const oldValue = existingSchoolAdmin
          ? { admin_id: existingSchoolAdmin.admin_id, admin_email: existingSchoolAdmin.admin_email }
          : null;
        
        const newValue = { admin_id: userId, admin_email: userData.email };
        
        const { error: auditLogError } = await supabaseAdmin
          .from("audit_logs")
          .insert({
            user_id: currentUser.id, // Admin təyin edən istifadəçinin ID-si
            action: 'assign',
            entity_type: 'school_admin',
            entity_id: schoolId,
            old_value: oldValue,
            new_value: newValue,
            created_at: new Date().toISOString()
          });
        
        if (auditLogError) {
          console.error("Error creating audit log:", auditLogError);
          // Audit log xətası uğursuzluq sayılmır, sadəcə qeyd edirik
        } else {
          console.log('Audit log uğurla yaradıldı');
        }
      } catch (auditError: any) {
        console.error("Exception creating audit log:", auditError);
        console.error("Error message:", auditError?.message || 'Bilinməyən xəta');
        // Audit log istisnaları uğursuzluq sayılmır, sadəcə qeyd edirik
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
