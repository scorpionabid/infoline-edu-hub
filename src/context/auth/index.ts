
// Export AuthProvider directly from AuthProvider.tsx instead of non-existent provider file
export * from './AuthProvider';
export * from './context';
export * from './useAuth';
// Remove references to non-existent files
export * from './types';
// Import from the correct location for usePermissions
export * from '@/hooks/auth/usePermissions';
