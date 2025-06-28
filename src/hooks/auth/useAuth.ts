// ============================================================================
// İnfoLine Auth System - Auth Hook
// ============================================================================
// Bu fayl komponentlər üçün əlverişli auth hook təmin edir

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from './useAuthStore';

/**
 * Komponentlərdə auth statusunu izləmək üçün istifadə edilən hook
 * React komponentləri üçün daha əlverişli seçimdir.
 */
export const useAuth = () => {
  const user = useAuthStore(state => state.user);
  const userRole = user?.role ? { role: user.role, region_id: user.region_id, sector_id: user.sector_id, school_id: user.school_id } : null;
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isLoading = useAuthStore(state => state.isLoading);
  const error = useAuthStore(state => state.error);
  const signIn = useAuthStore(state => state.signIn);
  const signOut = useAuthStore(state => state.signOut);
  const resetPassword = useAuthStore(state => state.resetPassword);
  const updatePassword = useAuthStore(state => state.updatePassword);
  const updateProfile = useAuthStore(state => state.updateProfile);
  const fetchUser = useAuthStore(state => state.fetchUser);
  const hasPermission = useAuthStore(state => state.hasPermission);
  const initialized = useAuthStore(state => state.initialized);
  
  // Automatically trigger initialization if not already done
  useEffect(() => {
    if (!initialized && !isLoading) {
      useAuthStore.getState().initializeAuth();
    }
  }, [initialized, isLoading]);
  
  // A memoized function to check if user has required role
  const checkRoleAccess = useCallback((requiredRole) => {
    return hasPermission(requiredRole);
  }, [hasPermission]);
  
  // Track loading and error states for form handling
  const [formStatus, setFormStatus] = useState({
    isSubmitting: false,
    formError: null as string | null
  });
  
  // Login convenience wrapper with error handling
  const login = useCallback(async (email: string, password: string) => {
    setFormStatus({ isSubmitting: true, formError: null });
    try {
      await signIn(email, password);
      setFormStatus({ isSubmitting: false, formError: null });
      return true;
    } catch (e) {
      const errorMessage = e instanceof Error 
        ? e.message 
        : 'Giriş zamanı xəta baş verdi';
      setFormStatus({ isSubmitting: false, formError: errorMessage });
      return false;
    }
  }, [signIn]);
  
  // Logout convenience wrapper
  const logout = useCallback(async () => {
    setFormStatus({ isSubmitting: true, formError: null });
    try {
      await signOut();
      setFormStatus({ isSubmitting: false, formError: null });
      return true;
    } catch (e) {
      const errorMessage = e instanceof Error 
        ? e.message 
        : 'Çıxış zamanı xəta baş verdi';
      setFormStatus({ isSubmitting: false, formError: errorMessage });
      return false;
    }
  }, [signOut]);
  
  return {
    user,
    userRole,
    isAuthenticated,
    isLoading: isLoading || formStatus.isSubmitting,
    error: error || formStatus.formError,
    login,
    logout,
    resetPassword,
    updatePassword, 
    updateProfile,
    fetchUser,
    hasRole: checkRoleAccess,
    initialized
  };
};
