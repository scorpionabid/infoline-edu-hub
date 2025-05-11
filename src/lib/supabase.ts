
import { createClient } from '@supabase/supabase-js';

// Supabase connection with explicit URL and key values
const supabaseUrl = "https://olbfnauhzpdskqnxtwav.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sYmZuYXVoenBkc2txbnh0d2F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3ODQwNzksImV4cCI6MjA1ODM2MDA3OX0.OfoO5lPaFGPm0jMqAQzYCcCamSaSr6E1dF8i4rLcXj4";

// Create a single Supabase client for working with the database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage, // Use localStorage for better persistence
    persistSession: true,  // Always persist session
    autoRefreshToken: true, // Auto refresh token on expiry
    detectSessionInUrl: false, // Disable detecting session in URL to avoid conflicts
    debug: process.env.NODE_ENV === 'development' // Enable debug logs in development
  }
});

// Export for convenience
export default supabase;
