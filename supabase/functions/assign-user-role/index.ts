
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS başlıqları 
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS preflight sorğularına cavab ver
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Supabase client yaratma
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase konfiqurasiyası: URL və ya key tapılmadı');
      return new Response(
        JSON.stringify({ error: 'Server konfiqurasiyası səhvdir' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Request body-ni alaq
    let body;
    try {
      body = await req.json();
      console.log('Request məlumatları:', body);
    } catch (error) {
      console.error('Request body parse xətası:', error);
      return new Response(
        JSON.stringify({ error: 'Düzgün JSON formatında body tələb olunur' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Yoxlama: userId və rol parametrləri
    const { userId, role, entityId } = body;
    
    if (!userId || !role) {
      console.error('İstifadəçi ID və ya rol göndərilməyib');
      return new Response(
        JSON.stringify({ error: 'İstifadəçi ID və rol tələb olunur' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Rolun qəbul edilən dəyərlərdən biri olduğunu yoxlayırıq
    const validRoles = ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin', 'user'];
    if (!validRoles.includes(role)) {
      return new Response(
        JSON.stringify({ error: 'Düzgün olmayan rol. Qəbul edilən rollar: ' + validRoles.join(', ') }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`${role} rolunun təyinatı başlayır: User ID: ${userId}, Entity ID: ${entityId || 'təyin edilməyib'}`);

    let result;
    
    // Role uyğun entity ID yoxlaması və təyinat
    switch (role) {
      case 'regionadmin':
        if (!entityId) {
          return new Response(
            JSON.stringify({ error: 'Region admin təyin etmək üçün region ID tələb olunur' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        
        // Region admin təyinatı üçün RPC çağırırıq
        const { data: regionResult, error: regionError } = await supabase.rpc('assign_region_admin', {
          user_id_param: userId,
          region_id_param: entityId
        });
        
        if (regionError) {
          console.error('Region admin təyin etmə xətası:', regionError);
          return new Response(
            JSON.stringify({ error: `Region admin təyin etmə xətası: ${regionError.message}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        
        result = regionResult;
        break;
        
      case 'sectoradmin':
        if (!entityId) {
          return new Response(
            JSON.stringify({ error: 'Sektor admin təyin etmək üçün sektor ID tələb olunur' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        
        // Sektor admin təyinatı üçün RPC çağırırıq
        const { data: sectorResult, error: sectorError } = await supabase.rpc('assign_sector_admin', {
          user_id_param: userId,
          sector_id_param: entityId
        });
        
        if (sectorError) {
          console.error('Sektor admin təyin etmə xətası:', sectorError);
          return new Response(
            JSON.stringify({ error: `Sektor admin təyin etmə xətası: ${sectorError.message}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        
        result = sectorResult;
        break;
        
      case 'schooladmin':
        if (!entityId) {
          return new Response(
            JSON.stringify({ error: 'Məktəb admin təyin etmək üçün məktəb ID tələb olunur' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        
        // Məktəb admin təyinatı üçün RPC çağırırıq
        const { data: schoolResult, error: schoolError } = await supabase.rpc('assign_school_admin', {
          user_id: userId,
          school_id: entityId
        });
        
        if (schoolError) {
          console.error('Məktəb admin təyin etmə xətası:', schoolError);
          return new Response(
            JSON.stringify({ error: `Məktəb admin təyin etmə xətası: ${schoolError.message}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        
        result = schoolResult;
        break;
        
      case 'superadmin':
      case 'user':
        // Superadmin və ya normal istifadəçi təyinatı
        const { data: roleUpdateData, error: roleUpdateError } = await supabase
          .from('user_roles')
          .upsert({
            user_id: userId,
            role: role,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
        
        if (roleUpdateError) {
          console.error('Rol təyin etmə xətası:', roleUpdateError);
          return new Response(
            JSON.stringify({ error: `Rol təyin etmə xətası: ${roleUpdateError.message}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        
        result = { success: true, message: `İstifadəçi ${role} kimi uğurla təyin edildi` };
        break;
    }
    
    if (result && result.success === false) {
      console.error('Admin təyin etmə xətası:', result.error);
      return new Response(
        JSON.stringify({ error: result.error || 'Bilinməyən xəta' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log(`${role} uğurla təyin edildi:`, result);
    
    // Uğurlu cavab
    return new Response(
      JSON.stringify({
        success: true,
        message: `İstifadəçi ${role} kimi uğurla təyin edildi`,
        data: result
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Gözlənilməz xəta:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: `Gözlənilməz xəta: ${error instanceof Error ? error.message : String(error)}` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
