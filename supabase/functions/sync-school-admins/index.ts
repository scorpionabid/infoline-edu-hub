
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.9.1";

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
    // Supabase müştəri yaradırıq
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Məktəb adminlərini sinxronlaşdırma başladı...");

    // Admin e-poçtları olub admin ID-ləri olmayan məktəbləri tapaq
    const { data: schoolsWithEmailButNoId, error: schoolsError } = await supabase
      .from('schools')
      .select('id, name, admin_email, region_id, sector_id')
      .is('admin_id', null)
      .not('admin_email', 'is', null);

    if (schoolsError) {
      throw new Error(`Məktəb məlumatları alınarkən xəta: ${schoolsError.message}`);
    }

    console.log(`${schoolsWithEmailButNoId?.length || 0} məktəbdə admin_email var, lakin admin_id yoxdur`);

    // Düzəldilmiş məktəbləri izləmək üçün sayğac
    let fixedCount = 0;

    // Hər bir məktəb üçün admin ID-ni tapıb yeniləyək
    for (const school of (schoolsWithEmailButNoId || [])) {
      try {
        console.log(`Məktəb işlənir: ${school.name} (${school.id}), Admin email: ${school.admin_email}`);
        
        // Admin email-inə uyğun istifadəçi ID-si tapaq
        const { data: userData, error: userError } = await supabase
          .from('auth.users')
          .select('id')
          .eq('email', school.admin_email)
          .maybeSingle();
          
        if (userError) {
          console.warn(`${school.name} - İstifadəçi axtarışı zamanı xəta: ${userError.message}`);
          continue;
        }
        
        if (!userData || !userData.id) {
          console.warn(`${school.name} - "${school.admin_email}" e-poçtuna sahib istifadəçi tapılmadı`);
          continue;
        }
        
        console.log(`${school.name} - İstifadəçi tapıldı: ${userData.id}`);
        
        // Məktəb admin_id sahəsini yeniləyək
        const { error: updateError } = await supabase
          .from('schools')
          .update({ admin_id: userData.id })
          .eq('id', school.id);
          
        if (updateError) {
          console.error(`${school.name} - Məktəb yeniləmə xətası: ${updateError.message}`);
          continue;
        }
        
        // user_roles cədvəlində schooladmin rolunu əlavə edək/yeniləyək
        const { error: roleError } = await supabase.rpc('assign_school_admin', {
          user_id: userData.id,
          school_id: school.id,
          region_id: school.region_id, 
          sector_id: school.sector_id
        });
        
        if (roleError) {
          console.error(`${school.name} - Admin rol təyinatı xətası: ${roleError.message}`);
          continue;
        }
        
        console.log(`${school.name} - Admin ID və rol uğurla yeniləndi`);
        fixedCount++;
        
      } catch (error) {
        console.error(`${school.name || school.id} məktəbi işlənərkən xəta: ${error.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        fixed: fixedCount,
        total: schoolsWithEmailButNoId?.length || 0,
        message: `${fixedCount} məktəbdə admin məlumatları düzəldildi`
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
    console.error("Sinxronizasiya istisna:", error.message);
    
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
