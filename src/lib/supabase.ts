
/**
 * Re-export supabase client from the main integration file
 * This avoids creating multiple SupabaseClient instances in the browser which causes warnings
 */

import { supabase } from '@/integrations/supabase/client';

// Re-export for backward compatibility
export { supabase };

export default supabase;

// Re-export the service functions from client.ts for backward compatibility
export * from '@/integrations/supabase/client';
