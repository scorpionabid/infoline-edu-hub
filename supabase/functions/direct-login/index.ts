
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

    // Admin client yaradaq - daha təhlükəsiz konfiqurasiya ilə
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
        // İstifadəçinin mövcud olub olmadığını yoxlayaq
        const { data: userList, error: userQueryError } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('full_name', 'superadmin')
          .limit(1)
          
        if (userQueryError) {
          console.error("SuperAdmin yoxlama sorğusunda xəta:", userQueryError)
        }
        
        const isSuperAdminExists = userList && userList.length > 0
        
        if (!isSuperAdminExists) {
          console.log("SuperAdmin istifadəçisi mövcud deyil, yaradılır...")
          
          // Əvvəlcə eyni email ilə istifadəçi varsa silək (sadəcə SuperAdmin üçün)
          try {
            const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers({
              filter: {
                email: email
              }
            })
            
            if (existingUsers && existingUsers.users && existingUsers.users.length > 0) {
              console.log("Mövcud SuperAdmin hesabı tapıldı, silinir...")
              await supabaseAdmin.auth.admin.deleteUser(existingUsers.users[0].id)
            }
          } catch (deleteError) {
            console.error("Mövcud hesabı silmə xətası:", deleteError)
            // Xətanı ignore edək və davam edək
          }
          
          // İstifadəçi yaradılır
          const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { role: 'superadmin' }
          })
          
          if (createError) {
            console.error("SuperAdmin yaratma xətası:", createError)
            return new Response(
              JSON.stringify({ 
                error: 'SuperAdmin yaratma zamanı xəta',
                details: createError 
              }),
              { 
                status: 500, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }
          
          if (newUser && newUser.user) {
            console.log("SuperAdmin yaradıldı, profil və rol təyin edilir...")
            await setupSuperAdminProfile(supabaseAdmin, newUser.user.id, email)
          }
        }
      } catch (adminError) {
        console.error("SuperAdmin yaratma/axtarma xətası:", adminError)
        // Xətaya baxmayaraq davam edirik
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
        } else if (error.message?.includes('confirmation_token') || error.message?.includes('email_change') || error.message?.includes('null value')) {
          errorMessage = 'Giriş zamanı texniki xəta'
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

// SuperAdmin profilini yaradır/yoxlayır
async function setupSuperAdminProfile(supabaseAdmin, userId, email) {
  try {
    console.log(`SuperAdmin profili yoxlanılır/yaradılır: ${userId}`);
    
    // Profil yoxlanılır
    let profileExists = false;
    
    try {
      const { data: profileData } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
        
      profileExists = !!profileData;
    } catch (checkError) {
      console.error("Profil yoxlama xətası:", checkError);
    }
    
    // Profil yoxdursa, yaradaq
    if (!profileExists) {
      console.log(`${userId} ID-li istifadəçi üçün profil yaradılır...`);
      
      try {
        const { error: insertError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: userId,
            full_name: 'superadmin',
            language: 'az',
            status: 'active',
            last_login: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error("Profil yaratma xətası:", insertError);
        } else {
          console.log(`${email} üçün profil yaradıldı`);
        }
      } catch (insertError) {
        console.error("Profil yaratma xətası:", insertError);
      }
    }
    
    // Rol yoxlanılır
    let roleExists = false;
    
    try {
      const { data: roleData } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
        
      roleExists = !!roleData;
    } catch (checkError) {
      console.error("Rol yoxlama xətası:", checkError);
    }
    
    // Rol yoxdursa, yaradaq
    if (!roleExists) {
      console.log(`${userId} ID-li istifadəçi üçün rol yaradılır...`);
      
      try {
        const { error: insertError } = await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: userId,
            role: 'superadmin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error("Rol yaratma xətası:", insertError);
        } else {
          console.log(`${email} üçün 'superadmin' rolu yaradıldı`);
        }
      } catch (insertError) {
        console.error("Rol yaratma xətası:", insertError);
      }
    } else {
      // Rolun superadmin olduğunu təmin edək
      try {
        const { error: updateError } = await supabaseAdmin
          .from('user_roles')
          .update({ 
            role: 'superadmin',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
        
        if (updateError) {
          console.error("Rol yeniləmə xətası:", updateError);
        } else {
          console.log(`${email} üçün rol 'superadmin' olaraq yeniləndi`);
        }
      } catch (updateError) {
        console.error("Rol yeniləmə xətası:", updateError);
      }
    }
  } catch (dbError) {
    console.error('İstifadəçi profili/rolunu yoxlama və ya yaratma xətası:', dbError);
  }
}
