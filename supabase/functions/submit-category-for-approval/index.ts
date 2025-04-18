import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

serve(async (req) => {
  // CORS üçün OPTIONS sorğusunu emal edirik
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  
  try {
    // Supabase klienti yaradırıq
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );
    
    // İstifadəçi məlumatlarını alırıq
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'İstifadəçi təsdiqlənmədi' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }
    
    // Sorğu parametrlərini alırıq
    const { schoolId, categoryId, userId } = await req.json();
    
    if (!schoolId || !categoryId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Məktəb ID və ya Kateqoriya ID təqdim edilməyib' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }
    
    // İstifadəçinin məktəb admini olub-olmadığını yoxlayırıq
    const { data: userRole, error: roleError } = await supabaseClient.rpc('get_user_role_safe');
    
    if (roleError) {
      return new Response(
        JSON.stringify({ success: false, error: 'İstifadəçi rolu alınarkən xəta: ' + roleError.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    // Məktəb və kateqoriya məlumatlarını alırıq
    const { data: school, error: schoolError } = await supabaseClient
      .from('schools')
      .select('id, name, sector_id, region_id')
      .eq('id', schoolId)
      .single();
      
    if (schoolError) {
      return new Response(
        JSON.stringify({ success: false, error: 'Məktəb məlumatları alınarkən xəta: ' + schoolError.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    const { data: category, error: categoryError } = await supabaseClient
      .from('categories')
      .select('id, name')
      .eq('id', categoryId)
      .single();
      
    if (categoryError) {
      return new Response(
        JSON.stringify({ success: false, error: 'Kateqoriya məlumatları alınarkən xəta: ' + categoryError.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    // Məlumatların statusunu 'pending' olaraq yeniləyirik
    const { error: updateError } = await supabaseClient
      .from('data_entries')
      .update({
        status: 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('school_id', schoolId)
      .eq('category_id', categoryId);
      
    if (updateError) {
      return new Response(
        JSON.stringify({ success: false, error: 'Məlumatların statusu yenilənərkən xəta: ' + updateError.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    // Sektor adminini tapırıq
    const { data: sectorAdmins, error: sectorAdminError } = await supabaseClient
      .from('user_roles')
      .select('user_id')
      .eq('sector_id', school.sector_id)
      .eq('role', 'sectoradmin');
      
    if (sectorAdminError) {
      return new Response(
        JSON.stringify({ success: false, error: 'Sektor admini tapılarkən xəta: ' + sectorAdminError.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    // Sektor admininə bildiriş göndəririk
    if (sectorAdmins && sectorAdmins.length > 0) {
      const notificationPromises = sectorAdmins.map(admin => {
        return supabaseClient
          .from('notifications')
          .insert({
            user_id: admin.user_id,
            type: 'info',
            title: 'Yeni məlumatlar təsdiq gözləyir',
            message: `${school.name} məktəbi "${category.name}" kateqoriyası üçün məlumatları təsdiq üçün göndərdi.`,
            related_entity_id: categoryId,
            related_entity_type: 'category',
            is_read: false,
            priority: 'high',
            created_at: new Date().toISOString()
          });
      });
      
      await Promise.all(notificationPromises);
    }
    
    // Audit log yaradırıq
    await supabaseClient
      .from('audit_logs')
      .insert({
        user_id: userId || user.id,
        action: 'submit_for_approval',
        entity_type: 'category',
        entity_id: categoryId,
        old_value: null,
        new_value: JSON.stringify({
          school_id: schoolId,
          category_id: categoryId,
          status: 'pending'
        }),
        created_at: new Date().toISOString()
      });
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Məlumatlar uğurla təsdiq üçün göndərildi' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
    
  } catch (error) {
    console.error("Serverdə xəta:", error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
