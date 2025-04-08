
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

// CORS başlıqları
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
    
    if (!authHeader) {
      console.error('Authorization başlığı tapılmadı');
      return new Response(
        JSON.stringify({ 
          error: 'Authorization başlığı tələb olunur',
          users: [] // Boş massiv qaytarırıq ki, client tərəfdə xəta yaranmasın
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    if (authHeader) {
      console.log("Auth header uzunluğu:", authHeader.length);
      console.log("Auth header başlanğıcı:", authHeader.substring(0, 30) + "...");
    }

    // Əsas supabase client yaratma
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('SUPABASE_URL və ya SUPABASE_SERVICE_ROLE_KEY tapılmadı');
      return new Response(
        JSON.stringify({ 
          error: 'Server konfiqurasiyası xətası',
          users: [] // Boş massiv qaytarırıq ki, client tərəfdə xəta yaranmasın
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Service client istifadə edək, JWT token yoxlaması olmadan
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Auth token ilə istifadəçini doğrulayaq
    try {
      // Token-dan istifadəçini əldə et
      const token = authHeader.replace('Bearer ', '');
      const { data: jwtData, error: jwtError } = await supabase.auth.getUser(token);
      
      if (jwtError || !jwtData.user) {
        console.error('JWT token yoxlaması zamanı xəta:', jwtError);
        return new Response(
          JSON.stringify({ 
            error: 'Avtorizasiya xətası - token doğrulanmadı',
            users: [] // Boş massiv qaytarırıq ki, client tərəfdə xəta yaranmasın
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }
      
      console.log('Cari istifadəçi ID:', jwtData.user.id);
      
      // İstifadəçinin rolunu yoxla
      const { data: userRoleData, error: userRoleError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", jwtData.user.id)
        .maybeSingle(); // .single() əvəzinə .maybeSingle() istifadə edirik
      
      if (userRoleError) {
        console.error('İstifadəçi rolu sorğusu xətası:', userRoleError);
        return new Response(
          JSON.stringify({ 
            error: 'İstifadəçi rolu tapılmadı',
            users: [] // Boş massiv qaytarırıq ki, client tərəfdə xəta yaranmasın
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }

      // Rol məlumatları boşdursa, default rol təyin edirik
      const userRole = userRoleData?.role || 'user';
      console.log("İstifadəçi rolu:", userRole);

      // Yalnız superadmin və regionadmin rolları icazəlidir
      if (userRole !== "superadmin" && userRole !== "regionadmin" && userRole !== "sectoradmin") {
        console.error("İcazəsiz giriş - yalnız superadmin, regionadmin və sectoradmin");
        return new Response(
          JSON.stringify({ 
            error: 'Bu əməliyyat üçün superadmin, regionadmin və ya sectoradmin səlahiyyətləri tələb olunur',
            users: [] // Boş massiv qaytarırıq ki, client tərəfdə xəta yaranmasın
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }
    } catch (authError) {
      console.error('Auth yoxlamada xəta:', authError);
      return new Response(
        JSON.stringify({ 
          error: 'Avtorizasiya yoxlaması zamanı xəta',
          users: [] // Boş massiv qaytarırıq ki, client tərəfdə xəta yaranmasın
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    console.log('Edge funksiyası işə salındı: get_all_users_with_roles');
    
    try {
      // auth.users-dən bütün istifadəçiləri alırıq
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({
        perPage: 1000 // Daha çox istifadəçi almaq üçün
      });

      if (authError) {
        console.error('İstifadəçilər əldə edilərkən xəta:', authError);
        return new Response(
          JSON.stringify({ 
            error: `İstifadəçilər əldə edilərkən xəta: ${authError.message}`,
            users: [] // Boş massiv qaytarırıq ki, client tərəfdə xəta yaranmasın
          }),
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
        // Xəta baş versə də davam edirik, profilesMap boş olacaq
      }
      
      // İstifadəçi profilləri üçün map yaradırıq
      const profilesMap: Record<string, any> = {};
      if (profiles && Array.isArray(profiles)) {
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
        // Xəta baş versə də davam edirik, roleMap boş olacaq
      }

      // Rolların map-ını yaradırıq
      const roleMap: Record<string, any> = {};
      if (userRoles && Array.isArray(userRoles)) {
        userRoles.forEach(role => {
          roleMap[role.user_id] = role;
        });
      }

      // İstifadəçi məlumatlarını formatlayırıq
      const now = new Date().toISOString();
      const combinedUsers = authUsers.users.map(user => {
        const roleData = roleMap[user.id] || {};
        const profileData = profilesMap[user.id] || {};

        // Əgər profil yoxdursa, boş profil yaradaq
        if (!profileData || Object.keys(profileData).length === 0) {
          console.log(`Profil yoxdur istifadəçi üçün: ${user.id}, yeni profil yaradılır...`);
          
          // Profil yaratma
          try {
            supabase
              .from('profiles')
              .insert({
                id: user.id,
                full_name: user.user_metadata?.full_name || 'İsimsiz İstifadəçi',
                email: user.email,
                language: 'az',
                status: 'active',
                created_at: now,
                updated_at: now
              })
              .then(({ error }) => {
                if (error) {
                  console.error('Profil yaratma xətası:', error);
                } else {
                  console.log(`Yeni profil yaradıldı istifadəçi üçün: ${user.id}`);
                }
              });
          } catch (err) {
            console.error('Profil yaratma zamanı istisna:', err);
          }
        }

        return {
          id: user.id,
          email: user.email || '',
          full_name: profileData.full_name || user.user_metadata?.full_name || 'İsimsiz İstifadəçi',
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
          raw_user_meta_data: user.user_metadata || {},
          // Rolu və təyinat statusunu qeyd edək
          is_assigned: !!(roleData.region_id || roleData.sector_id || roleData.school_id),
          assignment_type: roleData.role ? (
            roleData.region_id ? 'region' : 
            roleData.sector_id ? 'sector' : 
            roleData.school_id ? 'school' : 'none'
          ) : 'none'
        };
      });

      // Debug məlumatı
      console.log(`Formatlanmış istifadəçilər: ${combinedUsers.length}`);

      // Uğurlu cavab
      return new Response(
        JSON.stringify({ users: combinedUsers }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } catch (dataErr) {
      console.error('Data əməliyyatı xətası:', dataErr);
      return new Response(
        JSON.stringify({ 
          error: 'İstifadəçilər əldə edilərkən xəta',
          details: dataErr instanceof Error ? dataErr.message : String(dataErr),
          users: [] // Boş massiv qaytarırıq ki, client tərəfdə xəta yaranmasın
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
  } catch (err) {
    // Ümumi xəta emalı
    console.error('Gözlənilməz xəta:', err);
    return new Response(
      JSON.stringify({ 
        error: 'Gözlənilməz xəta baş verdi',
        details: err instanceof Error ? err.message : String(err),
        users: [] // Boş massiv qaytarırıq ki, client tərəfdə xəta yaranmasın
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
