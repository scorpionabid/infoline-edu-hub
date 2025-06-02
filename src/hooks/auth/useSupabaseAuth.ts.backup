
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { FullUserData, NotificationSettings, UserStatus } from '@/types/user';
import { UserRole, normalizeRole } from '@/types/role';

/**
 * Hook for Supabase authentication operations
 */
export const useSupabaseAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<FullUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize authentication
  const initializeAuth = useCallback(async () => {
    try {
      // Get current session
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      // Set session state
      setSession(data.session);
      
      // If session exists, fetch user data
      if (data.session) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
        
        if (profileError) throw profileError;
        
        // Get user role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', data.session.user.id)
          .single();
        
        if (roleError && roleError.code !== 'PGRST116') {
          console.error('Error fetching role:', roleError);
        }
        
        // Set user state with complete data
        setUser({
          id: data.session.user.id,
          email: data.session.user.email || '',
          role: normalizeRole(roleData?.role) as 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin',
          status: (profileData?.status as UserStatus) || 'active',
          ...profileData,
        });
      }
    } catch (e: any) {
      console.error('Error initializing auth:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Setup auth state change listener
  useEffect(() => {
    initializeAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        // Update session state
        setSession(currentSession);
        
        if (event === 'SIGNED_IN' && currentSession) {
          setLoading(true);
          
          try {
            // Fetch user profile
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentSession.user.id)
              .single();
            
            if (profileError) throw profileError;
            
            // Get user role
            const { data: roleData, error: roleError } = await supabase
              .from('user_roles')
              .select('*')
              .eq('user_id', currentSession.user.id)
              .single();
            
            if (roleError && roleError.code !== 'PGRST116') {
              console.error('Error fetching role:', roleError);
            }
            
            // Set user state with complete data
            setUser({
              id: currentSession.user.id,
              email: currentSession.user.email || '',
              role: normalizeRole(roleData?.role) as 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin',
              status: (profileData?.status as UserStatus) || 'active',
              ...profileData,
            });
          } catch (e: any) {
            console.error('Error fetching profile:', e);
            setError(e.message);
          } finally {
            setLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          // Clear user state on sign out
          setUser(null);
        }
      }
    );
    
    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [initializeAuth]);

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return { success: true, session: data.session, user: data.user };
    } catch (e: any) {
      console.error('Error signing in:', e);
      setError(e.message);
      return { success: false, error: e.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      return { success: true };
    } catch (e: any) {
      console.error('Error signing out:', e);
      setError(e.message);
      return { success: false, error: e.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      
      return { success: true };
    } catch (e: any) {
      console.error('Error resetting password:', e);
      setError(e.message);
      return { success: false, error: e.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user password
  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      console.error('Error updating password:', e);
      setError(e.message);
      return { success: false, error: e.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign up with email and password
  const signUp = useCallback(async (email: string, password: string, userData?: any) => {
    try {
      setLoading(true);
      setError(null);
      
      // Create new user account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        }
      });
      
      if (error) throw error;
      
      return { 
        success: true, 
        session: data.session, 
        user: data.user,
        message: 'Qeydiyyat uğurlu oldu. Emailinizə göndərilmiş linkə keçid edin.'
      };
    } catch (e: any) {
      console.error('Error signing up:', e);
      setError(e.message);
      return { success: false, error: e.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user profile
  const updateProfile = useCallback(async (profileData: Partial<FullUserData>) => {
    if (!user) {
      setError('No authenticated user');
      return { success: false, error: 'No authenticated user' };
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Update profile in the profiles table
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          avatar_url: profileData.avatar_url,
          phone: profileData.phone,
          position: profileData.position,
          language: profileData.language,
          status: profileData.status,
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update notification settings if provided
      if (profileData.notificationSettings || profileData.notification_settings) {
        const notificationSettings: NotificationSettings = profileData.notificationSettings || profileData.notification_settings || {
          email: true,
          push: false,
          inApp: true,
          system: true,
          deadline: true,
          sms: false,
          deadlineReminders: true,
          statusUpdates: true,
          weeklyReports: false,
        };
        
        // Store notification settings in user metadata
        const { data: metaData, error: metaError } = await supabase.auth.updateUser({
          data: { notification_settings: notificationSettings }
        });
        
        if (metaError) throw metaError;
      }
      
      // Update user state
      setUser({
        ...user,
        ...profileData,
      });
      
      return { success: true };
    } catch (e: any) {
      console.error('Error updating profile:', e);
      setError(e.message);
      return { success: false, error: e.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    session,
    loading,
    error,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    clearError,
    initializeAuth,
  };
};
