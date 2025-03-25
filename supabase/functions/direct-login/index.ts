
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS isteyi üçün
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log("Direct-login funksiyası çağırıldı")
    
    // URL və key almaq
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY tapılmadı")
      return new Response(
        JSON.stringify({ error: 'Server konfiqurasyonu səhvdir' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Login məlumatlarını alıb
    const requestData = await req.json()
    console.log("Alınan istək məlumatları:", JSON.stringify({
      email: requestData.email,
      hasPassword: !!requestData.password
    }, null, 2))
    
    const email = requestData.email
    const password = requestData.password
    
    if (!email || !password) {
      console.error("Email və ya şifrə təqdim edilməyib")
      return new Response(
        JSON.stringify({ error: 'Email və şifrə tələb olunur' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`${email} üçün giriş cəhdi edilir`)

    // Admin client yaradaq
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Admin client ilə giriş
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('Login xətası:', error)
      
      // Daha detallı xəta məlumatları qeyd edək
      const statusCode = error.status || 400
      let errorMessage = error.message || 'Bilinməyən xəta'
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Yanlış login məlumatları'
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Email təsdiqlənməyib'
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          status: statusCode,
          details: error
        }),
        { 
          status: statusCode, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log("Uğurla daxil olundu, istifadəçi ID:", data.user?.id)

    // User-ın olması və sessiya yaradılması
    if (!data.user || !data.session) {
      console.error("İstifadəçi və ya sessiya yaradıla bilmədi")
      return new Response(
        JSON.stringify({ error: 'İstifadəçi və ya sessiya yaradıla bilmədi' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Uğurlu nəticə və sessiya
    return new Response(
      JSON.stringify({ 
        user: data.user,
        session: data.session
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Serverdə xəta:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Serverdə xəta baş verdi',
        details: JSON.stringify(error)
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
