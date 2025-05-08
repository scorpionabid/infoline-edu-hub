
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';

export interface UseSupabaseAuthResult {
  user: FullUserData | null;
  session: any;
  isLoading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, userData?: any) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
  updatePassword: (newPassword: string) => Promise<any>;
  refreshSession: () => Promise<void>;
}

export const useSupabaseAuth = (): UseSupabaseAuthResult => {
  const [user, setUser] = useState<FullUserData | null>(null);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initial session check
  useEffect(() => {
    const fetchSession = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(data.session);
        
        if (data.session?.user) {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();
          
          if (userError && userError.code !== 'PGRST116') throw userError;
          
          setUser({
            ...data.session.user,
            ...userData
          });
        }
      } catch (e) {
        console.error('Error fetching session:', e);
        setError(e as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('Auth state changed:', event);
      setSession(currentSession);
      
      if (currentSession?.user) {
        try {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .single();
          
          if (userError && userError.code !== 'PGRST116') throw userError;
          
          setUser({
            ...currentSession.user,
            ...userData
          });
        } catch (e) {
          console.error('Error fetching user data:', e);
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return data;
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, userData?: any) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      
      if (error) throw error;
      return data;
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return data;
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      return data;
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      setSession(data.session);
      if (data.user) {
        try {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          
          if (userError && userError.code !== 'PGRST116') throw userError;
          
          setUser({
            ...data.user,
            ...userData
          });
        } catch (e) {
          console.error('Error fetching user data:', e);
        }
      }
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    session,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    refreshSession
  };
};

export default useSupabaseAuth;
