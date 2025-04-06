
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

// CORS başlıqları
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Ana handler funksiyası
serve(async (req) => {
  // CORS preflight işləmə
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Supabase konfiqurasiyası
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase URL və ya Service Key tapılmadı');
      return new Response(
        JSON.stringify({ error: 'Server konfiqurasyonu səhvdir' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Supabase admin client yaratma
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    try {
      // 1. Bütün istifadəçiləri əldə et
      const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (authError) {
        console.error('Auth istifadəçiləri əldə edərkən xəta:', authError);
        throw authError;
      }
      
      // 2. user_roles cədvəlindən rol məlumatlarını əldə et
      const { data: userRoles, error: rolesError } = await supabaseAdmin
        .from('user_roles')
        .select('*');
      
      if (rolesError) {
        console.error('İstifadəçi rollarını əldə edərkən xəta:', rolesError);
        throw rolesError;
      }
      
      // Role məlumatlarını ID-yə görə map edək
      const roleMap: Record<string, any> = {};
      if (userRoles) {
        userRoles.forEach(role => {
          roleMap[role.user_id] = role;
        });
      }
      
      // İstifadəçi və rol məlumatlarını birləşdir
      const users = authUsers.users.map(user => {
        const userRole = roleMap[user.id] || {};
        
        return {
          id: user.id,
          email: user.email,
          role: userRole.role || 'user',
          region_id: userRole.region_id,
          sector_id: userRole.sector_id,
          school_id: userRole.school_id,
          created_at: user.created_at,
          updated_at: user.updated_at
        };
      });
      
      return new Response(
        JSON.stringify({
          success: true,
          users
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } catch (error: any) {
      console.error('İstifadəçiləri əldə edərkən xəta:', error);
      return new Response(
        JSON.stringify({ error: error.message || 'İstifadəçilər əldə edilərkən xəta baş verdi' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error: any) {
    console.error('Gözlənilməz xəta:', error);
    return new Response(
      JSON.stringify({ error: 'Gözlənilməz xəta baş verdi: ' + (error.message || 'Naməlum xəta') }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
