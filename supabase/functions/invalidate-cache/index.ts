
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// CORS başlıqları
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Bütün keşləri saxlamaq üçün global bir dəyişən
const CACHE = new Map<string, any>();

serve(async (req) => {
  // CORS OPTIONS sorğusunu işləyək
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { cacheKey } = await req.json();
    
    if (!cacheKey) {
      return new Response(JSON.stringify({ error: 'cacheKey tələb olunur' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Tam uyğunlaşma üçün
    if (CACHE.has(cacheKey)) {
      CACHE.delete(cacheKey);
    }
    
    // Prefikslə başlayan bütün keşləri silmək
    const keysToDelete: string[] = [];
    CACHE.forEach((_, key) => {
      if (key.startsWith(`${cacheKey}:`)) {
        keysToDelete.push(key);
      }
    });
    
    for (const key of keysToDelete) {
      CACHE.delete(key);
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: `${keysToDelete.length + (CACHE.has(cacheKey) ? 1 : 0)} keş elementi silindi`,
      invalidatedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Keş invalidasiyası zamanı xəta:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
