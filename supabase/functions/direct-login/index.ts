
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
        JSON.stringify({ error: 'Server konfiqurasiyası səhvdir' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Əgər authorization header varsa, onu əldə edək
    const authHeader = req.headers.get('authorization')
    console.log("Authorization header:", authHeader ? 'Mövcuddur' : 'Yoxdur')
    
    // Login məlumatlarını alaq
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

    // Əgər istifadəçinin rolu yoxdursa, avtomatik yaradaq
    try {
      // user_roles cədvəlindən yoxlayaq
      const { data: roleData, error: roleError } = await supabaseAdmin
        .from('user_roles')
        .select('*')
        .eq('user_id', data.user.id)
        .single();
        
      if (roleError || !roleData) {
        // Rolu yoxdur, yaradaq - default olaraq superadmin@infoline.az üçün superadmin, digərləri üçün schooladmin
        const defaultRole = email === 'superadmin@infoline.az' ? 'superadmin' : 'schooladmin';
        
        await supabaseAdmin
          .from('user_roles')
          .upsert({
            user_id: data.user.id,
            role: defaultRole,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        console.log(`${email} üçün '${defaultRole}' rolu yaradıldı`);
      }
      
      // Profili yoxlayaq və lazım olarsa yeniləyək
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (profileError) {
        // Profil yoxdur, yaradaq
        await supabaseAdmin
          .from('profiles')
          .upsert({
            id: data.user.id,
            full_name: email.split('@')[0] || 'İstifadəçi',
            language: 'az',
            status: 'active',
            last_login: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        console.log(`${email} üçün profil yaradıldı`);
      } else {
        // Profil var, last_login yeniləyək
        await supabaseAdmin
          .from('profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.user.id);
      }
    } catch (dbError) {
      console.error('İstifadəçi rolunu/profilini yoxlama/yaratma xətası:', dbError);
      // Bu xətanı qeyd edirik, lakin login prosesini davam etdiririk
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
