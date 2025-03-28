
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
}

interface DeleteRegionRequest {
  regionId: string;
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

    const { path, method } = req;
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    console.log(`Region operations function called with action: ${action}, method: ${method}`);

    if (method === 'POST') {
      const requestData = await req.json();
      console.log('Request data:', requestData);

      // Regionun yaradılması
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
        
        // Əgər admin məlumatları verilibsə, admin hesabı yaradaq
        if (adminEmail && adminName) {
          // İstifadəçinin təqdim etdiyi parol və ya default parol
          const password = adminPassword || 'Password123';
          
          console.log(`Creating admin with email: ${adminEmail}, password: ${password.substring(0, 3)}*****`);
          
          // Supabase ilə yeni istifadəçi yaradırıq
          const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
            email: adminEmail,
            password: password,
            email_confirm: true, // Emailin təsdiqlənməsinə ehtiyac yoxdur
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
                data: regionData, 
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
          
          // İstifadəçi rolunu əlavə edirik
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
          
          console.log(`Region admin ${adminEmail} created for region ${name} with id ${regionId}`);
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: { 
              region: regionData, 
              admin: adminId ? { id: adminId, email: adminEmail } : null
            } 
          }),
          { 
            status: 201, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      } 
      // Regionun silinməsi
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
        // Avtomatik cascade delete işləyəcək, əgər foreign key məhdudiyyətləri varsa
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
              // İstifadəçini deaktiv edirik, amma silmirik
              await supabaseAdmin
                .from('profiles')
                .update({ status: 'inactive' })
                .eq('id', role.user_id);
              
              console.log(`Admin with id ${role.user_id} deactivated`);
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
