
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // URL və key almaq
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Server konfiqurasiyası səhvdir' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    // Authorization header-dən tokeni alaq
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization token tələb olunur' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    // Bearer token-i parse edək
    const token = authHeader.replace('Bearer ', '')
    
    // Admin client yaradaq
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    // Tokeni yoxlayaq və istifadəçi məlumatlarını əldə edək
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Etibarsız token və ya istifadəçi tapılmadı' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    // User rolu əldə edək
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role, region_id, sector_id, school_id')
      .eq('user_id', user.id)
      .maybeSingle()
    
    if (roleError) {
      return new Response(
        JSON.stringify({ error: 'İstifadəçi rolu əldə edərkən xəta baş verdi' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    // İstifadəçi metadatasını yeniləyək
    if (roleData) {
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: {
          role: roleData.role,
          region_id: roleData.region_id,
          sector_id: roleData.sector_id,
          school_id: roleData.school_id
        }
      })
    }
    
    // Geniş istifadəçi məlumatlarını əldə etmək üçün SQL funksiyasını çağıraq
    const { data: fullUserData, error: userDataError } = await supabaseAdmin.rpc(
      'get_full_user_data', 
      { user_id_param: user.id }
    )
    
    if (userDataError) {
      console.error('İstifadəçi məlumatları əldə edilə bilmədi:', userDataError)
      // Xətaya baxmayaraq davam edirik
    }
    
    // Nəticəni formatlaşdıraq
    const result = {
      user: {
        ...user,
        role: roleData?.role || user.user_metadata?.role || 'schooladmin',
        region_id: roleData?.region_id || user.user_metadata?.region_id,
        regionId: roleData?.region_id || user.user_metadata?.region_id,
        sector_id: roleData?.sector_id || user.user_metadata?.sector_id,
        sectorId: roleData?.sector_id || user.user_metadata?.sector_id,
        school_id: roleData?.school_id || user.user_metadata?.school_id,
        schoolId: roleData?.school_id || user.user_metadata?.school_id,
      },
      fullUserData: fullUserData || null
    }

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Serverdə xəta:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Serverdə xəta baş verdi' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
