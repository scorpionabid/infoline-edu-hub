
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

// Supabase connection with explicit URL and key values
const supabaseUrl = "https://olbfnauhzpdskqnxtwav.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sYmZuYXVoenBkc2txbnh0d2F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3ODQwNzksImV4cCI6MjA1ODM2MDA3OX0.OfoO5lPaFGPm0jMqAQzYCcCamSaSr6E1dF8i4rLcXj4";

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing');
  throw new Error('Supabase configuration is incomplete');
}

// Create a single Supabase client for working with the database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Prevent URL-based session detection which causes conflicts
    storage: localStorage, // Use localStorage for better persistence
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-client'
    }
  }
});

// Export the singleton instance
export default supabase;

// Re-export the service functions from client.ts for backward compatibility
export * from '@/integrations/supabase/client';
