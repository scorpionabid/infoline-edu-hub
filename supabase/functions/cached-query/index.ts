
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cache-key, x-cache-expiry, x-bypass-cache',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  // CORS üçün OPTIONS məntiqini əlavə et
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Supabase client yaradılması
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );

    // Request body əldə et
    const { query, params = {} } = await req.json();
    
    // Cache parametrləri
    const cacheKey = req.headers.get('x-cache-key') || query.table;
    const cacheExpiry = parseInt(req.headers.get('x-cache-expiry') || '300'); // 5 dəqiqə default
    const bypassCache = req.headers.get('x-bypass-cache') === 'true';
    
    // Cache-dən məlumat əldə etməyə cəhd et (bypass flag-i yoxdursa)
    if (!bypassCache) {
      // Burda KV istifadə edərək daha effektli cache-ləmə əlavə edilə bilər
      // Daha sonra KV təkmilləşdirməsi əlavə edəcəyik
    }
    
    // Sorğunu yerinə yetir
    let result;
    let count = null;
    
    if (query.table) {
      // Table sorğusu yaradaq
      let queryBuilder = supabase.from(query.table).select(query.select || '*', { count: 'exact' });
      
      // Filtrləri əlavə edək
      if (query.filters) {
        for (const filter of query.filters) {
          const { column, operator, value } = filter;
          
          if (operator === 'eq') {
            queryBuilder = queryBuilder.eq(column, value);
          } else if (operator === 'neq') {
            queryBuilder = queryBuilder.neq(column, value);
          } else if (operator === 'gt') {
            queryBuilder = queryBuilder.gt(column, value);
          } else if (operator === 'lt') {
            queryBuilder = queryBuilder.lt(column, value);
          } else if (operator === 'gte') {
            queryBuilder = queryBuilder.gte(column, value);
          } else if (operator === 'lte') {
            queryBuilder = queryBuilder.lte(column, value);
          } else if (operator === 'in') {
            queryBuilder = queryBuilder.in(column, value);
          } else if (operator === 'contains') {
            queryBuilder = queryBuilder.contains(column, value);
          } else if (operator === 'ilike') {
            queryBuilder = queryBuilder.ilike(column, `%${value}%`);
          }
        }
      }
      
      // Sıralama əlavə edək
      if (query.orderBy) {
        queryBuilder = queryBuilder.order(query.orderBy.column, { ascending: query.orderBy.ascending });
      }
      
      // Pagination parametrləri
      if (query.limit) {
        queryBuilder = queryBuilder.limit(query.limit);
      }
      
      if (query.offset) {
        queryBuilder = queryBuilder.range(query.offset, query.offset + (query.limit || 10) - 1);
      }
      
      // Sorğunu yerinə yetir
      const { data, error, count: rowCount } = await queryBuilder;
      
      if (error) throw error;
      
      result = data;
      count = rowCount;
    } else {
      throw new Error('Invalid query configuration: table parameter is required');
    }
    
    // Nəticəni qaytaraq
    const response = {
      data: result,
      count,
      source: 'database',
      cachedAt: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
    
  } catch (error) {
    console.error('Cached query error:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
});
