import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { AuthService } from '@/services/auth/AuthService';
import { FullUserData } from '@/types/user';
import { toast } from 'sonner';
import { AuthActions, AuthState } from './authTypes';

/**
 * useAuthActions - autentifikasiya əməliyyatlarını idarə edən hook
 * 
 * Bu hook, auth state-i üzərində əməliyyatlar yerinə yetirir və dəyişikliklər edir.
 * Daxili state-i özündə saxlamır, onu useAuthState-dən alır.
 */
export const useAuthActions = (
  state: AuthState,
  setUser: (user: FullUserData | null) => void,
  setSession: (session: any) => void,
  setIsAuthenticated: (isAuth: boolean) => void,
  setIsLoading: (isLoading: boolean) => void,
  setError: (error: Error | null) => void
) => {
  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  // Login with email and password
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    clearError();
    
    try {
      const { user, session, error } = await AuthService.login(email, password);
      
      if (error) {
        setError(error);
        toast.error('Login xətası', { description: error.message });
        return false;
      }
      
      if (session && user) {
        setUser(user);
        setSession(session);
        setIsAuthenticated(true);
        return true;
      } else {
        setError(new Error('Səlahiyyətlər əldə edilə bilmədi'));
        return false;
      }
    } catch (err: any) {
      setError(err);
      toast.error('Login xətası', { description: err.message });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [clearError, setError, setIsAuthenticated, setIsLoading, setSession, setUser]);

  // Logout - fixed implementation to properly clear the state
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    clearError();
    
    try {
      console.log("Logging out user...");
      
      // Call Supabase logout directly to ensure it works
      await supabase.auth.signOut();
      
      // Also call through our service for any additional cleanup
      const { error } = await AuthService.logout();
      
      if (error) {
        console.error('Logout xətası:', error);
        toast.error('Çıxış xətası', { description: error.message });
      } else {
        console.log("Logout successful via AuthService");
      }
      
      // Always clear the state regardless of API success
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      
      // Clear the auth cache as well
      AuthService.clearCache && AuthService.clearCache();
      
      // Force redirect to login page
      window.location.href = '/login';
      
    } catch (err: any) {
      console.error('Logout exception:', err);
      
      // Still clear state on exception
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      
      // Force redirect to login page even on error
      window.location.href = '/login';
    } finally {
      setIsLoading(false);
    }
  }, [clearError, setIsAuthenticated, setIsLoading, setSession, setUser]);

  // Refresh session with debounce to prevent multiple simultaneous calls
  const refreshSession = useCallback(async (): Promise<void> => {
    if (state.isLoading) return;
    
    setIsLoading(true);
    clearError();
    
    try {
      const { session, error } = await AuthService.refreshSession();
      
      if (error) {
        console.error('Session refresh xətası:', error);
        // Only clear auth state if JWT/session related error
        if (error.message?.includes('JWT') || error.message?.includes('session')) {
          setUser(null);
          setSession(null);
          setIsAuthenticated(false);
          toast.error('Session vaxtı bitib', { description: 'Zəhmət olmasa yenidən daxil olun' });
        }
        return;
      }
      
      if (session) {
        setSession(session);
        
        // Refresh user data
        const userData = await AuthService.fetchUserData(session);
        
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (err: any) {
      console.error('Session refresh exception:', err);
    } finally {
      setIsLoading(false);
    }
  }, [clearError, setError, setIsAuthenticated, setIsLoading, setSession, setUser, state.isLoading]);

  // Refresh user data
  const refreshUserData = useCallback(async (): Promise<FullUserData | null> => {
    if (!state.session || !state.isAuthenticated) return null;
    
    try {
      const userData = await AuthService.fetchUserData(state.session);
      
      if (userData) {
        setUser(userData);
        return userData;
      }
      
      return null;
    } catch (err: any) {
      console.error('User refresh xətası:', err);
      return null;
    }
  }, [setUser, state.isAuthenticated, state.session]);

  return {
    login,
    logout,
    refreshSession,
    refreshUserData,
    clearError
  } as Partial<AuthActions>;
};
