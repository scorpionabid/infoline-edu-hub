
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  userId: string;
  schoolId: string;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Request body-dən məlumatları əldə et
    const requestData: RequestBody = await req.json();
    const { userId, schoolId } = requestData;
    
    console.log('Edge funksiyası çağırıldı:', { userId, schoolId });
    
    if (!userId || !schoolId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'userId və schoolId olmalıdır'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    // Supabase kliyentini yaradaq
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
      { auth: { persistSession: false } }
    );
    
    // Məktəb və region/sektor ID-lərini əldə edək
    const { data: schoolData, error: schoolError } = await supabaseAdmin
      .from('schools')
      .select('id, region_id, sector_id')
      .eq('id', schoolId)
      .single();
    
    if (schoolError || !schoolData) {
      return new Response(JSON.stringify({
        success: false,
        error: schoolError?.message || 'Məktəb tapılmadı'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      });
    }
    
    // İstifadəçini yoxlayaq
    const { data: userData, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', userId)
      .single();
    
    if (userError || !userData) {
      return new Response(JSON.stringify({
        success: false,
        error: userError?.message || 'İstifadəçi tapılmadı'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      });
    }
    
    // Əvvəlcə data_entries cədvəlindəki məlumatları təmizləyək (əgər varsa)
    const { error: entriesError } = await supabaseAdmin
      .from('data_entries')
      .delete()
      .eq('school_id', schoolId);
      
    if (entriesError) {
      console.warn('Data entries silinərkən xəbərdarlıq:', entriesError.message);
    }
    
    // Köhnə user_roles qeydlərini silək
    const { error: deleteRoleError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', userId);
      
    if (deleteRoleError) {
      console.warn('Köhnə istifadəçi rolları silinərkən xəbərdarlıq:', deleteRoleError.message);
    }
    
    // İstifadəçiyə schooladmin rolunu təyin edək
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'schooladmin',
        school_id: schoolId,
        region_id: schoolData.region_id,
        sector_id: schoolData.sector_id
      })
      .select()
      .single();
    
    if (roleError) {
      return new Response(JSON.stringify({
        success: false,
        error: roleError.message
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }
    
    // Məktəbin admin məlumatlarını yeniləyək
    const { error: updateSchoolError } = await supabaseAdmin
      .from('schools')
      .update({
        admin_id: userId,
        admin_email: userData.email,
        updated_at: new Date().toISOString()
      })
      .eq('id', schoolId);
    
    if (updateSchoolError) {
      return new Response(JSON.stringify({
        success: false,
        error: updateSchoolError.message
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }
    
    // Audit log əlavə edək
    const { error: auditError } = await supabaseAdmin
      .from('audit_logs')
      .insert({
        user_id: userId,
        action: 'assign_school_admin',
        entity_type: 'school',
        entity_id: schoolId,
        new_value: {
          school_id: schoolId,
          admin_id: userId,
          admin_name: userData.full_name,
          admin_email: userData.email
        }
      });
    
    if (auditError) {
      console.warn('Audit log əlavə edilərkən xəbərdarlıq:', auditError.message);
    }
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        userId,
        schoolId,
        role: roleData,
        message: 'Məktəb admini uğurla təyin edildi'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
    
  } catch (error) {
    console.error('Edge funksiya xətası:', error.message);
    
    return new Response(JSON.stringify({
      success: false,
      error: `Server xətası: ${error.message}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
