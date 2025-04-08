
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
    let requestData;
    try {
      requestData = await req.json();
      console.log("Alınan sorğu məlumatları:", JSON.stringify(requestData));
    } catch (parseError) {
      console.error("JSON parse xətası:", parseError.message);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Sorğu məlumatları düzgün format deyil: ${parseError.message}`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Parametrləri əldə et və yoxla
    const { userId, schoolId } = requestData;
    
    if (!userId) {
      console.error("Zəruri parametr çatışmır: userId");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Zəruri parametr çatışmır: userId"
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }
    
    if (!schoolId) {
      console.error("Zəruri parametr çatışmır: schoolId");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Zəruri parametr çatışmır: schoolId"
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Supabase müştərisini yaradaq
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase konfiqurasiya xətası: URL veya Service Role Key mövcud deyil");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Server konfiqurasiysı xətası"
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // İstifadəçi məlumatlarını yoxla
    console.log(`İstifadəçi məlumatlarını əldə etmək: ${userId}`);
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (userError) {
      console.error('İstifadəçi məlumatları xətası:', userError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `İstifadəçi tapılmadı: ${userError.message}`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }
    
    if (!userData || !userData.user) {
      console.error('İstifadəçi tapılmadı');
      return new Response(
        JSON.stringify({
          success: false,
          error: "İstifadəçi tapılmadı"
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }
    
    const user = userData.user;
    console.log('İstifadəçi tapıldı:', user.email);
    
    // Məktəbin mövcud olduğunu yoxlayaq
    console.log(`Məktəb məlumatlarını əldə etmək: ${schoolId}`);
    const { data: school, error: schoolError } = await supabaseAdmin
      .from('schools')
      .select('id, name, region_id, sector_id')
      .eq('id', schoolId)
      .maybeSingle();
    
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
      console.error('Məktəb tapılmadı:', schoolId);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Məktəb tapılmadı"
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }
    
    console.log('Məktəb tapıldı:', JSON.stringify(school));
    
    try {
      // İstifadəçinin mövcud rollarını silək (user_roles cədvəlində)
      console.log(`Köhnə rol məlumatlarını silmək: ${userId}`);
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
      console.error('Rol silmə istisna:', error.message);
      // Xəta baş versə də, davam edək
    }
    
    // Yeni rol təyin edək
    try {
      console.log(`Yeni rol təyin etmək: ${userId}, məktəb: ${schoolId}`);
      const { data: newRole, error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'schooladmin',
          school_id: schoolId,
          region_id: school.region_id,
          sector_id: school.sector_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .maybeSingle();
      
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
      
      console.log('Yeni rol təyin edildi:', newRole ? JSON.stringify(newRole) : 'No data returned');
    } catch (error) {
      console.error('Rol təyin etmə istisna:', error.message);
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
      console.log(`Məktəb admin məlumatlarını yeniləmək: ${schoolId}, admin: ${userId}`);
      const { data: updatedSchool, error: updateError } = await supabaseAdmin
        .from('schools')
        .update({
          admin_id: userId,
          admin_email: user.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', schoolId)
        .select()
        .maybeSingle();
      
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
      
      console.log('Məktəb yeniləndi:', updatedSchool ? JSON.stringify(updatedSchool) : 'No data returned');
    } catch (error) {
      console.error('Məktəb yeniləmə istisna:', error.message);
      // Xəta baş versə də, davam edək
    }
    
    // Audit log əlavə edək
    try {
      console.log(`Audit log əlavə edilir: ${userId}, ${schoolId}`);
      const { error: auditError } = await supabaseAdmin
        .from('audit_logs')
        .insert({
          user_id: userId,
          action: 'assign_school_admin',
          entity_type: 'school',
          entity_id: schoolId,
          new_value: {
            school_id: schoolId,
            school_name: school.name,
            admin_id: userId,
            admin_email: user.email
          }
        });
        
      if (auditError) {
        console.warn('Audit log xətası (kritik deyil):', auditError);
      } else {
        console.log('Audit log əlavə edildi');
      }
    } catch (auditError) {
      // Audit log xətasının əsas əməliyyata təsir etməsinə imkan verməyin
      console.warn('Audit log istisna (kritik deyil):', auditError.message);
    }
    
    // Uğurlu nəticə qaytaraq
    console.log(`Əməliyyat uğurla başa çatdı: ${userId} istifadəçisi ${schoolId} məktəbinə admin təyin edildi`);
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
            email: user.email
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
    console.error("Admin təyin etmə xətası:", error.message || error);
    
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
