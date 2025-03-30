
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.20.0';

console.log("Listening on http://localhost:9999/");

serve(async (req) => {
  try {
    // CORS
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request data
    const { action, ...data } = await req.json();
    console.log("Request data:", { action, ...data });

    // Dispatch based on action
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
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

async function handleCreateRegion(supabase: SupabaseClient, data: any) {
  const { name, description, status, adminEmail, adminName, adminPassword } = data;

  try {
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

    if (regionError) throw regionError;
    
    // If admin details are provided, create/update admin
    if (adminEmail && adminName) {
      console.log(`Creating admin with email: ${adminEmail}, name: ${adminName}, password: ${adminPassword.substring(0, 3)}*****`);

      // Check if user exists
      const { data: existingUser } = await supabase.auth.admin.getUserByEmail(adminEmail);
      let userId;
      
      if (existingUser?.user) {
        // User exists, update their metadata
        userId = existingUser.user.id;
        
        // Update the user's metadata
        await supabase.auth.admin.updateUserById(userId, {
          user_metadata: { 
            full_name: adminName,
            role: 'regionadmin',
            region_id: region.id 
          }
        });
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

        if (userError) throw userError;
        userId = newUser.user.id;
      }

      // Check if profile exists and create/update
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (existingProfile) {
        console.log("Profil tapıldı:", existingProfile);
        
        // Update profile email field
        await supabase
          .from('profiles')
          .update({ email: adminEmail })
          .eq('id', userId);
      } else {
        // Create profile
        await supabase
          .from('profiles')
          .insert([{
            id: userId,
            full_name: adminName,
            email: adminEmail,
            language: 'az',
            status: 'active'
          }]);
      }

      // Create region_admin role if it doesn't exist
      try {
        const { data: existingRoles } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', userId)
          .eq('role', 'regionadmin');
        
        if (!existingRoles || existingRoles.length === 0) {
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert([{
              user_id: userId,
              role: 'regionadmin',
              region_id: region.id
            }]);

          if (roleError) {
            console.error("Rol əlavə edilməsi xətası:", roleError);
          }
        } else {
          // Update existing role with new region_id
          const { error: updateRoleError } = await supabase
            .from('user_roles')
            .update({ region_id: region.id })
            .eq('user_id', userId)
            .eq('role', 'regionadmin');
          
          if (updateRoleError) {
            console.error("Rol yeniləmə xətası:", updateRoleError);
          }
        }
      } catch (roleError) {
        console.error("Rol yaratma xətası:", roleError);
      }

      console.log(`Region admin ${adminEmail} created/updated for region ${name} with id ${region.id}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: { 
            region,
            admin: { email: adminEmail, name: adminName }
          } 
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return success with region data
    return new Response(
      JSON.stringify({ success: true, data: { region } }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Region yaratma xətası:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function handleUpdateRegion(supabase: SupabaseClient, data: any) {
  // Implementation of update region logic
  // Similar to createRegion but with updates instead of inserts
  return new Response(
    JSON.stringify({ success: true, message: "Not implemented yet" }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}

async function handleDeleteRegion(supabase: SupabaseClient, data: any) {
  const { regionId } = data;

  try {
    // Find admin user for this region
    const { data: adminRoles } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('region_id', regionId)
      .eq('role', 'regionadmin');

    // Delete related sectors and admin roles first
    try {
      // First, update the sectors to remove references to this region
      // This is safer than deleting the sectors
      await supabase
        .from('sectors')
        .update({ region_id: null, status: 'inactive' })
        .eq('region_id', regionId);
      
      // Delete the region
      const { error: regionDeleteError } = await supabase
        .from('regions')
        .delete()
        .eq('id', regionId);

      if (regionDeleteError) {
        console.error("Region silmə xətası:", regionDeleteError);
        throw regionDeleteError;
      }

      // Deactivate admin account
      if (adminRoles && adminRoles.length > 0) {
        for (const role of adminRoles) {
          try {
            await supabase
              .from('user_roles')
              .delete()
              .eq('user_id', role.user_id)
              .eq('role', 'regionadmin')
              .eq('region_id', regionId);
            
            // We don't delete the admin user, just deactivate
            await supabase
              .from('profiles')
              .update({ status: 'inactive' })
              .eq('id', role.user_id);
            
            console.log(`Admin with id ${role.user_id} deactivated`);
          } catch (adminError) {
            console.error("Admin deactivation error:", adminError);
            // Continue with deletion even if admin deactivation fails
          }
        }
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error("Region silmə xətası:", error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Region silmə xətası:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function handleGetAdminEmail(supabase: SupabaseClient, userId: string) {
  try {
    // First try to get the email from profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    if (!profileError && profile && profile.email) {
      return new Response(
        JSON.stringify({ success: true, email: profile.email }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // If no email in profiles, try to get from auth.users
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);

    if (userError || !userData || !userData.user) {
      throw userError || new Error('User not found');
    }

    const email = userData.user.email;

    // Update the profile with this email
    if (email) {
      await supabase
        .from('profiles')
        .update({ email })
        .eq('id', userId);
    }

    return new Response(
      JSON.stringify({ success: true, email }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Email əldə etmə xətası:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
