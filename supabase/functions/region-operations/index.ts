import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateRegionRequest {
  name: string;
  description?: string;
  status?: string;
  adminEmail?: string;
  adminName?: string;
  adminPassword?: string;
  action?: string;
}

interface DeleteRegionRequest {
  regionId: string;
  action?: string;
}

interface GetAdminEmailRequest {
  userId: string;
  action?: string;
}

serve(async (req) => {
  // CORS sorğusu üçün
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Server konfiqurasiyası səhvdir' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Supabase admin client yaratma
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const requestData = await req.json();
    console.log('Request data:', requestData);
    const action = requestData.action;

    if (action === 'create') {
      const { name, description, status, adminEmail, adminName, adminPassword } = requestData as CreateRegionRequest;
      
      if (!name) {
        return new Response(
          JSON.stringify({ error: 'Region adı tələb olunur' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // İlk öncə regionu yaradaq
      const { data: regionData, error: regionError } = await supabaseAdmin
        .from('regions')
        .insert([
          { 
            name, 
            description: description || null, 
            status: status || 'active' 
          }
        ])
        .select()
        .single();
      
      if (regionError) {
        console.error('Region yaradılması xətası:', regionError);
        return new Response(
          JSON.stringify({ error: 'Region yaradılması xətası', details: regionError }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      const regionId = regionData.id;
      let adminId = null;
      let adminData = null;
      
      // Əgər admin məlumatları verilibsə, admin hesabı yaradaq
      if (adminEmail && adminName) {
        // İstifadəçinin təqdim etdiyi parol və ya default parol
        const password = adminPassword || 'Password123';
        
        console.log(`Creating admin with email: ${adminEmail}, name: ${adminName}, password: ${password.substring(0, 3)}*****`);
        
        try {
          // Email formatını təmizləyək - UTF-8 olmayan simvollar problemlər yarada bilər
          const cleanEmail = adminEmail.trim().toLowerCase();
          
          // Əvvəlcə bu email ilə istifadəçi mövcuddursa yoxlayaq
          const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
          const existingUser = existingUsers?.users.find(u => u.email === cleanEmail);
          
          if (existingUser) {
            console.log('Bu email ilə istifadəçi artıq mövcuddur:', existingUser.id);
            adminId = existingUser.id;
            
            // İstifadəçi metadata-sını yeniləyək
            await supabaseAdmin.auth.admin.updateUserById(adminId, {
              user_metadata: {
                full_name: adminName,
                role: 'regionadmin',
                region_id: regionId
              }
            });
          } else {
            // Yeni istifadəçi yaradaq
            const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
              email: cleanEmail,
              password: password,
              email_confirm: true,
              user_metadata: {
                full_name: adminName,
                role: 'regionadmin',
                region_id: regionId
              }
            });
            
            if (userError) {
              console.error('Admin hesabı yaradılması xətası:', userError);
              // Regionu yaratdıq, amma admin yarada bilmədik
              return new Response(
                JSON.stringify({ 
                  success: true, 
                  data: { region: regionData }, 
                  warning: 'Region yaradıldı, lakin admin hesabı yaradıla bilmədi',
                  details: userError 
                }),
                { 
                  status: 201, 
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
                }
              );
            }
            
            adminId = userData.user.id;
          }
          
          // Profilin yaradılmasını gözləyək
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Profili yoxlayaq və ya yaradaq
          const { data: profileData, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', adminId)
            .single();
            
          if (profileError || !profileData) {
            console.log('Profil avtomatik yaradılmayıb, manual yaradaq');
            
            // Profil yaratmağa cəhd edirik
            const { error: createProfileError } = await supabaseAdmin
              .from('profiles')
              .insert([
                {
                  id: adminId,
                  full_name: adminName,
                  language: 'az',
                  status: 'active'
                }
              ]);
              
            if (createProfileError) {
              console.error('Profil yaradılması xətası:', createProfileError);
            }
          } else {
            console.log('Profil tapıldı:', profileData);
            // Profili yeniləyək
            const { error: updateProfileError } = await supabaseAdmin
              .from('profiles')
              .update({
                full_name: adminName,
                updated_at: new Date().toISOString()
              })
              .eq('id', adminId);
            
            if (updateProfileError) {
              console.error('Profil yenilənməsi xətası:', updateProfileError);
            }
          }
          
          // İstifadəçi rolunu əlavə edək/yeniləyək
          // Əvvəlcə mövcud rol qeydini yoxlayaq
          const { data: existingRole } = await supabaseAdmin
            .from('user_roles')
            .select('*')
            .eq('user_id', adminId)
            .eq('role', 'regionadmin')
            .single();
            
          if (existingRole) {
            // Rol mövcuddursa, region_id-ni yeniləyək
            const { error: updateRoleError } = await supabaseAdmin
              .from('user_roles')
              .update({ region_id: regionId })
              .eq('id', existingRole.id);
              
            if (updateRoleError) {
              console.error('Rol yenilənməsi xətası:', updateRoleError);
            }
          } else {
            // Rol mövcud deyilsə, əlavə edək
            const { error: roleError } = await supabaseAdmin
              .from('user_roles')
              .insert([
                {
                  user_id: adminId,
                  role: 'regionadmin',
                  region_id: regionId
                }
              ]);
            
            if (roleError) {
              console.error('Rol əlavə edilməsi xətası:', roleError);
            }
          }
          
          // Admin email məlumatını saxlayaq
          adminData = {
            id: adminId,
            email: cleanEmail,
            name: adminName
          };
          
          console.log(`Region admin ${cleanEmail} created/updated for region ${name} with id ${regionId}`);
        } catch (err) {
          console.error('Admin yaradılması prosesində xəta:', err);
          // Regionu yaratdıq, amma admin yarada bilmədik
          return new Response(
            JSON.stringify({ 
              success: true, 
              data: { region: regionData }, 
              warning: 'Region yaradıldı, lakin admin hesabı yaradılarkən xəta baş verdi',
              details: err
            }),
            { 
              status: 201, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: { 
            region: regionData, 
            admin: adminData
          } 
        }),
        { 
          status: 201, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } 
    else if (action === 'delete') {
      const { regionId } = requestData as DeleteRegionRequest;
      
      if (!regionId) {
        return new Response(
          JSON.stringify({ error: 'Region ID tələb olunur' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // Regionla bağlı adminləri tapaq
      const { data: roleData } = await supabaseAdmin
        .from('user_roles')
        .select('user_id')
        .eq('region_id', regionId)
        .eq('role', 'regionadmin');
      
      // Region ilə əlaqəli digər məlumatları silirik
      const { error: deleteError } = await supabaseAdmin
        .from('regions')
        .delete()
        .eq('id', regionId);
      
      if (deleteError) {
        console.error('Region silmə xətası:', deleteError);
        return new Response(
          JSON.stringify({ error: 'Region silinməsi xətası', details: deleteError }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // Admin hesablarını deaktiv edək (onları silmək əvəzinə)
      if (roleData && roleData.length > 0) {
        for (const role of roleData) {
          try {
            // İstifadəçini deaktiv edirik 
            const { error: profileError } = await supabaseAdmin
              .from('profiles')
              .update({ status: 'inactive' })
              .eq('id', role.user_id);
              
            if (profileError) {
              console.error(`Admin profile deactivation error for ${role.user_id}:`, profileError);
            }
            
            // User role-ları silek
            const { error: roleDeleteError } = await supabaseAdmin
              .from('user_roles')
              .delete()
              .eq('user_id', role.user_id)
              .eq('region_id', regionId);
              
            if (roleDeleteError) {
              console.error(`Admin role deletion error for ${role.user_id}:`, roleDeleteError);
            }
            
            console.log(`Admin with id ${role.user_id} deactivated and roles removed`);
          } catch (err) {
            console.error(`Admin deactivation error for ${role.user_id}:`, err);
          }
        }
      }
      
      return new Response(
        JSON.stringify({ success: true, message: 'Region uğurla silindi' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } 
    else if (action === 'get-admin-email') {
      const { userId } = requestData;
      
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'İstifadəçi ID tələb olunur' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      try {
        // İlk olaraq profiles cədvəlindən yoxlayaq
        const { data: profileData, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('email')
          .eq('id', userId)
          .single();
        
        if (!profileError && profileData && profileData.email) {
          console.log('Profildən email tapıldı:', profileData.email);
          return new Response(
            JSON.stringify({ 
              success: true, 
              email: profileData.email
            }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        
        // İstifadəçinin məlumatlarını əldə edirik
        const { data: userData, error: userError } = await supabaseAdmin
          .auth.admin.getUserById(userId);
        
        if (userError || !userData) {
          console.error('İstifadəçi məlumatları əldə edilərkən xəta:', userError);
          return new Response(
            JSON.stringify({ error: 'İstifadəçi tapılmadı', details: userError }),
            { 
              status: 404, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        
        // Əgər email profiles-də yoxdursa, onu əlavə edək
        if (userData.user.email) {
          const { error: updateProfileError } = await supabaseAdmin
            .from('profiles')
            .update({ email: userData.user.email })
            .eq('id', userId);
          
          if (updateProfileError) {
            console.error('Profil email-i yenilənərkən xəta:', updateProfileError);
          } else {
            console.log('Profil email-i yeniləndi:', userData.user.email);
          }
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            email: userData.user.email,
            user_metadata: userData.user.user_metadata
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      } catch (error) {
        console.error('İstifadəçi email-ni əldə edərkən xəta:', error);
        return new Response(
          JSON.stringify({ error: 'İstifadəçi email-ni əldə etmə xətası', details: error.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }
    
    // Digər sorğu növlərinə cavab
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ error: 'Server xətası', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
