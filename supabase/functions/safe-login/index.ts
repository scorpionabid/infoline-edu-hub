
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
    console.log("Safe-login funksiyası çağırıldı")
    
    // URL və key almaq
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      console.error("SUPABASE konfiqurasiyası əksikdir")
      return new Response(
        JSON.stringify({ error: 'Server konfiqurasiyası səhvdir' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Login məlumatlarını alaq
    let requestData
    try {
      requestData = await req.json()
    } catch (error) {
      console.error("Request JSON xətası:", error)
      return new Response(
        JSON.stringify({ error: 'Yanlış formatda istek' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    console.log("Alınan istək məlumatları:", JSON.stringify({
      email: requestData.email,
      hasPassword: !!requestData.password
    }))
    
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

    // Admin client yaradaq
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    })

    // SuperAdmin üçün xüsusi yoxlama
    if (email === 'superadmin@infoline.az') {
      console.log("SuperAdmin giriş istəyi aşkarlandı")
      
      try {
        // safe_get_user_by_email funksiyasını çağıraraq istifadəçinin mövcud olub olmadığını yoxlayaq
        const { data: userFound, error: userLookupError } = await supabaseAdmin.rpc(
          'safe_get_user_by_email',
          { _email: email }
        )
        
        if (userLookupError) {
          console.error("SuperAdmin yoxlama xətası:", userLookupError)
          throw userLookupError
        }
        
        const isSuperAdminExists = userFound && userFound.length > 0
        
        // Əgər SuperAdmin mövcud deyilsə, yaradaq
        if (!isSuperAdminExists) {
          console.log("SuperAdmin istifadəçisi mövcud deyil, yaradılır...")
          
          // Eyni email ilə istifadəçi varsa silək
          try {
            const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers({
              filter: { email }
            })
            
            if (listError) {
              console.error("İstifadəçi siyahısı xətası:", listError)
              throw listError
            }
            
            if (existingUsers?.users && existingUsers.users.length > 0) {
              console.log("Mövcud SuperAdmin hesabı tapıldı, silinir...")
              const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(existingUsers.users[0].id)
              
              if (deleteError) {
                console.error("İstifadəçi silmə xətası:", deleteError)
                throw deleteError
              }
            }
          } catch (userError) {
            console.error("İstifadəçi yoxlama/silmə xətası:", userError)
            // Xətaya baxmayaraq davam edirik
          }
          
          // Yeni SuperAdmin yaradaq
          const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { role: 'superadmin' }
          })
          
          if (createError) {
            console.error("SuperAdmin yaratma xətası:", createError)
            throw createError
          }
          
          if (newUser && newUser.user) {
            console.log("SuperAdmin yaradıldı, profil və rol təyin edilir...")
            // Profil və rol təyin edilməsi avtomatik trigger ilə edilir
          }
        }
      } catch (adminError) {
        console.error("SuperAdmin yaratma/axtarma xətası:", adminError)
        return new Response(
          JSON.stringify({ 
            error: 'SuperAdmin əməliyyatı xətası',
            details: adminError
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // Client üçün Supabase yaradaq
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

    // Normal login prosesi
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('Login xətası:', error)
        
        const statusCode = error.status || 400
        let errorMessage = error.message || 'Bilinməyən xəta'
        
        // Daha dəqiq xəta mesajları
        if (error.message?.includes('Invalid login credentials')) {
          errorMessage = 'Yanlış login məlumatları'
        } else if (error.message?.includes('Email not confirmed')) {
          errorMessage = 'Email təsdiqlənməyib'
        } else if (error.message?.includes('Database error')) {
          errorMessage = 'Verilənlər bazası xətası'
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
    } catch (authError) {
      console.error('Supabase auth işləyərkən ciddi xəta:', authError)
      return new Response(
        JSON.stringify({ 
          error: 'Supabase auth xətası',
          details: authError
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
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
