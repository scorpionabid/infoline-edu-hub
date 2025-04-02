
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
        // İstifadəçinin mövcud olub olmadığını yoxlayaq
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers({
          filter: {
            email: email
          }
        })
            
        if (!existingUsers || !existingUsers.users || existingUsers.users.length === 0) {
          console.log("SuperAdmin istifadəçisi mövcud deyil, yaradılır...")
          
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
        } else {
          // Mövcud SuperAdmin hesabını yoxlayaq və rolunu təmin edək
          const superAdminUser = existingUsers.users[0]
          console.log("Mövcud SuperAdmin hesabı tapıldı, ID:", superAdminUser.id)
          
          // Profil və rolunu yoxlayaq/yeniləyək
          await verifySuperAdminRoleAndProfile(supabaseAdmin, superAdminUser.id, email)
        }
      } catch (adminError) {
        console.error("SuperAdmin yoxlama xətası:", adminError)
        // Xətaya baxmayaraq davam edirik
      }
    }

    // Client üçün Supabase yaradaq
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true
      }
    })

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
      
      // İstifadəçi profili və rolunu yoxlayaq və son giriş tarixini yeniləyək
      await updateUserLastLogin(supabaseAdmin, data.user.id)

      // Rolu yoxlayaq və varsa metadata-ya əlavə edək (session içində birbaşa çatmaq üçün)
      const userRole = await getUserRole(supabaseAdmin, data.user.id)
      const userRegionId = await getUserRegionId(supabaseAdmin, data.user.id)
      const userSectorId = await getUserSectorId(supabaseAdmin, data.user.id)
      const userSchoolId = await getUserSchoolId(supabaseAdmin, data.user.id)
      
      console.log("İstifadəçi rolu:", userRole)
      console.log("İstifadəçi region ID:", userRegionId)

      // Metadatanı yeniləyək ki, role məlumatları birbaşa sessiya ilə əlçatan olsun
      if (userRole) {
        try {
          await supabaseAdmin.auth.admin.updateUserById(data.user.id, {
            user_metadata: { 
              role: userRole,
              region_id: userRegionId,
              sector_id: userSectorId,
              school_id: userSchoolId
            }
          })
          console.log("İstifadəçi metadata yeniləndi")
        } catch (metadataError) {
          console.error("Metadata yeniləmə xətası:", metadataError)
          // Xətaya baxmayaraq davam edirik
        }
      }

      return new Response(
        JSON.stringify({ 
          user: {
            ...data.user,
            role: userRole,
            region_id: userRegionId,
            sector_id: userSectorId,
            school_id: userSchoolId
          },
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

// Köməkçi funksiyalar
async function getUserRole(supabase, userId) {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle()
    
    if (error) throw error
    return data?.role || null
  } catch (error) {
    console.error("Rol əldə etmə xətası:", error)
    return null
  }
}

async function getUserRegionId(supabase, userId) {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('region_id')
      .eq('user_id', userId)
      .maybeSingle()
    
    if (error) throw error
    return data?.region_id || null
  } catch (error) {
    console.error("Region ID əldə etmə xətası:", error)
    return null
  }
}

async function getUserSectorId(supabase, userId) {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('sector_id')
      .eq('user_id', userId)
      .maybeSingle()
    
    if (error) throw error
    return data?.sector_id || null
  } catch (error) {
    console.error("Sektor ID əldə etmə xətası:", error)
    return null
  }
}

async function getUserSchoolId(supabase, userId) {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('school_id')
      .eq('user_id', userId)
      .maybeSingle()
    
    if (error) throw error
    return data?.school_id || null
  } catch (error) {
    console.error("Məktəb ID əldə etmə xətası:", error)
    return null
  }
}

async function updateUserLastLogin(supabase, userId) {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
    
    if (error) throw error
    console.log("İstifadəçinin son giriş tarixi yeniləndi")
  } catch (error) {
    console.error("Son giriş tarixinin yenilənməsində xəta:", error)
  }
}

async function setupSuperAdminProfile(supabase, userId, email) {
  try {
    // Profil yoxlayaq/yaradaq
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    
    if (!existingProfile) {
      // Profil yaradaq
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: 'SuperAdmin',
          email: email,
          language: 'az',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        })
      
      if (profileError) {
        console.error("SuperAdmin profili yaratma xətası:", profileError)
      } else {
        console.log("SuperAdmin profili yaradıldı")
      }
    } else {
      console.log("SuperAdmin profili artıq mövcuddur")
    }
    
    // Rolu yoxlayaq/yaradaq
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    
    if (!existingRole) {
      // Rol yaradaq
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'superadmin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (roleError) {
        console.error("SuperAdmin rolu yaratma xətası:", roleError)
      } else {
        console.log("SuperAdmin rolu yaradıldı")
      }
    } else if (existingRole.role !== 'superadmin') {
      // Rolu yeniləyək
      const { error: roleUpdateError } = await supabase
        .from('user_roles')
        .update({
          role: 'superadmin',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
      
      if (roleUpdateError) {
        console.error("SuperAdmin rolu yeniləmə xətası:", roleUpdateError)
      } else {
        console.log("SuperAdmin rolu yeniləndi")
      }
    } else {
      console.log("SuperAdmin rolu artıq mövcuddur")
    }
  } catch (error) {
    console.error("SuperAdmin profili və rolu yaratma xətası:", error)
  }
}

async function verifySuperAdminRoleAndProfile(supabase, userId, email) {
  try {
    // Rolu yoxlayaq
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    
    if (!roleData) {
      // Rol yoxdursa, yaradaq
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'superadmin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (roleError) {
        console.error("Rol əlavə edilməsi xətası:", roleError)
      } else {
        console.log("SuperAdmin rolu yaradıldı")
      }
    } else if (roleData.role !== 'superadmin') {
      // Rol superadmin deyilsə, yeniləyək
      const { error: updateError } = await supabase
        .from('user_roles')
        .update({
          role: 'superadmin',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
      
      if (updateError) {
        console.error("Rol yeniləmə xətası:", updateError)
      } else {
        console.log("İstifadəçi superadmin roluna yeniləndi")
      }
    } else {
      console.log("İstifadəçi artıq superadmin rolundadır")
    }
    
    // Metadatanı yeniləyək
    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { role: 'superadmin' }
    })
    
    console.log("SuperAdmin metadatası yeniləndi")
  } catch (error) {
    console.error("SuperAdmin rolunu yoxlama/yaratma xətası:", error)
  }
}
