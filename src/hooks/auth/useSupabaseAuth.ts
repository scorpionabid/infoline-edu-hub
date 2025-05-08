
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { FullUserData } from '@/types/user';

export const useSupabaseAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<FullUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Authentication functions
  const loginWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      setError(error.message);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Get user profile from Supabase
  const getUserProfile = async (userId: string): Promise<FullUserData | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data as FullUserData;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Check and refresh session
  const refreshSession = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        setSession(data.session);
        
        if (data.session.user) {
          const profile = await getUserProfile(data.session.user.id);
          if (profile) {
            setUser({
              ...profile,
              email: data.session.user.email || profile.email,
              id: data.session.user.id
            });
          }
        }
      }
    } catch (error) {
      console.error('Session refresh error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Set up auth change listener
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          const profile = await getUserProfile(session.user.id);
          if (profile) {
            setUser({
              ...profile,
              email: session.user.email || profile.email,
              id: session.user.id
            });
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Initial session check
    refreshSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [refreshSession]);

  return {
    user,
    session,
    loading,
    error,
    loginWithEmail,
    signOut,
    resetPassword,
    refreshSession,
    setError
  };
};
