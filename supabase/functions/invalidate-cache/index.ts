
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Bütün keşləri saxlamaq üçün global bir dəyişən (keş-qlobal dəyişəndir)
// Bu dəyişən bütün funksiya ekzemplarları arasında paylaşılır
declare global {
  var CACHE: Map<string, any>;
}

if (!globalThis.CACHE) {
  globalThis.CACHE = new Map();
}

serve(async (req) => {
  try {
    const { cacheKey } = await req.json();
    
    if (!cacheKey) {
      return new Response(JSON.stringify({ error: 'cacheKey tələb olunur' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Tam uyğunlaşma üçün
    if (globalThis.CACHE.has(cacheKey)) {
      globalThis.CACHE.delete(cacheKey);
    }
    
    // Prefikslə başlayan bütün keşləri silmək
    const keysToDelete: string[] = [];
    globalThis.CACHE.forEach((_, key) => {
      if (key.startsWith(`${cacheKey}:`)) {
        keysToDelete.push(key);
      }
    });
    
    for (const key of keysToDelete) {
      globalThis.CACHE.delete(key);
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: `${keysToDelete.length + (globalThis.CACHE.has(cacheKey) ? 1 : 0)} keş elementi silindi`,
      invalidatedAt: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Keş invalidasiyası zamanı xəta:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
