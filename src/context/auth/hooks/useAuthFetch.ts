import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, AuthErrorType, AuthState } from '../types';
import { FullUserData } from '@/types/supabase';

const useAuthFetch = (): AuthContextType => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [cookies, setCookie, removeCookie] = useCookies(['sb-access-token', 'sb-refresh-token']);
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const setAuth = useCallback(
    (
      user: FullUserData | null,
      session: any | null,
      isAuthenticated: boolean,
      isLoading: boolean,
      error: AuthErrorType
    ) => {
      setState({ user, session, isAuthenticated, isLoading, error });
    },
    []
  );

  const clearError = useCallback(() => {
    setState((prevState) => ({ ...prevState, error: null }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prevState) => ({ ...prevState, error: error }));
  }, []);

  const handleSession = useCallback(
    async (session: any | null) => {
      if (session) {
        setCookie('sb-access-token', session.access_token, { path: '/', sameSite: 'strict' });
        setCookie('sb-refresh-token', session.refresh_token, { path: '/', sameSite: 'strict' });
        supabase.auth.setSession(session);
      } else {
        removeCookie('sb-access-token', { path: '/', sameSite: 'strict' });
        removeCookie('sb-refresh-token', { path: '/', sameSite: 'strict' });
        supabase.auth.setSession({ access_token: null, refresh_token: null });
      }
    },
    [setCookie, removeCookie]
  );

  const getProfileData = useCallback(async (userId: string): Promise<FullUserData | null> => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return null;
      }

      return profile as FullUserData;
    } catch (error: any) {
      console.error('Unexpected error fetching profile:', error);
      return null;
    }
  }, []);

  const getFullUserData = useCallback(async (userId: string): Promise<FullUserData | null> => {
    try {
      const { data, error } = await supabase.rpc('get_full_user_data', { user_id_param: userId });

      if (error) {
        console.error('Error fetching user data:', error);
        return null;
      }

      if (!data || data.length === 0) {
        console.warn('No user data found for ID:', userId);
        return null;
      }

      return data[0] as FullUserData;
    } catch (error: any) {
      console.error('Unexpected error fetching full user data:', error);
      return null;
    }
  }, []);

  const formatUserData = (userData: any, session: any): FullUserData => {
    return {
      id: userData.id,
      email: userData.email || session?.user?.email || '',
      full_name: userData.full_name || userData.user_metadata?.full_name || '',
      fullName: userData.full_name || userData.user_metadata?.full_name || '',
      name: userData.full_name || userData.user_metadata?.full_name || '', // Support name property
      avatar: userData.avatar || '',
      role: userData.role,
      region_id: userData.region_id,
      regionId: userData.region_id,
      sector_id: userData.sector_id,
      sectorId: userData.sector_id,
      school_id: userData.school_id,
      schoolId: userData.school_id,
      phone: userData.phone,
      position: userData.position,
      language: userData.language,
      status: userData.status,
      last_login: userData.last_login,
      lastLogin: userData.last_login,
      created_at: userData.created_at,
      createdAt: userData.created_at,
      updated_at: userData.updated_at,
      updatedAt: userData.updated_at,
      notificationSettings: userData.notification_settings
    } as FullUserData;
  };

  const refreshProfile = useCallback(async (): Promise<FullUserData | null> => {
    const user = supabase.auth.getUser();
    if (!user?.data?.user?.id) {
      console.warn('No user ID found, cannot refresh profile.');
      return null;
    }

    try {
      const userId = user.data.user.id;
      const profileData = await getFullUserData(userId);

      if (profileData) {
        setState(prevState => ({
          ...prevState,
          user: profileData,
          isAuthenticated: true,
          isLoading: false,
          error: null
        }));
        return profileData;
      } else {
        console.warn('Profile data not found, user might not have a profile.');
        setState(prevState => ({
          ...prevState,
          isAuthenticated: false,
          isLoading: false,
          error: 'Profile not found'
        }));
        return null;
      }
    } catch (error: any) {
      console.error('Error refreshing profile:', error);
      setState(prevState => ({
        ...prevState,
        isAuthenticated: false,
        isLoading: false,
        error: error.message || 'Failed to refresh profile'
      }));
      return null;
    }
  }, [getFullUserData]);

  const refreshSession = useCallback(async () => {
    try {
      setAuth(null, null, false, true, null);

      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error refreshing session:', error);
        setAuth(null, null, false, false, error.message);
        return;
      }

      if (session) {
        await handleSession(session);
        const userId = session.user.id;
        const profileData = await getFullUserData(userId);

        if (profileData) {
          setAuth(profileData, session, true, false, null);
        } else {
          setAuth(null, null, false, false, 'Profile data not found');
        }
      } else {
        setAuth(null, null, false, false, 'No active session found');
      }
    } catch (error: any) {
      console.error('Unexpected error refreshing session:', error);
      setAuth(null, null, false, false, error.message || 'Unexpected error');
    }
  }, [setAuth, handleSession, getFullUserData]);

  const logIn = useCallback(async (email: string, password: string) => {
    try {
      setState((prevState) => ({ ...prevState, isLoading: true, error: null }));
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        console.error('Login error:', error);
        setState((prevState) => ({ ...prevState, isLoading: false, error: error.message }));
        return { data: null, error: error.message };
      }

      await handleSession(data.session);
      const userId = data.session.user.id;
      const profileData = await getFullUserData(userId);

      if (profileData) {
        setState((prevState) => ({
          ...prevState,
          user: profileData,
          session: data.session,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }));
      } else {
        setState((prevState) => ({ ...prevState, isLoading: false, error: 'Profile data not found' }));
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Login failed:', error);
      setState((prevState) => ({ ...prevState, isLoading: false, error: error.message }));
      return { data: null, error: error.message };
    }
  }, [handleSession, getFullUserData]);

  const logOut = useCallback(async () => {
    try {
      setState((prevState) => ({ ...prevState, isLoading: true, error: null }));
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Logout error:', error);
        setState((prevState) => ({ ...prevState, isLoading: false, error: error.message }));
      } else {
        await handleSession(null);
        setState({
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error: any) {
      console.error('Logout failed:', error);
      setState((prevState) => ({ ...prevState, isLoading: false, error: error.message }));
    }
  }, [handleSession]);

  const updateUser = useCallback(async (updates: Partial<FullUserData>): Promise<boolean | void> => {
    if (!state.user) {
      console.error('No user to update.');
      return false;
    }

    try {
      setState((prevState) => ({ ...prevState, isLoading: true, error: null }));

      // First, update the 'profiles' table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: updates.full_name || state.user.full_name,
          avatar: updates.avatar || state.user.avatar,
          phone: updates.phone || state.user.phone,
          position: updates.position || state.user.position,
          language: updates.language || state.user.language,
          status: updates.status || state.user.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', state.user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        setState((prevState) => ({ ...prevState, isLoading: false, error: profileError.message }));
        return false;
      }

      // Construct the updated user object
      const updatedUser: FullUserData = {
        ...state.user,
        ...updates,
        full_name: updates.full_name || state.user.full_name,
        avatar: updates.avatar || state.user.avatar,
        phone: updates.phone || state.user.phone,
        position: updates.position || state.user.position,
        language: updates.language || state.user.language,
        status: updates.status || state.user.status,
      };

      // Update the state with the new user data
      setState((prevState) => ({
        ...prevState,
        user: updatedUser,
        isLoading: false,
        error: null,
      }));

      return true;
    } catch (error: any) {
      console.error('Error during user update:', error);
      setState((prevState) => ({ ...prevState, isLoading: false, error: error.message }));
      return false;
    }
  }, [state.user]);

  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      setState((prevState) => ({ ...prevState, isLoading: true, error: null }));
      const { data, error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        console.error('Password update error:', error);
        setState((prevState) => ({ ...prevState, isLoading: false, error: error.message }));
        return { data: null, error: error.message };
      }

      setState((prevState) => ({ ...prevState, isLoading: false, error: null }));
      return { data, error: null };
    } catch (error: any) {
      console.error('Password update failed:', error);
      setState((prevState) => ({ ...prevState, isLoading: false, error: error.message }));
      return { data: null, error: error.message };
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<FullUserData>) => {
    try {
      setState((prevState) => ({ ...prevState, isLoading: true, error: null }));
      const { data: authData, error: authError } = await supabase.auth.updateUser(data);

      if (authError) {
        console.error('Auth update error:', authError);
        setState((prevState) => ({ ...prevState, isLoading: false, error: authError.message }));
        return { data: null, error: authError.message };
      }

      // Also update the 'profiles' table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          avatar: data.avatar,
          phone: data.phone,
          position: data.position,
          language: data.language,
          status: data.status
        })
        .eq('id', state.user?.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        setState((prevState) => ({ ...prevState, isLoading: false, error: profileError.message }));
        return { data: null, error: profileError.message };
      }

      // Refresh the profile data
      await refreshProfile();

      setState((prevState) => ({ ...prevState, isLoading: false, error: null }));
      return { data: authData, error: null };
    } catch (error: any) {
      console.error('Profile update failed:', error);
      setState((prevState) => ({ ...prevState, isLoading: false, error: error.message }));
      return { data: null, error: error.message };
    }
  }, [state.user, refreshProfile]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      setState((prevState) => ({ ...prevState, isLoading: true, error: null }));
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        console.error('Reset password error:', error);
        setState((prevState) => ({ ...prevState, isLoading: false, error: error.message }));
        return { data: null, error: error.message };
      }

      setState((prevState) => ({ ...prevState, isLoading: false, error: null }));
      return { data, error: null };
    } catch (error: any) {
      console.error('Reset password failed:', error);
      setState((prevState) => ({ ...prevState, isLoading: false, error: error.message }));
      return { data: null, error: error.message };
    }
  }, []);

  const register = useCallback(async (userData: any) => {
    try {
      setState((prevState) => ({ ...prevState, isLoading: true, error: null }));
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name,
            role: userData.role,
            region_id: userData.region_id,
            sector_id: userData.sector_id,
            school_id: userData.school_id,
            phone: userData.phone,
            position: userData.position,
            language: userData.language,
            avatar: userData.avatar,
            status: userData.status
          },
        },
      });

      if (error) {
        console.error('Registration error:', error);
        setState((prevState) => ({ ...prevState, isLoading: false, error: error.message }));
        return { data: null, error: error.message };
      }

      setState((prevState) => ({ ...prevState, isLoading: false, error: null }));
      return { data, error: null };
    } catch (error: any) {
      console.error('Registration failed:', error);
      setState((prevState) => ({ ...prevState, isLoading: false, error: error.message }));
      return { data: null, error: error.message };
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      setState((prevState) => ({ ...prevState, isLoading: true }));

      const accessToken = cookies['sb-access-token'];
      const refreshToken = cookies['sb-refresh-token'];

      if (accessToken && refreshToken) {
        await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      }

      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Session check error:', error);
        setAuth(null, null, false, false, error.message);
      }

      if (session) {
        const userId = session.user.id;
        const profileData = await getFullUserData(userId);

        if (profileData) {
          setAuth(profileData, session, true, false, null);
        } else {
          setAuth(null, null, false, false, 'Profile data not found');
        }
      } else {
        setAuth(null, null, false, false, 'No active session found');
      }

      setState((prevState) => ({ ...prevState, isLoading: false }));
    };

    checkAuth();

    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change event:', event);

      if (session) {
        await handleSession(session);
        const userId = session.user.id;
        const profileData = await getFullUserData(userId);

        if (profileData) {
          setAuth(profileData, session, true, false, null);
        } else {
          setAuth(null, null, false, false, 'Profile data not found');
        }
      } else {
        await handleSession(null);
        setAuth(null, null, false, false, 'No active session found');
      }
    });
  }, [setAuth, handleSession, cookies, getFullUserData]);

  return {
    ...state,
    logIn,
    logOut,
    signOut: logOut,
    logout: logOut,
    updateUser,
    clearError,
    refreshProfile,
    refreshSession,
    updatePassword,
    updateProfile,
    resetPassword,
    register,
    setError
  };
};

export default useAuthFetch;
