
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS başlıqları
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache sisteminin durumunu saxlayan obyekt
interface CacheState {
  entries: Record<string, any>;
  invalidationLog: Array<{
    key: string;
    timestamp: number;
    reason: string;
  }>;
}

// Qlobal cache
let cacheState: CacheState = {
  entries: {},
  invalidationLog: []
};

serve(async (req) => {
  // CORS preflight sorğularına cavab ver
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
    const { key, pattern, reason = 'Manual invalidation' } = body;
    
    if (!key && !pattern) {
      return new Response(
        JSON.stringify({ error: 'key və ya pattern parametrlərindən biri tələb olunur' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    const now = Date.now();
    let invalidatedKeys: string[] = [];
    
    // Konkret bir keşi təmizlə
    if (key) {
      if (key in cacheState.entries) {
        delete cacheState.entries[key];
        invalidatedKeys.push(key);
        cacheState.invalidationLog.push({
          key,
          timestamp: now,
          reason
        });
      }
      
      // Həm də dependency-ləri olan keşləri təmizləyək
      Object.entries(cacheState.entries).forEach(([cacheKey, entry]) => {
        if (entry.dependencies && entry.dependencies.includes(key)) {
          delete cacheState.entries[cacheKey];
          invalidatedKeys.push(cacheKey);
          cacheState.invalidationLog.push({
            key: cacheKey,
            timestamp: now,
            reason: `Dependency invalidation: ${key}`
          });
        }
      });
    }
    
    // Pattern-ə uyğun keşləri təmizlə
    if (pattern) {
      const regex = new RegExp(pattern);
      
      Object.keys(cacheState.entries).forEach(cacheKey => {
        if (regex.test(cacheKey)) {
          delete cacheState.entries[cacheKey];
          invalidatedKeys.push(cacheKey);
          cacheState.invalidationLog.push({
            key: cacheKey,
            timestamp: now,
            reason: `Pattern invalidation: ${pattern}`
          });
        }
      });
    }
    
    // Jurnal limitini yoxla (son 100 qeyd)
    if (cacheState.invalidationLog.length > 100) {
      cacheState.invalidationLog = cacheState.invalidationLog.slice(-100);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        invalidatedKeys,
        invalidatedCount: invalidatedKeys.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
    
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
