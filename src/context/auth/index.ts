
export * from './AuthProvider';
export * from './context';

// Re-export selector functions from useAuthStore
export {
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
