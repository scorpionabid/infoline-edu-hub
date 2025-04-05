
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS isteyi
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // API key və URL əldə etmə
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    if (!supabaseUrl || !supabaseServiceKey) {
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
    })

    // Authorization başlığından JWT əldə etmə
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization başlığı tapılmadı' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // JWT-dən istifadəçi məlumatlarını əldə etmə
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'İstifadəçi doğrulanmadı', details: userError }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // İstifadəçinin superadmin və ya regionadmin olub olmadığını yoxlayırıq
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()
    
    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: 'İstifadəçi rolu tapılmadı', details: roleError }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (roleData.role !== 'superadmin' && roleData.role !== 'regionadmin') {
      return new Response(
        JSON.stringify({ error: 'İstifadəçi yaratmaq üçün icazəniz yoxdur' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // İstək body-dən istifadəçi məlumatlarını alırıq
    const { email, password, userData } = await req.json()
    
    console.log('Yeni istifadəçi yaratma tələbi:', { email, userData })
    
    if (!email || !password || !userData || !userData.full_name || !userData.role) {
      return new Response(
        JSON.stringify({ error: 'Məlumatlar natamamdır' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // RegionAdmin-in yalnız öz regionu üçün admin yaratma hüququ var
    if (roleData.role === 'regionadmin') {
      // RegionAdmin-in öz region_id-sini alırıq
      const { data: adminRoleData, error: adminRoleError } = await supabaseAdmin
        .from('user_roles')
        .select('region_id')
        .eq('user_id', user.id)
        .single()
      
      if (adminRoleError || !adminRoleData || !adminRoleData.region_id) {
        return new Response(
          JSON.stringify({ error: 'RegionAdmin məlumatları tapılmadı', details: adminRoleError }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      // RegionAdmin yalnız öz regionu üçün admin yarada bilər
      if (userData.role === 'regionadmin') {
        if (userData.region_id !== adminRoleData.region_id) {
          return new Response(
            JSON.stringify({ error: 'Yalnız öz regionunuz üçün admin yarada bilərsiniz' }),
            { 
              status: 403, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
      }
      
      // SectorAdmin yaratdıqda sektor region_id-si yoxlanılır
      if (userData.role === 'sectoradmin' && userData.sector_id) {
        const { data: sectorData, error: sectorError } = await supabaseAdmin
          .from('sectors')
          .select('region_id')
          .eq('id', userData.sector_id)
          .single()
        
        if (sectorError || !sectorData || sectorData.region_id !== adminRoleData.region_id) {
          return new Response(
            JSON.stringify({ error: 'Bu sektor üçün admin yaratmaq icazəniz yoxdur' }),
            { 
              status: 403, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
      }
      
      // SchoolAdmin yaratdıqda məktəb region_id-si yoxlanılır
      if (userData.role === 'schooladmin' && userData.school_id) {
        const { data: schoolData, error: schoolError } = await supabaseAdmin
          .from('schools')
          .select('region_id')
          .eq('id', userData.school_id)
          .single()
        
        if (schoolError || !schoolData || schoolData.region_id !== adminRoleData.region_id) {
          return new Response(
            JSON.stringify({ error: 'Bu məktəb üçün admin yaratmaq icazəniz yoxdur' }),
            { 
              status: 403, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
      }
    }

    // Supabase ilə yeni istifadəçi yaradırıq
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: userData.full_name,
        role: userData.role,
        region_id: userData.region_id,
        sector_id: userData.sector_id,
        school_id: userData.school_id,
      }
    })

    if (createError) {
      console.error('İstifadəçi yaratma xətası:', createError)
      return new Response(
        JSON.stringify({ error: 'İstifadəçi yaradılarkən xəta baş verdi', details: createError }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('İstifadəçi uğurla yaradıldı:', { id: newUser.user.id, email: newUser.user.email })

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'İstifadəçi uğurla yaradıldı', 
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
          created_at: newUser.user.created_at
        } 
      }),
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Server xətası:', error)
    return new Response(
      JSON.stringify({ error: 'Serverda xəta baş verdi', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
