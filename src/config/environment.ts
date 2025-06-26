
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

// Check if running in production - be more lenient for development
const isProduction = (): boolean => {
  // Only consider it production if explicitly set and not in Lovable environment
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const env = (import.meta as any).env as ViteEnv;
    const mode = env.VITE_APP_ENV || 'development';
    const isLovable = typeof window !== 'undefined' && 
                     (window.location.hostname.includes('lovable.app') || 
                      window.location.hostname.includes('localhost'));
    
    // Only true production, not development or Lovable
    return mode === 'production' && !isLovable;
  }
  return false;
};

// Secure environment variable getter with better fallbacks
const getEnvVar = (key: string, defaultValue?: string): string => {
  // Handle Vite environment variables properly
  let value: string | undefined;
  
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const env = (import.meta as any).env as ViteEnv;
    value = env[key as keyof ViteEnv] as string;
  }
  
  // If we have a value, return it
  if (value) {
    return value;
  }
  
  // Use default value if provided
  if (defaultValue) {
    return defaultValue;
  }
  
  // Enhanced fallbacks for development/Lovable environments
  if (!isProduction()) {
    switch (key) {
      case 'VITE_SUPABASE_URL': {
        return 'https://olbfnauhzpdskqnxtwav.supabase.co';
      case 'VITE_SUPABASE_ANON_KEY': {
        return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sYmZuYXVoenBkc2txbnh0d2F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3ODQwNzksImV4cCI6MjA1ODM2MDA3OX0.OfoO5lPaFGPm0jMqAQzYCcCamSaSr6E1dF8i4rLcXj4';
      case 'VITE_APP_NAME': {
        return 'İnfoLine';
      case 'VITE_APP_VERSION': {
        return '1.0.0';
      case 'VITE_APP_ENV': {
        return 'development';
      case 'VITE_BASE_URL': {
        return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      default:
        return '';
    }
  }
  
  // Production mode - only fail for missing critical vars
  if (key === 'VITE_SUPABASE_URL' || key === 'VITE_SUPABASE_ANON_KEY') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return '';
};

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

export default ENV;
