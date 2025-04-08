
// Supabase Edge Function: assign-existing-user-as-school-admin
// Bu funksiya mövcud istifadəçini məktəb adminı kimi təyin edir
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { corsHeaders } from './cors.ts';
import { assignUserAsSchoolAdmin } from './service.ts';

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

    // Xidmət funksiyasını çağıraraq məktəb adminini təyin et
    const result = await assignUserAsSchoolAdmin(supabaseAdmin, userId, schoolId);
    
    // Nəticəni log et və qaytaraq
    console.log("Təyin etmə nəticəsi:", JSON.stringify(result));
    
    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: result.success ? 200 : 400,
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
