
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type"
};

interface ResponseData {
  users?: any[];
  error?: string;
}

serve(async (req: Request) => {
  // Handle CORS OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
        auth: {
          persistSession: false,
        },
      }
    );

    // Get users from auth schema
    const { data: authUsers, error: authError } = await supabaseClient.auth.admin.listUsers();

    if (authError) {
      console.error("Error fetching auth users:", authError);
      return new Response(
        JSON.stringify({ error: `Error fetching auth users: ${authError.message}` }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
    
    if (!authUsers || !authUsers.users || authUsers.users.length === 0) {
      return new Response(
        JSON.stringify({ users: [] }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
    // Get user roles
    const userIds = authUsers.users.map(user => user.id);
    
    const { data: userRoles, error: userRolesError } = await supabaseClient
      .from('user_roles')
      .select('*')
      .in('user_id', userIds);
      
    if (userRolesError) {
      console.error("Error fetching user roles:", userRolesError);
      return new Response(
        JSON.stringify({ error: `Error fetching user roles: ${userRolesError.message}` }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
    
    // Create a map of user_id to role data
    const roleMap: Record<string, any> = {};
    if (userRoles) {
      userRoles.forEach(role => {
        roleMap[role.user_id] = role;
      });
    }
    
    // Combine user data with roles and create a response
    const combinedUserData = authUsers.users.map(user => {
      const roleData = roleMap[user.id] || {};
      
      return {
        id: user.id,
        email: user.email || '',
        role: roleData.role || 'user',  // Default to 'user' if no role found
        region_id: roleData.region_id || null,
        sector_id: roleData.sector_id || null,
        school_id: roleData.school_id || null,
      };
    });

    const responseData: ResponseData = {
      users: combinedUserData
    };

    return new Response(
      JSON.stringify(responseData),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
