
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') as string
const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string

serve(async (req) => {
  // CORS başlıqları
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json',
  }

  // OPTIONS sorğusuna cavab ver
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers })
  }

  try {
    // Sorğu parametrlərini al
    const { userId } = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId tələb olunur' }),
        { headers, status: 400 }
      )
    }

    // Service role ilə supabase client yarat
    const supabase = createClient(supabaseUrl, supabaseServiceRole)

    // İstifadəçi məlumatlarını əldə et
    const { data: user, error } = await supabase.auth.admin.getUserById(userId)

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers, status: 500 }
      )
    }

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'İstifadəçi tapılmadı' }),
        { headers, status: 404 }
      )
    }

    return new Response(
      JSON.stringify({ 
        email: user.user.email,
        metadata: user.user.user_metadata
      }),
      { headers, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers, status: 500 }
    )
  }
})
