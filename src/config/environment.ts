
/**
 * Helper to safely access environment variables in both Node and browser environments
 */
export const getEnv = (key: string, defaultValue: string = ''): string => {
  // For Vite applications
  if (typeof import.meta !== 'undefined') {
    return ((import.meta as any).env?.[key]) || defaultValue;
  }
  
  // For Node.js
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  
  return defaultValue;
};

// Export commonly used environment variables
export const SUPABASE_URL = getEnv('VITE_SUPABASE_URL');
export const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY');
export const API_URL = getEnv('VITE_API_URL');
export const APP_ENV = getEnv('VITE_APP_ENV', 'development');

// Helper to check environment
export const isProduction = APP_ENV === 'production';
export const isDevelopment = APP_ENV === 'development';
export const isTest = APP_ENV === 'test';
