
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

    // Admin client yaradaq - burada 401 xətası aradan qaldırılır (header istəmirik)
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
      } else if (error.message?.includes('Database error')) {
        errorMessage = 'Verilənlər bazası xətası, Supabase konfiqurasiyası yoxlayın'
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

    // İstifadəçi üçün profil və rol yaratmaq ƏVVƏLCƏ yoxlayaq
    try {
      await setupUserProfileAndRole(supabaseAdmin, data.user.id, email);
    } catch (profileError) {
      console.error("Profil/rol yaratma əməliyyatı uğursuz oldu amma giriş müvəffəqiyyətli idi:", profileError);
      // Xətanı ignorə edək, ancaq log edək. Giriş müvəffəqiyyətli olduğu üçün davam edə bilərik.
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

// İstifadəçi profili və rolunu yaradır/yoxlayır/yeniləyir
async function setupUserProfileAndRole(supabaseAdmin, userId, email) {
  try {
    console.log(`İstifadəçi profili və rolu yoxlanılır/yaradılır: ${userId}`);
    
    // Profil yoxlanılır - NULL dəyərlər üçün xüsusi ehtiyat tədbirləri
    let profileExists = false;
    
    try {
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
        
      profileExists = !!profileData;
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error("Profil yoxlama xətası:", profileError);
      }
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
            full_name: email.split('@')[0] || 'İstifadəçi',
            language: 'az',
            status: 'active',
            last_login: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error("Profil yaratma xətası:", insertError);
          throw insertError;
        }
          
        console.log(`${email} üçün profil yaradıldı`);
      } catch (insertError) {
        console.error("Profil yaratma xətası:", insertError);
        throw insertError;
      }
    } else {
      // Profil var, last_login yeniləyək
      try {
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({ 
            last_login: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
        
        if (updateError) {
          console.error("Profil yeniləmə xətası:", updateError);
          throw updateError;
        }
        
        console.log(`${email} üçün son giriş tarixi yeniləndi`);
      } catch (updateError) {
        console.error("Profil yeniləmə xətası:", updateError);
        // Bu kritik olmadığı üçün davam edə bilərik
      }
    }
    
    // Rol yoxlanılır
    let roleExists = false;
    let existingRole = null;
    
    try {
      const { data: roleData, error: roleError } = await supabaseAdmin
        .from('user_roles')
        .select('role, region_id, sector_id, school_id')
        .eq('user_id', userId)
        .maybeSingle();
        
      roleExists = !!roleData;
      existingRole = roleData;
      
      if (roleError && roleError.code !== 'PGRST116') {
        console.error("Rol yoxlama xətası:", roleError);
      }
    } catch (checkError) {
      console.error("Rol yoxlama xətası:", checkError);
    }
    
    // Rol yoxdursa, yaradaq
    if (!roleExists) {
      console.log(`${userId} ID-li istifadəçi üçün rol yaradılır...`);
      
      // Default olaraq superadmin@infoline.az üçün superadmin, digərləri üçün schooladmin
      const defaultRole = email === 'superadmin@infoline.az' ? 'superadmin' : 'schooladmin';
      
      try {
        const { error: insertError } = await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: userId,
            role: defaultRole,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error("Rol yaratma xətası:", insertError);
          throw insertError;
        }
          
        console.log(`${email} üçün '${defaultRole}' rolu yaradıldı`);
      } catch (insertError) {
        console.error("Rol yaratma xətası:", insertError);
        throw insertError;
      }
    } else {
      // SuperAdmin üçün əlavə yoxlamalar
      if (email === 'superadmin@infoline.az' && existingRole && existingRole.role !== 'superadmin') {
        try {
          // SuperAdmin üçün rol yenilənir
          const { error: updateError } = await supabaseAdmin
            .from('user_roles')
            .update({ 
              role: 'superadmin',
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
          
          if (updateError) {
            console.error("SuperAdmin rol yeniləmə xətası:", updateError);
            throw updateError;
          }
          
          console.log(`${email} üçün rol 'superadmin' olaraq yeniləndi`);
        } catch (updateError) {
          console.error("SuperAdmin rol yeniləmə xətası:", updateError);
          // Bu kritik olmadığı üçün davam edə bilərik
        }
      } else {
        console.log(`${email} üçün rol artıq mövcuddur: ${existingRole?.role || 'bilinməyən'}`);
      }
    }
  } catch (dbError) {
    console.error('İstifadəçi profili/rolunu yoxlama və ya yaratma xətası:', dbError);
    throw dbError;
  }
}
