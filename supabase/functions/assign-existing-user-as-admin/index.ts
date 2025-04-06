
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
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

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

    try {
      // 1. İstifadəçinin profiles cədvəlindən məlumatlarını alaq
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Profil məlumatları alınarkən xəta:', profileError);
        return new Response(
          JSON.stringify({ error: `Profil məlumatları tapılmadı: ${profileError.message}` }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      if (!profileData) {
        console.error('Profil məlumatları tapılmadı');
        return new Response(
          JSON.stringify({ error: 'İstifadəçi profili tapılmadı' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // 2. İstifadəçi email məlumatını əldə edək
      const { data: emailData, error: emailError } = await supabaseAdmin.rpc(
        'get_user_emails_by_ids',
        { user_ids: [userId] }
      );

      let userEmail = profileData.email; // Əvvəlcə profile-dakı email-i götürürük
      
      // Əgər RPC funksiyası uğurlu olsa və məlumat qaytarsa
      if (!emailError && emailData && emailData.length > 0) {
        userEmail = emailData[0].email; // RPC-dən gələn emaili üstünlük veririk
      } else if (emailError) {
        console.warn('Email RPC xətası:', emailError);
      }

      // 3. Regionun mövcudluğunu yoxlayaq
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

      // 4. İstifadəçinin cari user_roles məlumatlarını yoxlayaq
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

      // 5. Bütün mövcud admin rollarını siləcəyik
      if (existingRoles && existingRoles.length > 0) {
        const adminRoles = existingRoles.filter(role => 
          ['regionadmin', 'sectoradmin', 'schooladmin'].includes(String(role.role))
        );
        
        if (adminRoles.length > 0) {
          console.log('Köhnə admin rolları silinəcək:', adminRoles);
          
          // Köhnə admin rollarını bir-bir silmək əvəzinə, hamsını birdən siləcəyik
          const { error: deleteError } = await supabaseAdmin
            .from('user_roles')
            .delete()
            .in('id', adminRoles.map(r => r.id));
            
          if (deleteError) {
            console.error('Köhnə admin rolları silinərkən xəta:', deleteError);
            return new Response(
              JSON.stringify({ error: `Köhnə rollary silərkən xəta: ${deleteError.message}` }),
              { 
                status: 500, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            );
          }
          
          console.log('Köhnə admin rolları silindi');
        }
      }

      // 6. Yeni regionadmin rolu əlavə edək
      const now = new Date().toISOString();
      const { data: newRole, error: insertError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'regionadmin',
          region_id: regionId,
          created_at: now,
          updated_at: now
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
      
      if (!newRole || newRole.length === 0) {
        console.error('Rol əlavə edilsə də, məlumat qaytarılmadı');
        return new Response(
          JSON.stringify({ error: 'Rol əlavə etmə xətası: Məlumat qaytarılmadı' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      console.log('Yeni rol yaradıldı:', newRole);
      
      // 7. Region-də admin məlumatlarını yeniləyək
      const { data: updatedRegion, error: updateRegionError } = await supabaseAdmin
        .from('regions')
        .update({
          admin_id: userId,
          admin_email: userEmail,
          updated_at: now
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
              admin_name: profileData.full_name,
              admin_email: userEmail
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
            name: profileData.full_name,
            email: userEmail
          },
          region: {
            id: regionId,
            name: regionData.name
          },
          role: newRole[0]
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
