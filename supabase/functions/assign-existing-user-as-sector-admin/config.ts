
// CORS başlıqları
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Supabase URL
export const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';

