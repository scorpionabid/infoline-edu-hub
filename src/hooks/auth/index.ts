
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
export { useSupabaseAuth } from './useSupabaseAuth';
export type { PermissionLevel, PermissionChecker, PermissionResult } from './permissionTypes';
