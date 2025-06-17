
import { createClient } from '@supabase/supabase-js';
import { ENV } from '@/config/environment';

// Validate required environment variables
if (!ENV.supabase.url || !ENV.supabase.anonKey) {
  throw new Error('Missing Supabase environment variables. Please check your configuration.');
}

// Validate URL format
try {
  new URL(ENV.supabase.url);
} catch {
  throw new Error('Invalid Supabase URL format');
}

// Validate anon key format (should be a JWT)
if (!ENV.supabase.anonKey.startsWith('eyJ')) {
  console.warn('Supabase anon key does not appear to be in JWT format');
}

// Create Supabase client with security configuration
export const supabase = createClient(
  ENV.supabase.url,
  ENV.supabase.anonKey,
  {
    auth: {
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce', // Use PKCE flow for better security
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'X-Client-Info': `infoline-web/${ENV.app.version}`,
      },
    },
    realtime: {
      params: {
        eventsPerSecond: 10, // Rate limit realtime events
      },
    },
  }
);

// Add request interceptor for additional security headers in production
if (ENV.app.environment === 'production') {
  // Note: This would typically be handled by your CDN/proxy in production
  console.log('Production mode: Additional security measures should be configured at the infrastructure level');
}

// Export types for better TypeScript support
export type { Database } from './types';
