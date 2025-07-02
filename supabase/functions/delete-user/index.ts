import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // CORS isteyi
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    // API key və URL əldə etmə
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Server konfiqurasiyası səhvdir' }),
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

    // İstək body-dən parametrləri alırıq
    const { user_id, delete_type = 'soft' } = await req.json()
    
    console.log('İstifadəçi silmə tələbi:', { user_id, delete_type, by_user: user.id })
    
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'İstifadəçi ID-si təqdim edilməyib' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let result;
    
    if (delete_type === 'hard') {
      // Hard delete using database function
      const { data, error } = await supabaseAdmin.rpc('hard_delete_user', {
        p_target_user_id: user_id,
        p_deleted_by: user.id
      });
      
      if (error) {
        console.error('Hard delete error:', error);
        return new Response(
          JSON.stringify({ error: 'Hard delete xətası', details: error.message }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      result = data;
    } else {
      // Soft delete using database function
      const { data, error } = await supabaseAdmin.rpc('soft_delete_user', {
        p_target_user_id: user_id,
        p_deleted_by: user.id
      });
      
      if (error) {
        console.error('Soft delete error:', error);
        return new Response(
          JSON.stringify({ error: 'Soft delete xətası', details: error.message }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      result = data;
    }

    // Check if operation was successful
    if (result && !result.success) {
      return new Response(
        JSON.stringify({ error: result.error || 'Əməliyyat uğursuz oldu' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Uğurlu cavab
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: result?.message || `İstifadəçi uğurla ${delete_type === 'hard' ? 'silindi' : 'deaktiv edildi'}`,
        delete_type
      }),
      { 
        status: 200, 
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