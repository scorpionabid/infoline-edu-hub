
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

// CORS başlıqları
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Ana handler funksiyası
serve(async (req) => {
  // CORS preflight sorğularını idarə et
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth başlığını əldə et
    const authHeader = req.headers.get('Authorization') || '';
    
    // Supabase inteqrasiyası
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    // Service Role Key ilə Supabase klientini yarat - SuperAdmin səlahiyyətləri verir
    const supabase = createClient(
      supabaseUrl,
      supabaseKey,
      { 
        global: { 
          headers: { Authorization: authHeader } 
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // İstifadəçi məlumatları və rolları əldə et
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*');

    if (rolesError) {
      console.error('İstifadəçi rollarını əldə edərkən xəta:', rolesError);
      return new Response(
        JSON.stringify({ error: 'İstifadəçi rollarını əldə edərkən xəta', details: rolesError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // User ID'lər siyahısı
    const userIds = userRoles.map(role => role.user_id);

    // Auth.users cədvəlindən email məlumatlarını əldə et
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('Auth istifadəçilərini əldə edərkən xəta:', authError);
      return new Response(
        JSON.stringify({ error: 'Auth istifadəçilərini əldə edərkən xəta', details: authError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Auth istifadəçi məlumatlarını ID-yə görə map et
    const authUserMap: Record<string, any> = {};
    if (authUsers && authUsers.users) {
      authUsers.users.forEach(user => {
        authUserMap[user.id] = user;
      });
    }

    // Tam istifadəçi məlumatlarını birləşdir
    const combinedUserData = userRoles.map(roleItem => {
      const authUser = authUserMap[roleItem.user_id] || {};
      
      return {
        id: roleItem.user_id,
        email: authUser.email || null,
        role: roleItem.role,
        region_id: roleItem.region_id,
        sector_id: roleItem.sector_id,
        school_id: roleItem.school_id,
        created_at: roleItem.created_at
      };
    });

    // İsifadəçi olmadığı halda boş siyahı qaytar
    if (combinedUserData.length === 0) {
      return new Response(
        JSON.stringify({ data: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ data: combinedUserData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Gözlənilməz xəta:', error);
    return new Response(
      JSON.stringify({ error: 'Gözlənilməz server xətası', details: error?.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
