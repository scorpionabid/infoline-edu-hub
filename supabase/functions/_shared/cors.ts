
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

export function handleCors(req: Request) {
  // Preflight OPTIONS sorğusu
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
}
