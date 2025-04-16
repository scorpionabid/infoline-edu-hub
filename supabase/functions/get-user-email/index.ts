
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": 
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // JSON məlumatlarını alaq
    const { userId } = await req.json();
    
    if (!userId) {
      throw new Error('userId təqdim edilməyib');
    }
    
    // Supabase müştəri yaradırıq
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // auth.users cədvəlindən email məlumatını əldə edirik
    const { data, error } = await supabase
      .from('auth.users')
      .select('email')
      .eq('id', userId)
      .single();
      
    if (error) {
      throw new Error(`İstifadəçi məlumatları alınarkən xəta: ${error.message}`);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        email: data?.email || null
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error("get-user-email istisna:", error.message);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 500,
      }
    );
  }
});
