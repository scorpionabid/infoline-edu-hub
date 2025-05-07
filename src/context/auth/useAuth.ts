
import { useState, useEffect } from 'react';
import { AuthContextType, FullUserData } from '@/types/user';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<FullUserData | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if the user is already authenticated
    const checkAuth = async () => {
      setLoading(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (session) {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userError) {
            console.error('Error fetching user profile:', userError);
          }

          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (roleError) {
            console.error('Error fetching user role:', roleError);
          }

          // Set the authenticated user with profile data
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            full_name: userData?.full_name || '',
            role: roleData?.role || 'user',
            region_id: roleData?.region_id,
            sector_id: roleData?.sector_id,
            school_id: roleData?.school_id,
            regionId: roleData?.region_id,
            sectorId: roleData?.sector_id,
            schoolId: roleData?.school_id,
            phone: userData?.phone,
            position: userData?.position,
            language: userData?.language || 'az',
            status: userData?.status || 'active',
            avatar: userData?.avatar,
            last_login: userData?.last_login,
            created_at: userData?.created_at,
            updated_at: userData?.updated_at,
            notificationSettings: userData?.notification_settings
          });
          setAuthenticated(true);
        }
      } catch (err: any) {
        console.error('Auth check error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userError) {
            console.error('Error fetching user profile:', userError);
          }

          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (roleError) {
            console.error('Error fetching user role:', roleError);
          }

          // Set the authenticated user with profile data
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            full_name: userData?.full_name || '',
            role: roleData?.role || 'user',
            region_id: roleData?.region_id,
            sector_id: roleData?.sector_id,
            school_id: roleData?.school_id,
            regionId: roleData?.region_id,
            sectorId: roleData?.sector_id,
            schoolId: roleData?.school_id,
            phone: userData?.phone,
            position: userData?.position,
            language: userData?.language || 'az',
            status: userData?.status || 'active',
            avatar: userData?.avatar,
            last_login: userData?.last_login,
            created_at: userData?.created_at,
            updated_at: userData?.updated_at,
            notificationSettings: userData?.notification_settings
          });
          setAuthenticated(true);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setAuthenticated(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login function
  const logIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
      
      return { data, error: null };
    } catch (err: any) {
      setError(err.message);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setAuthenticated(false);
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData: any) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
            role: userData.role || 'user'
          }
        }
      });

      if (error) throw error;
      
      return { success: true, data, error: null };
    } catch (err: any) {
      setError(err.message);
      return { success: false, data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUser = async (userData: Partial<FullUserData>) => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Update profile in the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: userData.full_name,
          phone: userData.phone,
          position: userData.position,
          avatar: userData.avatar,
          language: userData.language,
          notification_settings: userData.notificationSettings
        })
        .eq('id', user.id);

      if (profileError) throw profileError;
      
      // Update user object in state
      setUser(prevUser => {
        if (!prevUser) return null;
        return { ...prevUser, ...userData };
      });
    } catch (err: any) {
      console.error('Update user error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      toast.success('Şifrə sıfırlama linki göndərildi', {
        description: 'E-poçt adresinizə şifrə sıfırlama linki göndərildi.'
      });
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message);
      toast.error('Xəta', {
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    authenticated,
    loading,
    error,
    logIn,
    logOut,
    register,
    updateUser,
    updateUserProfile: updateUser,
    resetPassword,
    setError
  };
};

export default useAuth;
