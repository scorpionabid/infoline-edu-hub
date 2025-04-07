
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
    // Headers-i daha detallı loqla
    const headersObj = Object.fromEntries(req.headers.entries());
    console.log("Bütün headers:", JSON.stringify(headersObj, null, 2));
    
    // Auth başlığını al
    const authHeader = req.headers.get('Authorization');
    console.log("Auth header alındı:", authHeader ? "Var" : "Yoxdur");
    if (authHeader) {
      console.log("Auth header uzunluğu:", authHeader.length);
      console.log("Auth header başlanğıcı:", authHeader.substring(0, 30) + "...");
    }
    
    if (!authHeader) {
      console.error('Authorization başlığı tapılmadı');
      return new Response(
        JSON.stringify({ error: 'Authorization başlığı tələb olunur' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

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

    // Auth token ilə client
    const supabaseAuth = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Cari istifadəçini doğrula
    try {
      const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
      
      if (userError || !user) {
        console.error('İstifadəçi autentifikasiya xətası:', userError);
        return new Response(
          JSON.stringify({ error: 'Avtorizasiya xətası - istifadəçi tapılmadı' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }
      
      console.log('Cari istifadəçi ID:', user.id);
    } catch (authError) {
      console.error('Auth yoxlamada xəta:', authError);
      return new Response(
        JSON.stringify({ error: 'Avtorizasiya yoxlaması zamanı xəta' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Admin işləri üçün client
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('Edge funksiyası işə salındı: get_all_users_with_roles');
    
    // auth.users-dən bütün istifadəçiləri alırıq
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({
      perPage: 100 // Daha çox istifadəçi almaq üçün
    });

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

    // İstifadəçi profilelərini əldə edirik
    const userIds = authUsers.users.map(user => user.id);
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);
      
    if (profilesError) {
      console.error('İstifadəçi profilləri əldə edilərkən xəta:', profilesError);
    }
    
    // İstifadəçi profilləri üçün map yaradırıq
    const profilesMap = {};
    if (profiles) {
      profiles.forEach(profile => {
        profilesMap[profile.id] = profile;
      });
    }
    
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
      const profileData = profilesMap[user.id] || {};
      const now = new Date().toISOString();

      return {
        id: user.id,
        email: user.email || '',
        full_name: profileData.full_name || 'İsimsiz İstifadəçi',
        role: roleData.role || 'user',
        region_id: roleData.region_id || null,
        sector_id: roleData.sector_id || null,
        school_id: roleData.school_id || null,
        phone: profileData.phone || null,
        position: profileData.position || null,
        language: profileData.language || 'az',
        avatar: profileData.avatar || null,
        status: profileData.status || 'active',
        last_login: profileData.last_login || null,
        created_at: user.created_at || now,
        updated_at: user.updated_at || now,
        // JavaScript/React tərəfində istifadə üçün CamelCase əlavə edir
        createdAt: user.created_at || now,
        updatedAt: user.updated_at || now,
        raw_user_meta_data: user.user_metadata || {}
      };
    });

    // Debug məlumatı
    console.log(`Formatlanmış istifadəçilər: ${combinedUsers.length}`);

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
