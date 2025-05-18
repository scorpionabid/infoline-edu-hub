
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/user';
import { Session } from '@supabase/supabase-js';

/**
 * Optimized auth hook with improved state management
 */
export const useOptimizedAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<FullUserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize auth state
   */
  const initializeAuth = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      // Update state based on session
      if (session) {
        // Fetch user profile
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (error) throw error;
        
        // Get user role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
          
        if (roleError && roleError.code !== 'PGRST116') {
          console.error('Error fetching role:', roleError);
        }
        
        // Set user state
        setUser({
          ...data,
          role: roleData?.role || 'user',
          id: session.user.id,
          email: session.user.email || '',
          lastSignIn: session.user.last_sign_in_at,
        });
        setSession(session);
      } else {
        // No session, clear state
        setUser(null);
        setSession(null);
      }
    } catch (err: any) {
      console.error('Auth initialization error:', err);
      setError(err.message || 'Failed to initialize auth');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Handle auth state changes
   */
  useEffect(() => {
    initializeAuth();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (event === 'SIGNED_IN' && newSession) {
          // Update session and fetch user profile
          setSession(newSession);
          
          // Fetch user profile
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', newSession.user.id)
            .single();
            
          if (error) {
            console.error('Error fetching user profile:', error);
            return;
          }
          
          // Get user role
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', newSession.user.id)
            .single();
            
          if (roleError && roleError.code !== 'PGRST116') {
            console.error('Error fetching role:', roleError);
          }
          
          // Set user state
          setUser({
            ...data,
            role: roleData?.role || 'user',
            id: newSession.user.id,
            email: newSession.user.email || '',
            lastSignIn: newSession.user.last_sign_in_at,
          });
        } else if (event === 'SIGNED_OUT') {
          // Clear state on signout
          setUser(null);
          setSession(null);
        }
      }
    );
    
    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [initializeAuth]);

  /**
   * Login handler
   */
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to log in');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout handler
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
    } catch (err: any) {
      setError(err.message || 'Failed to log out');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update user handler
   */
  const updateUser = useCallback((userData: FullUserData) => {
    setUser(userData);
  }, []);

  /**
   * Clear error handler
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Refresh session handler
   */
  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      setSession(data.session);
      
      // Update user data if we have a session
      if (data.session) {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
          
        if (userError) throw userError;
        
        // Get user role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', data.session.user.id)
          .single();
          
        if (roleError && roleError.code !== 'PGRST116') {
          console.error('Error fetching role:', roleError);
        }
        
        // Set user state
        setUser({
          ...userData,
          role: roleData?.role || 'user',
          id: data.session.user.id,
          email: data.session.user.email || '',
          last_sign_in_at: data.session.user.last_sign_in_at,
        });
      }
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to refresh session');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh user data handler
   */
  const refreshUserData = useCallback(async () => {
    if (!user?.id) return null;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      
      // Get user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (roleError && roleError.code !== 'PGRST116') {
        console.error('Error fetching role:', roleError);
      }
      
      // Update user state
      const updatedUser = {
        ...data,
        role: roleData?.role || 'user',
        id: user.id,
        email: user.email || '',
      };
      
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      console.error('Error refreshing user data:', err);
      return null;
    }
  }, [user]);

  return {
    user,
    session,
    isAuthenticated: !!session,
    isLoading,
    error,
    login,
    logout,
    updateUser,
    clearError,
    refreshSession,
    refreshUserData,
    initializeAuth,
  };
};
