
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
        JSON.stringify({ error: 'Autorization başlığı tapılmadı' }),
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
        JSON.stringify({ error: 'Şifrə sıfırlamaq üçün icazəniz yoxdur' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // İstək body-dən istifadəçi məlumatlarını alırıq
    const { userId, newPassword } = await req.json()
    
    if (!userId || !newPassword) {
      return new Response(
        JSON.stringify({ error: 'İstifadəçi ID və ya yeni şifrə təmin edilməyib' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Supabase ilə şifrəni yeniləyirik
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    })

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Şifrə yenilənərkən xəta baş verdi', details: updateError }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Profil cədvəlində şifrə sıfırlama tarixini yeniləyirik
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        password_reset_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (profileError) {
      console.error('Şifrə sıfırlama tarixi yenilənərkən xəta:', profileError)
    }

    return new Response(
      JSON.stringify({ message: 'Şifrə uğurla yeniləndi' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Serverda xəta baş verdi', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
