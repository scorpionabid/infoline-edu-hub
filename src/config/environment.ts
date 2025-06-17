
/**
 * Environment Configuration with Security Validation
 * This file validates and exports environment variables safely
 */

import { validateEnvironment } from './security';

// Vite environment variable interface
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

// Get environment variable safely with proper Vite env access
const getEnvVar = (key: string, defaultValue?: string): string => {
  // Handle Vite environment variables properly
  let value: string | undefined;
  
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const env = (import.meta as any).env as ViteEnv;
    value = env[key as keyof ViteEnv] as string;
  }
  
  // Fallback for specific known variables
  if (!value) {
    switch (key) {
      case 'VITE_SUPABASE_URL':
        value = 'https://olbfnauhzpdskqnxtwav.supabase.co';
        break;
      case 'VITE_SUPABASE_ANON_KEY':
        value = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sYmZuYXVoenBkc2txbnh0d2F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3ODQwNzksImV4cCI6MjA1ODM2MDA3OX0.OfoO5lPaFGPm0jMqAQzYCcCamSaSr6E1dF8i4rLcXj4';
        break;
      default:
        value = defaultValue;
    }
  }
  
  if (!value && !defaultValue) {
    // For critical variables, provide hardcoded fallbacks
    if (key === 'VITE_SUPABASE_URL') {
      return 'https://olbfnauhzpdskqnxtwav.supabase.co';
    }
    if (key === 'VITE_SUPABASE_ANON_KEY') {
      return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sYmZuYXVoenBkc2txbnh0d2F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3ODQwNzksImV4cCI6MjA1ODM2MDA3OX0.OfoO5lPaFGPm0jMqAQzYCcCamSaSr6E1dF8i4rLcXj4';
    }
  }
  
  return value || defaultValue || '';
};

// Check if running in production
const isProduction = (): boolean => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const env = (import.meta as any).env as ViteEnv;
    return env.PROD === true;
  }
  return false;
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
};

// Utility function for components - simplified
export const getEnv = (key: string): string | undefined => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const env = (import.meta as any).env as ViteEnv;
    return env[key as keyof ViteEnv] as string;
  }
  return undefined;
};

// Security headers for production
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
  `.replace(/\s+/g, ' ').trim(),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
} as const;

export default ENV;
