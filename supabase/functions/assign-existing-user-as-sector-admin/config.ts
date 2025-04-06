
// Supabase URL və anahtarları əldə etmək üçün konfiqurasiya
export const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
export const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
export const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// CORS başlıqları
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
