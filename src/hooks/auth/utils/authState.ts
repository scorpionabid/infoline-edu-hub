import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AuthState } from './authTypes';
import { AuthService } from '@/services/auth/AuthService';

/**
 * useAuthState - autentifikasiya vəziyyətini idarə edən hook
 * 
 * Bu hook yalnız daxili state-i idarə edir və əməliyyatlar yerinə yetirmir.
 * Həmin əməliyyatlar useAuthActions hook-unda həyata keçirilir.
 */
export const useAuthState = () => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Tətbiqin ilk yüklənməsində auth vəziyyətini yoxla
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
            AuthService.clearCache && AuthService.clearCache();
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
      } catch (err: any) {
        console.error('Auth initialization error:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
  }, []);

  return {
    // State variables
    user,
    setUser,
    session, 
    setSession,
    isAuthenticated,
    setIsAuthenticated,
    isLoading,
    setIsLoading,
    error,
    setError,
    authInitialized,
    
    // Auth state object - AuthState interfaceini təmin edir
    state: {
      user,
      session,
      isAuthenticated,
      isLoading,
      error,
      authInitialized
    } as AuthState
  };
};
