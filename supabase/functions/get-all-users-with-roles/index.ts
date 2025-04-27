
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// CORS başlıqları
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

serve(async (req) => {
  try {
    // CORS preflight sorğusuna cavab
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders, status: 204 });
    }

    // Auth başlığını al
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          error: 'Avtorizasiya başlığı tələb olunur',
          users: [] 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Supabase konfiqurasiyası
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ 
          error: 'Server konfiqurasiyası xətası',
          users: [] 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Service role ilə supabase client yaradırıq
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // İstifadəçi autentifikasiyası və validasiyası
    try {
      // Token-dan istifadəçini əldə et
      const token = authHeader.replace('Bearer ', '');
      const { data: jwtData, error: jwtError } = await supabase.auth.getUser(token);
      
      if (jwtError || !jwtData.user) {
        return new Response(
          JSON.stringify({ 
            error: 'Avtorizasiya xətası - token doğrulanmadı',
            users: [] 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }
      
      // İstifadəçinin rolunu yoxla
      const { data: userRoleData, error: userRoleError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", jwtData.user.id)
        .maybeSingle();
      
      if (userRoleError) {
        return new Response(
          JSON.stringify({ 
            error: 'İstifadəçi rolu tapılmadı',
            users: [] 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }

      const userRole = userRoleData?.role || 'user';

      // Sorğu parametrlərini əldə et
      let { page = 1, pageSize = 10, filter = {} } = await req.json().catch(() => ({}));
      page = parseInt(page) || 1;
      pageSize = parseInt(pageSize) || 10;

      // Bazaya sorğu
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      let query = supabase
        .from('user_roles')
        .select(`
          *,
          profiles:profiles(*)
        `, { count: 'exact' });
        
      // Rol əsasında filtrləmə
      if (userRole === 'superadmin') {
        // Superadmin bütün istifadəçiləri görə bilər
      } 
      else if (userRole === 'regionadmin') {
        // RegionAdmin öz regionundakı istifadəçiləri görə bilər
        query = query.eq('region_id', userRoleData.region_id);
      }
      else if (userRole === 'sectoradmin') {
        // SectorAdmin öz sektorundakı istifadəçiləri görə bilər
        query = query.eq('sector_id', userRoleData.sector_id);
      }
      else {
        // Digər istifadəçilər üçün boş siyahı qaytar
        return new Response(
          JSON.stringify({ users: [], count: 0 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
      
      // Əlavə filtrlər
      if (filter.role) {
        if (Array.isArray(filter.role)) {
          query = query.in('role', filter.role);
        } else {
          query = query.eq('role', filter.role);
        }
      }
      
      if (filter.regionId) {
        query = query.eq('region_id', filter.regionId);
      }
      
      if (filter.sectorId) {
        query = query.eq('sector_id', filter.sectorId);
      }
      
      if (filter.schoolId) {
        query = query.eq('school_id', filter.schoolId);
      }
      
      // Səhifələmə və sıralamanı əlavə et
      query = query.range(from, to).order('created_at', { ascending: false });
      
      // Sorğunu həyata keçir
      const { data, error, count } = await query;
      
      if (error) {
        return new Response(
          JSON.stringify({ 
            error: `İstifadəçilər əldə edilərkən xəta: ${error.message}`,
            users: [] 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      // Auth məlumatlarını əldə et (real layihədə auth.users cədvəlinə əlavə sorğu edilərdi)
      const { data: authUsers } = await supabase.auth.admin.listUsers({
        perPage: 1000
      }).catch(() => ({ data: { users: [] } }));
      
      const emailMap: Record<string, string> = {};
      
      // Email məlumatlarını map edək
      if (authUsers && authUsers.users) {
        authUsers.users.forEach(authUser => {
          if (authUser.email) {
            emailMap[authUser.id] = authUser.email;
          }
        });
      }
      
      // İstifadəçi məlumatlarını formatla
      const formattedUsers = data?.map(role => {
        const profileData = role.profiles || {};
        const email = emailMap[role.user_id] || profileData.email || `user-${role.user_id.substring(0, 8)}@infoline.edu`;
        
        return {
          id: role.user_id,
          email: email,
          full_name: profileData.full_name || email.split('@')[0] || 'İsimsiz İstifadəçi',
          name: profileData.full_name || email.split('@')[0] || 'İsimsiz İstifadəçi',
          role: role.role || 'user',
          region_id: role.region_id || null,
          sector_id: role.sector_id || null,
          school_id: role.school_id || null,
          regionId: role.region_id || null,
          sectorId: role.sector_id || null,
          schoolId: role.school_id || null,
          phone: profileData.phone || '',
          position: profileData.position || '',
          language: profileData.language || 'az',
          avatar: profileData.avatar || null,
          status: profileData.status || 'active',
          last_login: profileData.last_login || null,
          lastLogin: profileData.last_login || null,
          created_at: profileData.created_at || role.created_at || new Date().toISOString(),
          updated_at: profileData.updated_at || role.updated_at || new Date().toISOString(),
          createdAt: profileData.created_at || role.created_at || new Date().toISOString(),
          updatedAt: profileData.updated_at || role.updated_at || new Date().toISOString(),
          notificationSettings: {
            email: true,
            system: true
          }
        };
      }) || [];

      return new Response(
        JSON.stringify({ users: formattedUsers, count: count || 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } catch (err) {
      console.error('Error:', err);
      return new Response(
        JSON.stringify({ 
          error: String(err),
          users: [] 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(
      JSON.stringify({ 
        error: 'Gözlənilməz xəta baş verdi',
        users: [] 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
