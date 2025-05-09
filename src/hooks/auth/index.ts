
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

// Export the new useSupabaseAuth hook
export { useSupabaseAuth } from './useSupabaseAuth';

// Re-export from context for convenience
export { useAuth } from '@/context/auth/useAuth';
export { useRole } from '@/context/auth/useRole';
export type { PermissionLevel, PermissionChecker, PermissionResult } from './permissionTypes';
