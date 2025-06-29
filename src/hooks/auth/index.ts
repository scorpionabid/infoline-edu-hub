// ============================================================================
// İnfoLine Auth System - Main Export File
// ============================================================================
// Bu fayl təmizlənmiş auth sisteminin əsas export point-idir

// Yeni refaktor edilmiş auth strukturu - modular və daha idarə oluna bilən

// Import supabase (needed for legacy compatibility functions)
import { supabase } from '@/integrations/supabase/client';

// ⚠️ Auth types are now imported from unified types
// IMPORTANT: authTypes is DEPRECATED - use @/types/auth instead
// Yeni proyektlərdə @/types/auth istifadə edin
import * as AuthTypes from '@/types/auth';
export { AuthTypes }; // Re-export from the new location

// ========== Auth Store ==========
import {
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
} from './authStore';

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
  // getRedirectPath
};

// Compatibility Hook for ForgotPassword, Register, ResetPassword pages
// This hook is temporarily added to support the transition to the new auth system
export const useSupabaseAuth = () => {
  const updatePassword = useAuthStore(selectUpdatePassword);
  const signOut = useAuthStore(selectSignOut);
  
  // resetPassword funksiyası - ForgotPassword səhifəsi üçün - Legacy Support
  const resetPassword = async (email: string) => {
    // Prioritize new implementation via store
    const authState = useAuthStore.getState();
    if (authState?.resetPassword) {
      return authState.resetPassword(email);
    }
    
    // Fallback to direct implementation
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error resetting password:', error);
      return false;
    }
  };
  
  // signUp funksiyası - Register səhifəsi üçün - Legacy Support
  const signUp = async (email: string, password: string, metadata: Record<string, any>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/login`
        }
      });
      
      if (error) throw error;
      return { success: true, data }; 
    } catch (error) {
      console.error('Error signing up:', error);
      return { success: false, error };
    }
  };
  
  return {
    updatePassword,
    resetPassword,
    signUp,
    // signOut
  };
};

// ========== Session Monitoring ==========
export {
  useSessionMonitor,
  useSessionHealth,
  useSessionExpiry
} from './useSessionMonitor';

// ========== Enhanced Session Management ==========
export {
  setupSessionTimeout,
  clearSessionTimeout,
  checkAndRefreshSession,
  forceRefreshSession,
  getSessionManagerStatus
} from './sessionManager';

// ========== Permission System ==========
export { 
  usePermissions,
  // useDataAccessControl
} from './usePermissions';

export {
  checkRegionAccess,
  checkSectorAccess,
  checkSchoolAccess,
  checkIsSuperAdmin,
  checkIsRegionAdmin,
  checkIsSectorAdmin,
  checkUserRole,
  checkRegionAccessUtil,
  checkSectorAccessUtil,
  // checkSchoolAccessUtil
} from './usePermissions';

// ========== Type Exports ==========
export type { 
  UsePermissionsResult,
  PermissionLevel, 
  PermissionChecker, 
  PermissionResult,
  DataAccessConfig,
  DataAccessResult,
  UserRole,
  UserStatus,
  FullUserData,
  AuthState,
  AuthContextType,
  // UseAuthResult
} from '@/types/auth';

// ========== Default Export ==========
export { useAuthStore as default } from './useAuthStore';