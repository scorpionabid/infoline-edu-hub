
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

// CORS başlıqları
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Ana handler funksiyası
serve(async (req) => {
  // CORS preflight işləmə
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Supabase konfiqurasiyası
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase URL və ya Service Key tapılmadı');
      return new Response(
        JSON.stringify({ error: 'Server konfiqurasyonu səhvdir' }),
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

    // Request body-ni al və aç
    let body;
    try {
      body = await req.json();
      console.log('Request body:', body);
    } catch (parseError) {
      console.error('JSON parse xətası:', parseError);
      return new Response(
        JSON.stringify({ error: 'Request body JSON formatında olmalıdır' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // userId və regionId doğrulamaq
    const { userId, regionId } = body;
    
    if (!userId) {
      console.error('İstifadəçi ID tapılmadı');
      return new Response(
        JSON.stringify({ error: 'İstifadəçi ID tələb olunur' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    if (!regionId) {
      console.error('Region ID tapılmadı');
      return new Response(
        JSON.stringify({ error: 'Region ID tələb olunur' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Region admin təyinatı başladı: User ID: ${userId}, Region ID: ${regionId}`);

    // Əsas işi try-catch bloku içində edək
    try {
      // 1. İstifadəçinin mövcudluğunu yoxlayaq
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);

      if (userError) {
        console.error('İstifadəçi tapılmadı:', userError);
        return new Response(
          JSON.stringify({ error: `İstifadəçi tapılmadı: ${userError.message}` }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      if (!userData || !userData.user) {
        console.error('İstifadəçi tapılmadı (user null)');
        return new Response(
          JSON.stringify({ error: 'İstifadəçi tapılmadı - veri boş' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // 2. Regionun mövcudluğunu yoxlayaq
      const { data: regionData, error: regionError } = await supabaseAdmin
        .from('regions')
        .select('id, name')
        .eq('id', regionId)
        .maybeSingle();
        
      if (regionError) {
        console.error('Region tapılmadı (xəta):', regionError);
        return new Response(
          JSON.stringify({ error: `Region tapılmadı: ${regionError.message}` }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      if (!regionData) {
        console.error('Region tapılmadı (data boş)');
        return new Response(
          JSON.stringify({ error: 'Region tapılmadı - veri boş' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      console.log('Region tapıldı:', regionData);

      // 3. İstifadəçinin cari user_roles məlumatlarını yoxlayaq
      const { data: existingRoles, error: rolesError } = await supabaseAdmin
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);
        
      if (rolesError) {
        console.error('İstifadəçi rolları yoxlanarkən xəta:', rolesError);
        return new Response(
          JSON.stringify({ error: `İstifadəçi rolları yoxlanarkən xəta: ${rolesError.message}` }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      let roleResult;
      
      // 4. Əgər istifadəçi artıq regionadmin roluna malikdirsə, rolu yeniləyək
      const hasRegionAdminRole = existingRoles && existingRoles.some(role => role.role === 'regionadmin');
      
      if (hasRegionAdminRole) {
        console.log('İstifadəçi artıq regionadmin roluna malikdir, rolu yeniləyirəm');
        
        // Mövcud regionadmin rolunu yeniləyək
        const { data: updatedRole, error: updateError } = await supabaseAdmin
          .from('user_roles')
          .update({
            region_id: regionId,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('role', 'regionadmin')
          .select();
          
        if (updateError) {
          console.error('Rol yeniləmə xətası:', updateError);
          return new Response(
            JSON.stringify({ error: `Rol yeniləmə xətası: ${updateError.message}` }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        
        roleResult = updatedRole;
        console.log('İstifadəçi rolu yeniləndi:', updatedRole);
      } else {
        console.log('İstifadəçidə regionadmin rolu yoxdur, yeni rol əlavə edilir');
        
        // 5. Əvvəlcə user_roles cədvəlində mövcud admin rollarını tapaq və siləkk
        if (existingRoles && existingRoles.length > 0) {
          const adminRoles = existingRoles.filter(role => 
            ['regionadmin', 'sectoradmin', 'schooladmin'].includes(String(role.role))
          );
          
          if (adminRoles.length > 0) {
            console.log('Mövcud admin rolları:', adminRoles);
            
            // Bütün köhnə admin rollarını siləcəyik
            for (const role of adminRoles) {
              const { error: deleteError } = await supabaseAdmin
                .from('user_roles')
                .delete()
                .eq('id', role.id);
                
              if (deleteError) {
                console.error(`Köhnə ${role.role} rolu silinərkən xəta:`, deleteError);
              } else {
                console.log(`Köhnə ${role.role} rolu silindi`);
              }
            }
          }
        }
        
        // 6. Yeni regionadmin rolu əlavə edək
        const { data: newRole, error: insertError } = await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: userId,
            role: 'regionadmin',
            region_id: regionId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select();
          
        if (insertError) {
          console.error('Rol əlavə etmə xətası:', insertError);
          return new Response(
            JSON.stringify({ error: `Rol əlavə etmə xətası: ${insertError.message}` }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        
        roleResult = newRole;
        console.log('Yeni rol yaradıldı:', newRole);
      }
      
      // 7. Region-də admin məlumatlarını yeniləyək
      const { data: updatedRegion, error: updateRegionError } = await supabaseAdmin
        .from('regions')
        .update({
          admin_id: userId,
          admin_email: userData.user.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', regionId)
        .select();
        
      if (updateRegionError) {
        console.error('Region yeniləmə xətası:', updateRegionError);
        return new Response(
          JSON.stringify({ error: `Region yeniləmə xətası: ${updateRegionError.message}` }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      console.log('Region məlumatları yeniləndi:', updatedRegion);
      
      // 8. Audit log əlavə edək
      try {
        await supabaseAdmin
          .from('audit_logs')
          .insert({
            user_id: userId,
            action: 'assign_admin',
            entity_type: 'region',
            entity_id: regionId,
            new_value: JSON.stringify({
              region_id: regionId,
              region_name: regionData.name,
              admin_id: userId,
              admin_name: userData.user.user_metadata?.full_name || userData.user.email,
              admin_email: userData.user.email
            })
          });
          
        console.log('Audit log yaradıldı');
      } catch (auditError) {
        console.error('Audit log yaradılarkən xəta:', auditError);
        // Audit log xətası əsas əməliyyatı dayandırmamalıdır
      }
      
      // Uğurlu cavab
      return new Response(
        JSON.stringify({
          success: true,
          admin: {
            id: userId,
            name: userData.user.user_metadata?.full_name || userData.user.email,
            email: userData.user.email
          },
          region: {
            id: regionId,
            name: regionData.name
          },
          role: roleResult?.[0] || null
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } catch (error: any) {
      console.error('Admin təyin etmə xətası:', error);
      return new Response(
        JSON.stringify({ error: error.message || 'Admin təyin edilərkən xəta baş verdi' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error: any) {
    console.error('Gözlənilməz xəta:', error);
    return new Response(
      JSON.stringify({ error: 'Gözlənilməz xəta baş verdi: ' + (error.message || 'Naməlum xəta') }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
