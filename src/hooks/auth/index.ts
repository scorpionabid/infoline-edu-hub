// ============================================================================
// İnfoLine Auth System - Main Export File
// ============================================================================
// Bu fayl təmizlənmiş auth sisteminin əsas export point-idir

import { supabase } from '@/integrations/supabase/client';

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
  // getRedirectPath
} from './useAuthStore';

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
  
  // resetPassword funksiyası - ForgotPassword səhifəsi üçün
  const resetPassword = async (email: string) => {
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
  
  // signUp funksiyası - Register səhifəsi üçün
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