import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  // CORS preflight sorğuları üçün
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    // Supabase client yaradaq
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing');
    }
    const supabase = createClient(supabaseUrl, supabaseKey);
    // Request body-ni alaq
    const { categoryId, schoolId } = await req.json();
    if (!categoryId || !schoolId) {
      return new Response(JSON.stringify({
        error: 'Category ID and School ID are required'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }
    // Bir kateqoriya daxilində bütün məlumatlar üçün status update edək
    const { data, error } = await supabase.from('data_entries').update({
      status: 'pending'
    }).eq('category_id', categoryId).eq('school_id', schoolId).is('approved_at', null).is('rejected_by', null);
    if (error) {
      throw error;
    }
    return new Response(JSON.stringify({
      success: true,
      message: 'Category successfully submitted for approval',
      data
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
