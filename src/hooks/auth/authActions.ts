// ============================================================================
// İnfoLine Auth System - Auth Actions
// ============================================================================
// Bu fayl auth əməliyyatlarını təmin edir: sign in, sign out, password reset və s.

import { supabase } from '@/integrations/supabase/client';
import { StoreApi } from 'zustand';

type SetState<T> = StoreApi<T>['setState'];
type GetState<T> = StoreApi<T>['getState'];
import type { AuthState, FullUserData } from '@/types/auth'; // Updated to unified types
import { AUTH_TIMEOUT_CONFIG } from '@/types/auth'; // Updated to unified types
import { updateUserProfile } from './profileManager';
import { clearSessionTimeout } from './sessionManager';

/**
 * İstifadəçinin sistemə daxil olması
 * @param email User email
 * @param password User password
 */
export async function signIn(
  email: string, 
  password: string, 
  set: SetState<AuthState>, 
  get: GetState<AuthState>
): Promise<void> {
  const state = get();
  
  // Prevent concurrent sign-in attempts
  if (state.isLoading && state.signInAttemptTime && Date.now() - state.signInAttemptTime < AUTH_TIMEOUT_CONFIG.SIGNIN_TIMEOUT) {
    console.log('⚠️ [Auth] Sign-in already in progress, skipping');
    return;
  }
  
  set({ isLoading: true, error: null, signInAttemptTime: Date.now() });
  
  // Set a timeout to prevent indefinite loading
  const signInTimeout = setTimeout(() => {
    const currentState = get();
    if (currentState.isLoading && currentState.signInAttemptTime) {
      console.error('❌ [Auth] Sign-in timed out');
      set({ 
        isLoading: false, 
        error: 'Giriş vaxtı bitdi. Zəhmət olmasa, yenidən cəhd edin.', 
        signInAttemptTime: null 
      });
    }
  }, AUTH_TIMEOUT_CONFIG.SIGNIN_TIMEOUT);
  
  try {
    console.log('🔐 [Auth] Attempting sign-in:', { email });
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    clearTimeout(signInTimeout);
    
    if (error) {
      console.error('❌ [Auth] Sign-in failed:', error.message);
      
      // Update state with error
      set({ 
        isLoading: false, 
        error: error.message, 
        signInAttemptTime: null 
      });
      
      throw error;
    }
    
    // Sign-in successful, reset attempt time
    set({ signInAttemptTime: null });
    
    console.log('✅ [Auth] Sign-in successful, loading user profile');
    
    // Note: We don't need to manually fetch the user here as the onAuthStateChange
    // event will trigger with SIGNED_IN and handle initialization
  } catch (e) {
    // Clear timeout in case of exception
    clearTimeout(signInTimeout);
    
    console.error('❌ [Auth] Sign-in exception:', e);
    
    // Ensure loading state is reset
    const loadingState = get().isLoading;
    if (loadingState) {
      set({ 
        isLoading: false, 
        error: e instanceof Error ? e.message : 'An unexpected error occurred', 
        signInAttemptTime: null 
      });
    }
    
    throw e;
  }
}

/**
 * İstifadəçinin sistemdən çıxması
 */
export async function signOut(
  set: SetState<AuthState>, 
  get: GetState<AuthState>
): Promise<void> {
  set({ isLoading: true, error: null });
  
  try {
    console.log('🔓 [Auth] Signing out');
    
    // Clear session timeout
    clearSessionTimeout();
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ [Auth] Sign-out error:', error);
      set({ isLoading: false, error: error.message });
      throw error;
    }
    
    // Reset state
    set({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
    
    console.log('✅ [Auth] Sign-out successful');
  } catch (e) {
    console.error('❌ [Auth] Sign-out exception:', e);
    
    // Ensure loading state is reset even in case of error
    set({ isLoading: false, error: e instanceof Error ? e.message : 'Sign out failed' });
    throw e;
  }
}

/**
 * Şifrə sıfırlama linki göndərir
 * @param email Email to send password reset link to
 * @returns Success status
 */
export async function resetPassword(
  email: string, 
  set: SetState<AuthState>, 
  get: GetState<AuthState>
): Promise<boolean> {
  set({ isLoading: true, error: null });
  
  try {
    console.log('🔄 [Auth] Requesting password reset:', { email });
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    
    if (error) {
      console.error('❌ [Auth] Password reset request failed:', error);
      set({ isLoading: false, error: error.message });
      return false;
    }
    
    set({ isLoading: false });
    console.log('✅ [Auth] Password reset email sent');
    return true;
  } catch (e) {
    console.error('❌ [Auth] Password reset exception:', e);
    set({ isLoading: false, error: e instanceof Error ? e.message : 'Password reset failed' });
    return false;
  }
}

/**
 * İstifadəçi şifrəsini yeniləyir
 * @param newPassword New password
 * @returns Success status
 */
export async function updatePassword(
  newPassword: string, 
  set: SetState<AuthState>, 
  get: GetState<AuthState>
): Promise<boolean> {
  set({ isLoading: true, error: null });
  
  try {
    console.log('🔄 [Auth] Updating password');
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      console.error('❌ [Auth] Password update failed:', error);
      set({ isLoading: false, error: error.message });
      return false;
    }
    
    set({ isLoading: false });
    console.log('✅ [Auth] Password updated successfully');
    return true;
  } catch (e) {
    console.error('❌ [Auth] Password update exception:', e);
    set({ isLoading: false, error: e instanceof Error ? e.message : 'Password update failed' });
    return false;
  }
}

/**
 * İstifadəçi profilini yeniləyir
 * @param profileData Profile data to update
 */
export async function updateProfile(
  profileData: Partial<FullUserData>, 
  set: SetState<AuthState>, 
  get: GetState<AuthState>
): Promise<void> {
  const state = get();
  
  if (!state.user) {
    throw new Error('Cannot update profile: No user logged in');
  }
  
  set({ isLoading: true, error: null });
  
  try {
    const userId = state.user.id;
    
    const { success, error } = await updateUserProfile(userId, profileData);
    
    if (!success) {
      throw error || new Error('Unknown error updating profile');
    }
    
    // Fetch updated user data
    await fetchUser(set, get);
    
    console.log('✅ [Auth] Profile updated successfully');
  } catch (e) {
    console.error('❌ [Auth] Profile update exception:', e);
    set({ 
      isLoading: false, 
      error: e instanceof Error ? e.message : 'Profile update failed' 
    });
    throw e;
  }
}

/**
 * İstifadəçi məlumatlarını yenidən əldə edir
 */
export async function fetchUser(
  set: SetState<AuthState>, 
  get: GetState<AuthState>
): Promise<void> {
  const state = get();
  
  if (!state.session?.user) {
    console.warn('⚠️ [Auth] Cannot fetch user: No active session');
    return;
  }
  
  set({ isLoading: true, error: null });
  
  try {
    console.log('🔄 [Auth] Fetching updated user profile');
    
    // The performInitialization function handles profile fetching and state setting
    const { performInitialization } = get();
    await performInitialization();
    
    console.log('✅ [Auth] User data refreshed');
  } catch (e) {
    console.error('❌ [Auth] User fetch exception:', e);
    set({ 
      isLoading: false, 
      error: e instanceof Error ? e.message : 'User fetch failed' 
    });
  }
}

/**
 * İstifadəçinin müəyyən rola icazəsinin olub-olmadığını yoxlayır
 * @param requiredRole Required role or array of roles
 * @returns Whether the user has the required role
 */
export function hasPermission(
  requiredRole: string | string[], 
  get: GetState<AuthState>
): boolean {
  const { user } = get();
  
  if (!user) return false;
  
  // Check if user has required role
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role);
  }
  
  return user.role === requiredRole;
}
