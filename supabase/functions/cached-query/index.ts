
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0';

// In-memory keş
const CACHE = new Map<string, { data: any; timestamp: number; expiry: number }>();

// Keş konfiqurasiyası
const DEFAULT_EXPIRY_SECONDS = 300; // 5 dəqiqə

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const apiKey = url.searchParams.get('apikey');
    const cacheKey = url.searchParams.get('cacheKey') || '';
    const expirySeconds = parseInt(url.searchParams.get('expiry') || String(DEFAULT_EXPIRY_SECONDS), 10);
    const bypassCache = url.searchParams.get('bypassCache') === 'true';
    
    // API açarı tələb olunur
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API açarı tələb olunur' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Request body-ni əldə edək
    const requestBody = await req.json();
    const { query, params } = requestBody;
    
    // Heç bir sorğu yoxdursa, xəta qaytaraq
    if (!query) {
      return new Response(JSON.stringify({ error: 'Sorğu tələb olunur' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Tam keş açarı yaradaq
    const fullCacheKey = `${cacheKey}:${JSON.stringify(query)}:${JSON.stringify(params || {})}`;
    
    // Əgər keşdən istifadə etmək və keş etibarlıdırsa, keşdən məlumatı qaytaraq
    if (!bypassCache && CACHE.has(fullCacheKey)) {
      const cachedItem = CACHE.get(fullCacheKey)!;
      const now = Date.now();
      
      if (now < cachedItem.expiry) {
        console.log(`Keşdən məlumat qaytarılır: ${fullCacheKey}`);
        return new Response(JSON.stringify({
          data: cachedItem.data,
          source: 'cache',
          cachedAt: new Date(cachedItem.timestamp).toISOString()
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        // Vaxtı keçmiş keşi silin
        CACHE.delete(fullCacheKey);
      }
    }
    
    // Supabase client yaradaq
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://olbfnauhzpdskqnxtwav.supabase.co';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || apiKey;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Dinamik sorğu funksiyası yaradaq və yerinə yetirək
    let result;
    try {
      // Sorğunu hazırlayaq
      let queryBuilder = supabase.from(query.table).select(query.select || '*');
      
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
      
      // Limit əlavə edək
      if (query.limit) {
        queryBuilder = queryBuilder.limit(query.limit);
      }
      
      // Offset əlavə edək
      if (query.offset) {
        queryBuilder = queryBuilder.range(query.offset, query.offset + (query.limit || 10) - 1);
      }
      
      // Sorğunu yerinə yetirək
      const { data, error, count } = await queryBuilder;
      
      if (error) throw error;
      
      result = { data, count };
    } catch (error) {
      console.error('Sorğu yerinə yetirilən zaman xəta:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Nəticəni keşdə saxlayaq
    const now = Date.now();
    CACHE.set(fullCacheKey, {
      data: result,
      timestamp: now,
      expiry: now + (expirySeconds * 1000)
    });
    
    // Nəticəni qaytaraq
    return new Response(JSON.stringify({
      ...result,
      source: 'database',
      cachedAt: new Date(now).toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Ümumi xəta:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
