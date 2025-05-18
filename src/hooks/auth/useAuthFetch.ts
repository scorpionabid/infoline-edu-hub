
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/user';
import { Session } from '@supabase/supabase-js';
import { fetchUserProfile } from '@/api/userApi';

/**
 * Hook for handling authentication data fetching operations
 */
export const useAuthFetch = () => {
  /**
   * Fetch the current user session
   */
  const getSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }, []);

  /**
   * Fetch user data from Supabase
   */
  const fetchUserData = useCallback(async (userId: string): Promise<FullUserData | null> => {
    if (!userId) return null;
    
    try {
      // Fetch user profile data using the utility function
      const userData = await fetchUserProfile(userId);
      return userData;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }, []);

  /**
   * Handle on auth state change
   */
  const handleAuthStateChange = useCallback(async (session: Session | null) => {
    if (!session) {
      return { session: null, user: null };
    }
    
    const userData = await fetchUserData(session.user.id);
    return { session, user: userData };
  }, [fetchUserData]);

  /**
   * Log in with email and password
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      const userData = await fetchUserData(data.user?.id);
      return { session: data.session, user: userData, error: null };
    } catch (error: any) {
      return { session: null, user: null, error: error.message || 'Failed to log in' };
    }
  }, [fetchUserData]);

  /**
   * Log out
   */
  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Failed to log out' };
    }
  }, []);

  /**
   * Update user data
   */
  const updateUserData = useCallback(async (userId: string, userData: Partial<FullUserData>) => {
    try {
      // Update profile
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: userData.full_name,
          avatar_url: userData.avatar_url,
          phone: userData.phone,
          position: userData.position,
          language: userData.language,
          status: userData.status,
        })
        .eq('id', userId);
      
      if (error) throw error;
      
      // If role is provided, update the user's role
      if (userData.role) {
        // Normalize the role type
        const role = typeof userData.role === 'string' ? userData.role : 'user';
        
        const { error: roleError } = await supabase
          .from('user_roles')
          .upsert({
            user_id: userId,
            role: role as "superadmin" | "regionadmin" | "sectoradmin" | "schooladmin", // Cast to enum type
          });
        
        if (roleError) throw roleError;
      }
      
      // Return the updated user data
      return await fetchUserData(userId);
    } catch (error: any) {
      console.error('Error updating user data:', error);
      return null;
    }
  }, [fetchUserData]);

  return {
    getSession,
    fetchUserData,
    handleAuthStateChange,
    login,
    logout,
    updateUserData,
  };
};
