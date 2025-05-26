
export * from './AuthContext';
export * from './context';
export { default as useAuth } from './useAuth';

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
