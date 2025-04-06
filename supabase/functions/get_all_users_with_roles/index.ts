
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

// CORS başlıqları
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS preflight sorğusuna cavab
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Əsas supabase client yaratma
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('SUPABASE_URL və ya SUPABASE_SERVICE_ROLE_KEY tapılmadı');
      return new Response(
        JSON.stringify({ error: 'Server konfiqurasiyası xətası' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('Edge funksiyası işə salındı: get_all_users_with_roles');

    // auth.users-dən bütün istifadəçiləri alırıq
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('İstifadəçilər əldə edilərkən xəta:', authError);
      return new Response(
        JSON.stringify({ error: `İstifadəçilər əldə edilərkən xəta: ${authError.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (!authUsers || !authUsers.users || authUsers.users.length === 0) {
      console.log('İstifadəçi tapılmadı');
      return new Response(
        JSON.stringify({ users: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    console.log(`${authUsers.users.length} istifadəçi tapıldı`);

    // İstifadəçi IDs əldə edirik
    const userIds = authUsers.users.map(user => user.id);

    // İstifadəçi rollərini əldə edirik
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .in('user_id', userIds);

    if (rolesError) {
      console.error('İstifadəçi rollərı əldə edilərkən xəta:', rolesError);
      return new Response(
        JSON.stringify({ error: `İstifadəçi rollərı əldə edilərkən xəta: ${rolesError.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Rolların map-ını yaradırıq
    const roleMap = {};
    if (userRoles) {
      userRoles.forEach(role => {
        roleMap[role.user_id] = role;
      });
    }

    // İstifadəçi məlumatlarını formatlayırıq
    const combinedUsers = authUsers.users.map(user => {
      const roleData = roleMap[user.id] || {};
      const now = new Date().toISOString();

      return {
        id: user.id,
        email: user.email || '',
        role: roleData.role || 'user',
        region_id: roleData.region_id || null,
        sector_id: roleData.sector_id || null,
        school_id: roleData.school_id || null,
        created_at: user.created_at || now,
        updated_at: user.updated_at || now,
        raw_user_meta_data: user.user_metadata,
        // JavaScript/React tərəfində istifadə üçün CamelCase əlavə edir
        createdAt: user.created_at || now,
        updatedAt: user.updated_at || now
      };
    });

    // Uğurlu cavab
    return new Response(
      JSON.stringify({ users: combinedUsers }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err) {
    // Ümumi xəta emalı
    console.error('Gözlənilməz xəta:', err);
    return new Response(
      JSON.stringify({ 
        error: 'Gözlənilməz xəta baş verdi',
        details: err instanceof Error ? err.message : String(err)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
