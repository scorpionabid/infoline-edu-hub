
import { handleCors } from '../_shared/middleware.ts'
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

Deno.serve((req) => handleCors(req, async (req) => {
  try {
    // Supabase klienti yaradırıq
    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );
    
    // Sorğu body-sini alırıq
    const { entries, schoolId, categoryId } = await req.json();
    
    if (!entries || !Array.isArray(entries) || !schoolId || !categoryId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Zəruri parametrlər çatışmır: entries, schoolId və ya categoryId'
        }),
        { 
          headers: { 'Content-Type': 'application/json' },
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
          headers: { 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }
    
    // Məlumatların toplu yenilənməsi üçün bütün əməliyyatları transaksiyada birləşdiririk
    const { data, error } = await supabaseClient.rpc('bulk_update_data_entries', {
      p_entries: entries,
      p_school_id: schoolId,
      p_category_id: categoryId,
      p_user_id: user.id
    });
    
    if (error) {
      console.error("Məlumatlar yenilənərkən xəta:", error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { 
          headers: { 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    );
    
  } catch (error) {
    console.error("Serverdə xəta:", error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
}));
