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
    
    // If admin details are provided, create/update admin
    if (adminEmail && adminName && adminPassword) {
      console.log(`Processing admin for region: ${region.id}`);

      try {
        // Check if user exists by email
        const { data: existingUser } = await supabase.auth.admin.getUserByEmail(adminEmail);
        
        if (existingUser?.user) {
          // User exists, update their metadata
          userId = existingUser.user.id;
          console.log(`Existing user found with ID: ${userId}`);
          
          // Update the user's metadata
          await supabase.auth.admin.updateUserById(userId, {
            user_metadata: { 
              full_name: adminName,
              role: 'regionadmin',
              region_id: region.id 
            }
          });
          
          console.log(`Updated metadata for user: ${userId}`);
        } else {
          // Create the user
          const { data: newUser, error: userError } = await supabase.auth.admin.createUser({
            email: adminEmail,
            password: adminPassword,
            email_confirm: true,
            user_metadata: { 
              full_name: adminName,
              role: 'regionadmin',
              region_id: region.id 
            }
          });

          if (userError) {
            console.error('Admin creation error:', userError);
            // Return region without admin
            return new Response(
              JSON.stringify({ 
                success: true, 
                data: { 
                  region,
                  error: userError.message
                } 
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          userId = newUser.user.id;
          console.log(`Created new user with ID: ${userId}`);
        }
        
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
        } else {
          console.log(`Added role 'regionadmin' for user: ${userId}, region: ${region.id}`);
        }
        
        // Update the region with admin_id
        const { data: updatedRegion, error: updateError } = await supabase
          .from('regions')
          .update({ admin_id: userId })
          .eq('id', region.id)
          .select('*')
          .single();
          
        if (updateError) {
          console.error('Error updating region with admin_id:', updateError);
        } else if (updatedRegion) {
          console.log(`Updated region with admin_id: ${userId}`);
          // Use the updated region data
          Object.assign(region, updatedRegion);
        } else {
          // Just update the admin_id in our local copy
          region.admin_id = userId;
          console.log(`Region admin_id set locally to: ${userId}`);
        }

        // Check if profile exists and create/update
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (existingProfile) {
          console.log(`Profile found for user: ${userId}`);
          
          // Update profile email field
          await supabase
            .from('profiles')
            .update({ 
              email: adminEmail,
              full_name: adminName,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);
            
          console.log(`Updated profile for user: ${userId}`);
        } else {
          // Create profile
          await supabase
            .from('profiles')
            .insert([{
              id: userId,
              full_name: adminName,
              email: adminEmail,
              language: 'az',
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }]);
            
          console.log(`Created profile for user: ${userId}`);
        }

        console.log(`Region admin process completed for: ${adminEmail}`);
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: { 
              region,
              admin: { 
                id: userId,
                email: adminEmail, 
                name: adminName 
              }
            } 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
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

    // Return success with region data (no admin created)
    return new Response(
      JSON.stringify({ success: true, data: { region } }),
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
        // Implementation would be similar to handleCreateRegion
        // but with updates to existing admin or creation of new one
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
    
    // Find admin users for this region
    const { data: adminRoles } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('region_id', regionId)
      .eq('role', 'regionadmin');

    // Handle related data and deletion
    try {
      // First, update the sectors to remove references to this region
      // This is safer than deleting the sectors
      const { error: sectorUpdateError } = await supabase
        .from('sectors')
        .update({ region_id: null, status: 'inactive' })
        .eq('region_id', regionId);
        
      if (sectorUpdateError) {
        console.error("Sector update error:", sectorUpdateError);
      } else {
        console.log(`Updated sectors for region: ${regionId}`);
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
      
      console.log(`Deleted region: ${regionId}`);

      // Handle admin users
      if (adminRoles && adminRoles.length > 0) {
        for (const role of adminRoles) {
          try {
            // Delete user roles
            const { error: roleDeleteError } = await supabase
              .from('user_roles')
              .delete()
              .eq('user_id', role.user_id)
              .eq('role', 'regionadmin')
              .eq('region_id', regionId);
              
            if (roleDeleteError) {
              console.error(`Role deletion error for user ${role.user_id}:`, roleDeleteError);
            } else {
              console.log(`Deleted role for user: ${role.user_id}, region: ${regionId}`);
            }
            
            // Deactivate user profile
            const { error: profileUpdateError } = await supabase
              .from('profiles')
              .update({ status: 'inactive' })
              .eq('id', role.user_id);
              
            if (profileUpdateError) {
              console.error(`Profile update error for user ${role.user_id}:`, profileUpdateError);
            } else {
              console.log(`Deactivated profile for user: ${role.user_id}`);
            }
          } catch (adminError) {
            console.error("Admin cleanup error:", adminError);
            // Continue with deletion even if admin cleanup fails
          }
        }
      }

      return new Response(
        JSON.stringify({ success: true, message: "Region deleted successfully" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error("Region deletion process error:", error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
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
      console.log(`Found email in profile for user: ${userId}`);
      return new Response(
        JSON.stringify({ success: true, email: profile.email }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // If no email in profiles, try to get from auth.users
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);

    if (userError || !userData || !userData.user) {
      console.error("User fetch error:", userError);
      throw userError || new Error('User not found');
    }

    const email = userData.user.email;
    console.log(`Found email in auth for user: ${userId}`);

    // Update the profile with this email if it exists
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
  } catch (error) {
    console.error("Email retrieval error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
