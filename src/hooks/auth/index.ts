
// Export all auth-related hooks and utilities
export * from './permissionUtils';
export { type UsePermissionsResult } from './usePermissions';
export { usePermissions } from './usePermissions';
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
} from './useAuthStore';

// Export the useSupabaseAuth hook
export { useSupabaseAuth } from './useSupabaseAuth';

// Export the new combined useAuth hook - yerli implementasiya
export { useAuth, type UseAuthResult } from './useAuth';
export { useRole } from '@/context/auth/useRole';
export type { PermissionLevel, PermissionChecker, PermissionResult } from './permissionTypes';
