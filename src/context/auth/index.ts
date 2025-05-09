
// Export all auth context components and hooks
export { AuthProvider } from './AuthProvider';
export { useAuth } from './useAuth';
export { useRole } from './useRole';

// Re-export types
export type { AuthContextType, AuthErrorType } from './types';

// Re-export from the Zustand store
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

// Re-export from hooks
export { usePermissions } from '@/hooks/auth/usePermissions';
