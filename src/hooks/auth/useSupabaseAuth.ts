
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData, UserStatus } from '@/types/auth';

export const useSupabaseAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Get user data from profiles
      const userData = await fetchUserData();
      
      return { data, error: null, userData };
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, metadata?: any) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed');
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(err.message || 'Logout failed');
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
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(err.message || 'Reset password failed');
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.updateUser({
        password
      });
      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      console.error('Update password error:', err);
      setError(err.message || 'Update password failed');
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    return resetPassword(email);
  };

  const refreshSession = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      console.error('Refresh session error:', err);
      setError(err.message || 'Refresh session failed');
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const getSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch (err: any) {
      console.error('Get session error:', err);
      return null;
    }
  };

  const updateProfile = async (profileData: Partial<FullUserData>) => {
    try {
      setLoading(true);
      
      // Update profiles table
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone,
          position: profileData.position,
          avatar: profileData.avatar,
          language: profileData.language,
          updated_at: new Date().toISOString()
        })
        .eq('id', profileData.id)
        .select()
        .single();

      if (error) throw error;
      
      return { data, error: null };
    } catch (err: any) {
      console.error('Update profile error:', err);
      setError(err.message || 'Update profile failed');
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async (): Promise<FullUserData | null> => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;
      
      // Get user role and profile data
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (roleError && roleError.code !== 'PGRST116') {
        console.error('Error fetching user role:', roleError);
      }
      
      // Get user profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      }
      
      if (!profileData) {
        console.warn('No profile data found for user:', user.id);
      }
      
      // Combine data
      const userData: FullUserData = {
        id: user.id,
        email: user.email || '',
        full_name: profileData?.full_name || user.email?.split('@')[0] || 'User',
        role: roleData?.role || 'schooladmin',
        region_id: roleData?.region_id,
        sector_id: roleData?.sector_id,
        school_id: roleData?.school_id,
        phone: profileData?.phone,
        position: profileData?.position,
        language: profileData?.language || 'az',
        avatar: profileData?.avatar,
        status: (profileData?.status as UserStatus) || 'active',
        last_login: profileData?.last_login,
        created_at: profileData?.created_at,
        updated_at: profileData?.updated_at,
        notification_settings: {
          email: true,
          push: true,
          app: true
        }
      };
      
      return userData;
    } catch (err: any) {
      console.error('Error fetching user data:', err);
      return null;
    }
  };

  const updateUserData = async (userData: Partial<FullUserData>) => {
    try {
      setLoading(true);
      
      // Update profile data
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: userData.full_name,
          phone: userData.phone,
          position: userData.position,
          language: userData.language,
          avatar: userData.avatar,
          status: userData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', userData.id);
        
      if (error) throw error;
      
      return { success: true, error: null };
    } catch (err: any) {
      console.error('Update user data error:', err);
      setError(err.message || 'Update user data failed');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    sendPasswordResetEmail,
    refreshSession,
    getSession,
    updateProfile,
    fetchUserData,
    updateUserData,
    loading,
    error,
    setError
  };
};
