// ============================================================================
// İnfoLine Auth Store - Export Wrapper
// ============================================================================
// Bu fayl yeni stores/authStore.ts faylını export edir
// Köhnə import path-ları ilə compatibility təmin edir

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
  selectUpdateProfile,
  selectUpdatePassword,
  selectHasPermission,
  selectSignOut,
  shouldAuthenticate,
  isProtectedRoute,
  getRedirectPath
} from './stores/authStore';

export { useAuthStore as default } from './stores/authStore';