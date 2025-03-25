
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

    // SuperAdmin yaratma parametrləri
    const email = 'superadmin@infoline.az'
    const password = 'Admin123!'
    const userData = {
      full_name: 'SuperAdmin',
      role: 'superadmin',
    }

    // Əvvəlcə bu email ilə istifadəçinin mövcud olub-olmadığını yoxlayırıq
    const { data: existingUsers, error: searchError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
    
    if (searchError) {
      console.error('Mövcud istifadəçiləri axtararkən xəta:', searchError)
    }
    
    if (existingUsers && existingUsers.length > 0) {
      return new Response(
        JSON.stringify({ message: 'Bu email ilə istifadəçi artıq mövcuddur' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Supabase ilə yeni istifadəçi yaradırıq
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: userData
    })

    if (createError) {
      return new Response(
        JSON.stringify({ error: 'SuperAdmin yaradılarkən xəta baş verdi', details: createError }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        message: 'SuperAdmin uğurla yaradıldı', 
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
    return new Response(
      JSON.stringify({ error: 'Serverda xəta baş verdi', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
