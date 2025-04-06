
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

// CORS başlıqları
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS preflight sorğularına cavab
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Supabase client yaratma
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase konfiqurasyası: URL və ya key tapılmadı');
      return new Response(
        JSON.stringify({ error: 'Server konfiqurasiyası səhvdir' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Request body-ni al
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
    
    // userId və regionId parametrlərini doğrula
    const { userId, regionId } = body;
    
    if (!userId) {
      console.error('İstifadəçi ID göndərilməyib');
      return new Response(
        JSON.stringify({ error: 'İstifadəçi ID tələb olunur' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    if (!regionId) {
      console.error('Region ID göndərilməyib');
      return new Response(
        JSON.stringify({ error: 'Region ID tələb olunur' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Region admin təyinatı başlayır: User ID: ${userId}, Region ID: ${regionId}`);

    // Yaratdığımız SQL funksiyasını çağırırıq
    const { data, error } = await supabase.rpc('assign_region_admin', {
      user_id_param: userId,
      region_id_param: regionId
    });
    
    if (error) {
      console.error('Region admin təyin etmə xətası:', error);
      return new Response(
        JSON.stringify({ 
          error: `Region admin təyin etmə xətası: ${error.message}` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    if (data && !data.success) {
      console.error('Region admin təyin etmə xətası:', data.error);
      return new Response(
        JSON.stringify({ 
          error: data.error || 'Bilinməyən xəta' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log('Region admin uğurla təyin edildi:', data);
    
    // Uğurlu cavab
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Gözlənilməz xəta:', error);
    return new Response(
      JSON.stringify({ 
        error: `Gözlənilməz xəta: ${error instanceof Error ? error.message : String(error)}` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
