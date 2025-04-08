
// Supabase Edge Function: assign-existing-user-as-school-admin
// Bu funksiya mövcud istifadəçini məktəb adminı kimi təyin edir
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { corsHeaders } from './cors.ts';

console.log("Seçilmiş istifadəçini məktəb admini təyin etmə funksiyası başladıldı!");

serve(async (req) => {
  // CORS sorğularını idarə et
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Request body-ni JSON olaraq parse et
    const requestData = await req.json();
    console.log("Alınan sorğu məlumatları:", JSON.stringify(requestData));

    // userId və schoolId məlumatlarını əldə et
    const { userId, schoolId } = requestData;
    
    // Məlumatların mövcudluğunu yoxla
    if (!userId || !schoolId) {
      const missingParam = !userId ? 'userId' : 'schoolId';
      console.error(`Zəruri parametr çatışmır: ${missingParam}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Zəruri parametr çatışmır: ${missingParam}`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Supabase müştərisini yaradaq
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // İstifadəçi məlumatlarını yoxla
    const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (userError || !user) {
      console.error('İstifadəçi məlumatları xətası:', userError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `İstifadəçi tapılmadı: ${userError?.message || 'Bilinməyən xəta'}`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }
    
    // Məktəbin mövcud olduğunu yoxlayaq
    const { data: school, error: schoolError } = await supabaseAdmin
      .from('schools')
      .select('id, name, region_id, sector_id')
      .eq('id', schoolId)
      .single();
    
    if (schoolError) {
      console.error('Məktəb yoxlama xətası:', schoolError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Məktəb tapılmadı: ${schoolError.message}`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }
    
    if (!school) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Məktəb tapılmadı'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }
    
    console.log('Məktəb tapıldı:', JSON.stringify(school));
    
    // İstifadəçinin mövcud rollarını silək (user_roles cədvəlində)
    try {
      const { error: deleteRolesError } = await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
      
      if (deleteRolesError) {
        console.error('Rol silmə xətası:', deleteRolesError);
        return new Response(
          JSON.stringify({
            success: false,
            error: `Köhnə rolları silmək mümkün olmadı: ${deleteRolesError.message}`
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        );
      }
      
      console.log('Köhnə roller silindi');
    } catch (error) {
      console.error('Rol silmə istisna:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Köhnə rolları silmək mümkün olmadı: ${error.message}`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }
    
    // Yeni rol təyin edək
    try {
      const { data: newRole, error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'schooladmin',
          school_id: schoolId,
          region_id: school.region_id,
          sector_id: school.sector_id
        })
        .select()
        .single();
      
      if (roleError) {
        console.error('Rol təyin etmə xətası:', roleError);
        return new Response(
          JSON.stringify({
            success: false,
            error: `Rol təyin edilərkən xəta: ${roleError.message}`
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        );
      }
      
      console.log('Yeni rol təyin edildi:', JSON.stringify(newRole));
    } catch (error) {
      console.error('Rol təyin etmə istisna:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Rol təyin edilərkən xəta: ${error.message}`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }
    
    // Məktəbin admin məlumatlarını yeniləyək
    try {
      const { data: updatedSchool, error: updateError } = await supabaseAdmin
        .from('schools')
        .update({
          admin_id: userId,
          admin_email: user.user.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', schoolId)
        .select()
        .single();
      
      if (updateError) {
        console.error('Məktəb yeniləmə xətası:', updateError);
        return new Response(
          JSON.stringify({
            success: false,
            error: `Məktəb yenilərkən xəta: ${updateError.message}`
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        );
      }
      
      console.log('Məktəb yeniləndi:', JSON.stringify(updatedSchool));
    } catch (error) {
      console.error('Məktəb yeniləmə istisna:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Məktəb yenilərkən xəta: ${error.message}`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }
    
    // Audit log əlavə edək
    try {
      await supabaseAdmin.from('audit_logs').insert({
        user_id: userId,
        action: 'assign_school_admin',
        entity_type: 'school',
        entity_id: schoolId,
        new_value: {
          school_id: schoolId,
          school_name: school.name,
          admin_id: userId,
          admin_email: user.user.email
        }
      });
      console.log('Audit log əlavə edildi');
    } catch (auditError) {
      // Audit log xətasının əsas əməliyyata təsir etməsinə imkan verməyin
      console.error('Audit log xətası (kritik deyil):', auditError);
    }
    
    // Uğurlu nəticə qaytaraq
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          school: {
            id: schoolId,
            name: school.name
          },
          admin: {
            id: userId,
            email: user.user.email
          }
        },
        message: 'İstifadəçi məktəb admini kimi uğurla təyin edildi'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
    
  } catch (error) {
    // Xətaları idarə et
    console.error("Admin təyin etmə xətası:", error.message);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Daxili server xətası'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
