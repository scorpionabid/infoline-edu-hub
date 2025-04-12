
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS üçün OPTIONS sorğusunu emal edirik
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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
    
    // Sorğu body-sini alırıq
    const { entryIds, schoolId, categoryId } = await req.json();
    
    if (!entryIds || !Array.isArray(entryIds) || !schoolId || !categoryId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Zəruri parametrlər çatışmır: entryIds, schoolId və ya categoryId'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }
    
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
    
    // İstifadəçinin rolunu yoxlayırıq
    const { data: userRole, error: roleError } = await supabaseClient.rpc('get_user_role_safe');
    
    if (roleError) {
      return new Response(
        JSON.stringify({ success: false, error: 'İstifadəçi rolu alınamadı' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    // Təsdiq səlahiyyətini yoxlayırıq
    if (!['superadmin', 'regionadmin', 'sectoradmin'].includes(userRole)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Məlumatları təsdiqləmək üçün icazəniz yoxdur' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403 
        }
      );
    }
    
    // Məlumatların toplu təsdiqlənməsi
    const { data, error } = await supabaseClient.rpc('bulk_approve_data_entries', {
      p_entry_ids: entryIds,
      p_school_id: schoolId,
      p_category_id: categoryId,
      p_approved_by: user.id
    });
    
    if (error) {
      console.error("Məlumatlar təsdiqlənərkən xəta:", error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    // Bildiriş yaradırıq
    const { error: notificationError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: data.school_admin_id, // Məktəb admininə bildiriş
        type: 'data_approved',
        title: 'Məlumatlar təsdiqləndi',
        message: `${categoryId} kateqoriyasına aid ${entryIds.length} məlumat təsdiqləndi`,
        related_entity_type: 'category',
        related_entity_id: categoryId,
        priority: 'normal'
      });
    
    if (notificationError) {
      console.error("Bildiriş yaradılarkən xəta:", notificationError);
      // Bildiriş yaratma xətası əsas əməliyyatı dayandırmamalıdır
    }
    
    return new Response(
      JSON.stringify({ success: true, data }),
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
