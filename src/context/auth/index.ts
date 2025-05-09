
// Export all auth context components and hooks
export { AuthProvider } from './AuthProvider';
export { useAuth } from './useAuth';
export { useRole } from './useRole';

// Re-export from the Zustand store for convenience
export { 
  useAuthStore,
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectError,
  selectSession,
  selectUserRole,
  selectRegionId,
  selectSectorId,
  selectSchoolId,
  shouldAuthenticate,
  isProtectedRoute,
  getRedirectPath
} from '@/hooks/auth/useAuthStore';

// Export types
export * from './types';

// Re-export from hooks
export * from '@/hooks/auth/usePermissions';
