
import { useState, useEffect, useCallback } from 'react';
import { AuthService } from '@/services/auth/AuthService';
import { FullUserData } from '@/types/auth';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface UseAuthResult {
  user: FullUserData | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  refreshUserData: () => Promise<FullUserData | null>;
  clearError: () => void;
}

export const useAuth2 = (): UseAuthResult => {
  const [user, setUser] = useState<FullUserData | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

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
  }, [clearError]);

  // Logout
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    clearError();
    
    try {
      const { error } = await AuthService.logout();
      
      if (error) {
        console.error('Logout xətası:', error);
        toast.error('Çıxış xətası', { description: error.message });
      }
      
      // Reset auth state regardless of logout success/failure
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      
    } catch (err: any) {
      console.error('Logout exception:', err);
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  // Refresh session with debounce to prevent multiple simultaneous calls
  const refreshSession = useCallback(async (): Promise<void> => {
    if (isLoading) return;
    
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
  }, [clearError, isLoading]);

  // Refresh user data
  const refreshUserData = useCallback(async (): Promise<FullUserData | null> => {
    if (!session || !isAuthenticated) return null;
    
    try {
      const userData = await AuthService.fetchUserData(session);
      
      if (userData) {
        setUser(userData);
        return userData;
      }
      
      return null;
    } catch (err: any) {
      console.error('User refresh xətası:', err);
      return null;
    }
  }, [session, isAuthenticated]);

  // Initialize auth state using a one-time flag to prevent loops
  useEffect(() => {
    // Skip if already initialized
    if (authInitialized) return;
    
    const initialize = async () => {
      setIsLoading(true);
      
      try {
        // Set up auth state listener first (before checking session)
        // but use a variable to prevent multiple subscription setup
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
          console.log('Auth state change event:', event);
          
          if (event === 'SIGNED_IN') {
            setSession(currentSession);
            setIsAuthenticated(true);
            
            // Use setTimeout to avoid React state update deadlocks
            setTimeout(async () => {
              if (currentSession) {
                const userData = await AuthService.fetchUserData(currentSession);
                if (userData) {
                  setUser(userData);
                }
              }
            }, 0);
          } 
          else if (event === 'SIGNED_OUT') {
            setUser(null);
            setSession(null);
            setIsAuthenticated(false);
            // Clear cache on sign out
            AuthService.clearCache();
          } 
          else if (event === 'TOKEN_REFRESHED') {
            setSession(currentSession);
            
            // Refresh user data but use setTimeout to prevent React update deadlocks
            setTimeout(async () => {
              if (currentSession) {
                const userData = await AuthService.fetchUserData(currentSession);
                if (userData) {
                  setUser(userData);
                }
              }
            }, 0);
          }
        });
        
        // Check for existing session
        const { session: currentSession } = await AuthService.getSession();
        
        if (currentSession) {
          setSession(currentSession);
          setIsAuthenticated(true);
          
          const userData = await AuthService.fetchUserData(currentSession);
          
          if (userData) {
            setUser(userData);
          }
        }
        
        // Mark as initialized to prevent loops
        setAuthInitialized(true);
        
        // Cleanup function to unsubscribe
        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
  }, []);

  return {
    user,
    session,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    refreshSession,
    refreshUserData,
    clearError,
  };
};

export default useAuth2;
