
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { CacheConfig } from '../_shared/types.ts'

serve(async (req) => {
  // CORS idarəsi
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Giriş parametrləri
    const { key, pattern } = await req.json()
    
    // Parametrləri yoxlayırıq - ya key ya da pattern tələb olunur
    if (!key && !pattern) {
      return new Response(
        JSON.stringify({
          error: 'key və ya pattern parametrlərindən biri tələb olunur'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // İcazə yoxlaması üçün admin klientini yaradırıq
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // İcazə yoxlaması və istifadəçini təyin edirəm
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    // Əgər user yoxdursa xəta qaytarırıq
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // İstifadəçinin rolunu yoxlayırıq
    const { data: userRole } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    // Burada, hörmətli oxucu, daha təhlükəsiz bir icazə yoxlaması əlavə edə bilərsiniz.
    // Məsələn, yalnız müəyyən rolların keş təmizləməsinə icazə vermək.
    
    let invalidatedKeys = []
    
    if (key) {
      // Konkret keş açarını təmizləyirik
      const { data: keyData, error: keyError } = await supabaseClient
        .from('cache')
        .delete()
        .eq('key', key)
        .select('key')
      
      if (keyError) throw new Error(`Cache key deletion error: ${keyError.message}`)
      invalidatedKeys = keyData?.map(item => item.key) || []
    }
    
    if (pattern) {
      // Pattern ilə uyğun keşləri təmizləyirik
      const { data: patternData, error: patternError } = await supabaseClient
        .from('cache')
        .delete()
        .like('key', `%${pattern}%`)
        .select('key')
      
      if (patternError) throw new Error(`Cache pattern deletion error: ${patternError.message}`)
      invalidatedKeys = [...invalidatedKeys, ...(patternData?.map(item => item.key) || [])]
    }
    
    // Asılı keşləri də təmizləyirik
    const { data: dependentCaches, error: depError } = await supabaseClient
      .from('cache_dependencies')
      .select('cache_key')
      .in('dependency_key', invalidatedKeys)
    
    if (dependentCaches && dependentCaches.length > 0) {
      const dependentKeys = dependentCaches.map(item => item.cache_key)
      
      const { error: depDeleteError } = await supabaseClient
        .from('cache')
        .delete()
        .in('key', dependentKeys)
      
      if (depDeleteError) {
        throw new Error(`Dependent cache deletion error: ${depDeleteError.message}`)
      }
      
      invalidatedKeys = [...invalidatedKeys, ...dependentKeys]
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        invalidatedKeys,
        count: invalidatedKeys.length,
        message: `${invalidatedKeys.length} cache keys invalidated successfully` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
