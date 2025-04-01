
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.20.0';

/**
 * CORS headers for cross-origin requests
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Konsolda daha çox məlumat göstərmək üçün konsol loq əlavə edək
console.log('Region operations servisi işə düşdü.');

/**
 * Main server function that handles all incoming requests
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request data
    const { action, ...data } = await req.json();
    console.log(`Received request with action: ${action}`);
    console.log(`Sorğu məlumatları:`, data);

    // Dispatch based on action type
    switch (action) {
      case 'create':
        return await handleCreateRegion(supabase, data);
      case 'update':
        return await handleUpdateRegion(supabase, data);
      case 'delete':
        return await handleDeleteRegion(supabase, data);
      case 'get-admin-email':
        return await handleGetAdminEmail(supabase, data.userId);
      default:
        return new Response(
          JSON.stringify({ success: false, error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Creates a new region and optionally an associated admin user
 * 
 * @param supabase - Supabase client instance
 * @param data - Request data containing region and admin details
 * @returns Response with created region and admin data
 */
async function handleCreateRegion(supabase: SupabaseClient, data: any) {
  const { name, description, status, adminEmail, adminName, adminPassword } = data;

  try {
    // Validate required fields
    if (!name) {
      return new Response(
        JSON.stringify({ success: false, error: "Region name is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create the region first
    const { data: region, error: regionError } = await supabase
      .from('regions')
      .insert([{
        name,
        description,
        status: status || 'active'
      }])
      .select('*')
      .single();

    if (regionError) {
      console.error("Region creation error:", regionError);
      throw regionError;
    }
    
    console.log(`Region created successfully: ${region.name} (${region.id})`);
    
    let userId = null;
    let adminData = null;
    
    // If admin details are provided, create/update admin
    if (adminEmail && adminName && adminPassword) {
      console.log(`Processing admin for region: ${region.id}`);
      console.log(`Admin yaradılır: ${adminEmail}, ${adminName}, şifrə: ${adminPassword.substring(0, 3)}*****`);

      try {
        // Create the user
        const { data: userData, error: createUserError } = await supabase
          .auth
          .admin
          .createUser({
            email: adminEmail,
            password: adminPassword,
            email_confirm: true,
            user_metadata: { 
              full_name: adminName,
              role: 'regionadmin',
              region_id: region.id 
            }
          });

        if (createUserError) {
          console.error('Admin creation error:', createUserError);
          throw createUserError;
        }
        
        userId = userData.user.id;
        console.log(`Created new user with ID: ${userId}`);
        
        adminData = {
          id: userId,
          email: adminEmail,
          name: adminName
        };
        
        // Add entry to user_roles table to properly link the admin with the region
        const { error: roleError } = await supabase
          .from('user_roles')
          .upsert([{
            user_id: userId,
            role: 'regionadmin',
            region_id: region.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
        
        if (roleError) {
          console.error('Error adding role:', roleError);
          throw roleError;
        }
        
        console.log(`Added role 'regionadmin' for user: ${userId}, region: ${region.id}`);
        
        // Update the region with admin_id
        const { data: updatedRegion, error: updateError } = await supabase
          .from('regions')
          .update({ admin_id: userId })
          .eq('id', region.id)
          .select('*')
          .single();
          
        if (updateError) {
          console.error('Error updating region with admin_id:', updateError);
          throw updateError;
        }
        
        if (updatedRegion) {
          console.log(`Updated region with admin_id: ${userId}`);
          // Use the updated region data
          Object.assign(region, updatedRegion);
        }

        // Create/Update profile
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([{
            id: userId,
            full_name: adminName,
            email: adminEmail,
            language: 'az',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
          
        if (profileError) {
          console.error('Error creating/updating profile:', profileError);
          throw profileError;
        }
        
        console.log(`Profile created/updated for user: ${userId}`);
      } catch (adminError) {
        console.error('Admin creation process error:', adminError);
        // Return region without admin
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: { 
              region,
              error: adminError.message
            } 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log(`Region creation process completed successfully`);
    return new Response(
      JSON.stringify({
        success: true, 
        data: { 
          region,
          admin: adminData
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Region creation error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Updates an existing region and optionally its admin user
 * 
 * @param supabase - Supabase client instance
 * @param data - Request data containing region and admin details
 * @returns Response with updated region data
 */
async function handleUpdateRegion(supabase: SupabaseClient, data: any) {
  const { id, name, description, status, adminEmail, adminName, adminPassword } = data;
  
  try {
    // Validate required fields
    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: "Region ID is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Update region data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    
    // Only update if there are fields to update
    if (Object.keys(updateData).length > 0) {
      const { data: region, error: updateError } = await supabase
        .from('regions')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();
        
      if (updateError) {
        console.error("Region update error:", updateError);
        throw updateError;
      }
      
      console.log(`Region updated successfully: ${region.name} (${region.id})`);
      
      // If admin details are provided, update admin
      if (adminEmail && adminName) {
        // Check if region has an admin_id
        if (region.admin_id) {
          // Update existing admin
          // Code to update admin would go here
          console.log(`Admin update for region ${region.id} would go here`);
        } else if (adminPassword) {
          // Create new admin for region
          // Code to create admin would go here
          console.log(`Admin creation for region ${region.id} would go here`);
        }
      }
      
      return new Response(
        JSON.stringify({ success: true, data: { region } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // No updates provided
      const { data: region, error: getError } = await supabase
        .from('regions')
        .select('*')
        .eq('id', id)
        .single();
        
      if (getError) {
        console.error("Region fetch error:", getError);
        throw getError;
      }
      
      return new Response(
        JSON.stringify({ success: true, data: { region } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Region update error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Deletes a region and handles related cleanup
 * 
 * @param supabase - Supabase client instance
 * @param data - Request data containing region ID
 * @returns Response indicating success or failure
 */
async function handleDeleteRegion(supabase: SupabaseClient, data: any) {
  const { regionId } = data;

  try {
    // Validate required fields
    if (!regionId) {
      return new Response(
        JSON.stringify({ success: false, error: "Region ID is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // First, update the sectors to remove references to this region
    const { error: sectorUpdateError } = await supabase
      .from('sectors')
      .update({ region_id: null, status: 'inactive' })
      .eq('region_id', regionId);
      
    if (sectorUpdateError) {
      console.error("Sector update error:", sectorUpdateError);
    } else {
      console.log(`Updated sectors for region: ${regionId}`);
    }
    
    // Update the schools to remove references to this region
    const { error: schoolUpdateError } = await supabase
      .from('schools')
      .update({ region_id: null, status: 'inactive' })
      .eq('region_id', regionId);
      
    if (schoolUpdateError) {
      console.error("School update error:", schoolUpdateError);
    } else {
      console.log(`Updated schools for region: ${regionId}`);
    }
    
    // Find admin users for this region
    const { data: adminRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('region_id', regionId)
      .eq('role', 'regionadmin');
      
    if (rolesError) {
      console.error("Roles fetch error:", rolesError);
    } else if (adminRoles && adminRoles.length > 0) {
      console.log(`Found ${adminRoles.length} admin(s) for region: ${regionId}`);
      
      for (const role of adminRoles) {
        try {
          // Deactivate admin profile
          const { error: profileUpdateError } = await supabase
            .from('profiles')
            .update({ status: 'inactive' })
            .eq('id', role.user_id);
            
          if (profileUpdateError) {
            console.error(`Profile update error for user ${role.user_id}:`, profileUpdateError);
          } else {
            console.log(`Deactivated profile for user: ${role.user_id}`);
          }
          
          // Delete user role
          const { error: roleDeleteError } = await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', role.user_id)
            .eq('region_id', regionId);
            
          if (roleDeleteError) {
            console.error(`Role deletion error for user ${role.user_id}:`, roleDeleteError);
          } else {
            console.log(`Deleted role for user: ${role.user_id}`);
          }
        } catch (adminError) {
          console.error("Admin cleanup error:", adminError);
        }
      }
    }
    
    // Delete the region
    const { error: regionDeleteError } = await supabase
      .from('regions')
      .delete()
      .eq('id', regionId);

    if (regionDeleteError) {
      console.error("Region deletion error:", regionDeleteError);
      throw regionDeleteError;
    }
    
    console.log(`Region ${regionId} uğurla silindi`);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Region deletion error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Retrieves the email address for a given user ID
 * 
 * @param supabase - Supabase client instance
 * @param userId - User ID to look up
 * @returns Response with the user's email
 */
async function handleGetAdminEmail(supabase: SupabaseClient, userId: string) {
  try {
    // Validate required fields
    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: "User ID is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // First try to get the email from profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    if (!profileError && profile && profile.email) {
      return new Response(
        JSON.stringify({ success: true, email: profile.email }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // If no email in profiles, try to get from auth database
    try {
      const { data: userData, error: userError } = await supabase
        .auth
        .admin
        .getUserById(userId);
        
      if (userError) {
        console.error("User fetch error:", userError);
        throw userError;
      }
      
      if (!userData || !userData.user) {
        throw new Error("User not found");
      }
      
      const email = userData.user.email;
      
      // Update the profile with this email
      if (email) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ email })
          .eq('id', userId);
          
        if (updateError) {
          console.error(`Profile update error for user ${userId}:`, updateError);
        } else {
          console.log(`Updated profile email for user: ${userId}`);
        }
      }
      
      return new Response(
        JSON.stringify({ success: true, email }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (authError) {
      console.error("Auth fetch error:", authError);
      throw authError;
    }
  } catch (error) {
    console.error("Email retrieval error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
