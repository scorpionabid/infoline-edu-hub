
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.29.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  // CORS işleme
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Token doğrulama
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Yetkiləndirmə token tapılmadı' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Auth client
    const authClient = createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false }
      }
    );

    // İstifadəçi yoxlama
    const {
      data: { user: authUser },
      error: userError
    } = await authClient.auth.getUser();

    if (userError || !authUser) {
      return new Response(
        JSON.stringify({ error: 'İstifadəçi doğrulanmadı' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Səlahiyyətli client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });

    // İstək parametrlərini al
    const { key, pattern, dependencies } = await req.json();

    if (!key && !pattern && !dependencies) {
      return new Response(
        JSON.stringify({ error: 'Keş açarı, şablon və ya asılılıqlar tələb olunur' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let keysToDelete = [];

    // Konkret açar
    if (key) {
      keysToDelete.push(key);
    }

    // Şablona uyğun açarlar
    if (pattern) {
      const { data: matches } = await supabase
        .from('cache')
        .select('key')
        .ilike('key', `%${pattern}%`);

      if (matches && matches.length > 0) {
        keysToDelete = [...keysToDelete, ...matches.map(m => m.key)];
      }
    }

    // Asılılıq əsasında açarlar
    if (dependencies && Array.isArray(dependencies) && dependencies.length > 0) {
      // Cache cədvəlindən asılılıq saxlayan elementləri tap
      const { data: dependentCaches } = await supabase
        .from('cache')
        .select('key, dependencies');

      if (dependentCaches && dependentCaches.length > 0) {
        // Gətirilən keşlərdə asılılıq şərtini yoxla
        dependentCaches.forEach(cache => {
          if (cache.dependencies && Array.isArray(cache.dependencies)) {
            const hasMatch = dependencies.some(dep => 
              cache.dependencies.includes(dep)
            );
            
            if (hasMatch && !keysToDelete.includes(cache.key)) {
              keysToDelete.push(cache.key);
            }
          }
        });
      }
    }

    // Keşləri sil
    if (keysToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('cache')
        .delete()
        .in('key', keysToDelete);

      if (deleteError) {
        return new Response(
          JSON.stringify({ error: 'Keş silmə xətası', details: deleteError }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `${keysToDelete.length} keş girişi silindi`, 
          deletedKeys: keysToDelete 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ success: true, message: 'Silinəcək keş tapılmadı' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'İstək işlənərkən xəta baş verdi', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
