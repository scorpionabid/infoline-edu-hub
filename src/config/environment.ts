
/**
 * Environment Configuration with Enhanced Security
 * This file validates and exports environment variables safely
 */

// Environment variable interface
interface ViteEnv {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  VITE_APP_NAME?: string;
  VITE_APP_VERSION?: string;
  VITE_APP_ENV?: string;
  VITE_BASE_URL?: string;
  VITE_ENABLE_ANALYTICS?: string;
  VITE_ENABLE_ERROR_TRACKING?: string;
  PROD?: boolean;
}

// Basic URL validation for environment variables
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Check if running in production
const isProduction = (): boolean => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const env = (import.meta as any).env as ViteEnv;
    return env.PROD === true;
  }
  return false;
};

// Environment validation function (moved from security.ts to break circular dependency)
const validateEnvironment = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Get environment variables directly here to avoid circular dependency
  let supabaseUrl: string | undefined;
  let supabaseAnonKey: string | undefined;
  
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const env = (import.meta as any).env as ViteEnv;
    supabaseUrl = env.VITE_SUPABASE_URL;
    supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
  }
  
  // Check required environment variables
  if (!supabaseUrl) {
    errors.push('VITE_SUPABASE_URL is required');
  }
  
  if (!supabaseAnonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is required');
  }
  
  // Validate URL format
  if (supabaseUrl && !isValidUrl(supabaseUrl)) {
    errors.push('VITE_SUPABASE_URL has invalid format');
  }
  
  // Check for development credentials in production
  if (isProduction()) {
    if (supabaseUrl && (supabaseUrl.includes('localhost') || supabaseUrl.includes('127.0.0.1'))) {
      errors.push('Development Supabase URL detected in production');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Secure environment variable getter
const getEnvVar = (key: string, defaultValue?: string): string => {
  // Handle Vite environment variables properly
  let value: string | undefined;
  
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const env = (import.meta as any).env as ViteEnv;
    value = env[key as keyof ViteEnv] as string;
  }
  
  // SECURITY: Remove hardcoded fallbacks for production
  if (!value && !defaultValue) {
    if (isProduction()) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    
    // Development-only fallbacks with clear warnings
    console.warn(`[SECURITY WARNING] Using development fallback for ${key}`);
    
    switch (key) {
      case 'VITE_SUPABASE_URL':
        return 'https://olbfnauhzpdskqnxtwav.supabase.co';
      case 'VITE_SUPABASE_ANON_KEY':
        return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sYmZuYXVoenBkc2txbnh0d2F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3ODQwNzksImV4cCI6MjA1ODM2MDA3OX0.OfoO5lPaFGPm0jMqAQzYCcCamSaSr6E1dF8i4rLcXj4';
      default:
        throw new Error(`No fallback available for ${key}`);
    }
  }
  
  return value || defaultValue || '';
};

// Validate environment on module load
const validation = validateEnvironment();
if (!validation.valid) {
  if (isProduction()) {
    throw new Error(`Environment validation failed: ${validation.errors.join(', ')}`);
  } else {
    console.warn('Environment validation failed:', validation.errors);
  }
}

// Type-safe environment variables
interface EnvironmentConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
    baseUrl: string;
  };
  features: {
    enableAnalytics: boolean;
    enableErrorTracking: boolean;
    enableDebugMode: boolean;
  };
  security: {
    enableCSRF: boolean;
    enableRateLimit: boolean;
    sessionTimeout: number;
  };
}

// Export validated configuration
export const ENV: EnvironmentConfig = {
  supabase: {
    url: getEnvVar('VITE_SUPABASE_URL'),
    anonKey: getEnvVar('VITE_SUPABASE_ANON_KEY'),
  },
  app: {
    name: getEnvVar('VITE_APP_NAME', 'İnfoLine'),
    version: getEnvVar('VITE_APP_VERSION', '1.0.0'),
    environment: (getEnvVar('VITE_APP_ENV', 'development') as EnvironmentConfig['app']['environment']),
    baseUrl: getEnvVar('VITE_BASE_URL', typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'),
  },
  features: {
    enableAnalytics: getEnvVar('VITE_ENABLE_ANALYTICS', 'false') === 'true',
    enableErrorTracking: getEnvVar('VITE_ENABLE_ERROR_TRACKING', 'false') === 'true',
    enableDebugMode: getEnvVar('VITE_APP_ENV', 'development') !== 'production',
  },
  security: {
    enableCSRF: true,
    enableRateLimit: true,
    sessionTimeout: 3600000, // 1 hour
  },
};

// Enhanced security headers for production
export const SECURITY_HEADERS = {
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://*.supabase.co;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https://*.supabase.co;
    connect-src 'self' https://*.supabase.co;
    font-src 'self';
    object-src 'none';
    media-src 'self';
    frame-src 'none';
    base-uri 'self';
    form-action 'self';
  `.replace(/\s+/g, ' ').trim(),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
} as const;

export default ENV;
