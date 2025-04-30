
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS başlıqları
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache obyekti
interface CacheEntry {
  data: any;
  expiry: number; // timestamp
  dependencies?: string[];
}

const cache: Record<string, CacheEntry> = {};

serve(async (req) => {
  // CORS preflight sorğularına cavab ver
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Supabase client yaratma
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase konfiqurasiyası: URL və ya key tapılmadı');
      return new Response(
        JSON.stringify({ error: 'Server konfiqurasiyası səhvdir' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Request body-ni alaq
    let body;
    try {
      body = await req.json();
      console.log('Request məlumatları:', body);
    } catch (error) {
      console.error('Request body parse xətası:', error);
      return new Response(
        JSON.stringify({ error: 'Düzgün JSON formatında body tələb olunur' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Body parametrlərini alırıq
    const { queryKey, queryFn, cacheConfig } = body;
    
    if (!queryKey || !queryFn) {
      return new Response(
        JSON.stringify({ error: 'queryKey və queryFn parametrləri tələb olunur' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Cache konfiqurasiyası - TTL və dependencies
    const defaultTTL = 300; // 5 dəqiqə
    const cacheKey = Array.isArray(queryKey) ? queryKey.join(':') : String(queryKey);
    const ttl = cacheConfig?.ttl || defaultTTL;
    const dependencies = cacheConfig?.dependencies || [];
    
    // İndi-ki vaxtı al
    const now = Date.now();
    
    // Əgər cache-də varsa və hələ etibarlıdırsa, cache-dən qaytaraq
    if (cache[cacheKey] && cache[cacheKey].expiry > now) {
      console.log(`Cache hit for key: ${cacheKey}`);
      return new Response(
        JSON.stringify({ 
          data: cache[cacheKey].data,
          fromCache: true,
          expiry: cache[cacheKey].expiry
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    console.log(`Cache miss for key: ${cacheKey}, executing query function`);
    
    // Cache-də yoxdursa, funksiyamızı icra edək
    let result;
    try {
      // queryFn-nin tipindən asılı olaraq icra edək
      if (typeof queryFn === 'string') {
        // SQL sorğusu kimi icra et
        const { data, error } = await supabase.from(queryFn).select('*');
        if (error) throw error;
        result = data;
      } else if (typeof queryFn === 'object' && queryFn.table) {
        // Cədvəl və filtrlərlə sorğu
        let query = supabase.from(queryFn.table).select(queryFn.select || '*');
        
        // Filtrləri əlavə edək
        if (queryFn.filters) {
          for (const [method, params] of Object.entries(queryFn.filters)) {
            if (typeof query[method] === 'function') {
              // @ts-ignore
              query = query[method](...params);
            }
          }
        }
        
        const { data, error } = await query;
        if (error) throw error;
        result = data;
      } else {
        // Funksiya kimi icra et
        result = await queryFn();
      }
      
      // Nəticəni cache-lə
      cache[cacheKey] = {
        data: result,
        expiry: now + ttl * 1000, // Millisaniyəyə çeviririk
        dependencies
      };
      
      return new Response(
        JSON.stringify({ 
          data: result,
          fromCache: false,
          expiry: cache[cacheKey].expiry
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
      
    } catch (error: any) {
      console.error('Sorğu icra edilərkən xəta:', error);
      return new Response(
        JSON.stringify({ error: error.message || 'Sorğu icra edilərkən xəta baş verdi' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Gözlənilməz xəta:', error);
    return new Response(
      JSON.stringify({ 
        error: `Gözlənilməz xəta: ${error instanceof Error ? error.message : String(error)}` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
