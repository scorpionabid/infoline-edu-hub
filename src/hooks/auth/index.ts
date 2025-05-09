
// Export all auth-related hooks and utilities
export * from './permissionUtils';
export * from './types';
export * from './usePermissions';
export * from './useAuthStore';
export { useSupabaseAuth } from './useSupabaseAuth'; // Keep for compatibility

// Re-export from context for convenience
export { useAuth } from '@/context/auth/useAuth';
export { useRole } from '@/context/auth/useRole';
