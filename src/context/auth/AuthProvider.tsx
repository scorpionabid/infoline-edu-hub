
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthContext } from './context';
import { AuthState, FullUserData } from './types';
import { Session } from '@supabase/supabase-js';

// Initial auth state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Define the AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);

  // Auth state change handler
  useEffect(() => {
    console.info('Auth inisializasiya başladı');

    // Set initial loading state
    setState(prevState => ({ ...prevState, isLoading: true }));
    console.info('Auth vəziyyəti dəyişdi:', {
      isAuthenticated: false,
      isLoading: true,
      user: null,
      error: null
    });

    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Sessiya əldə edilərkən xəta:', error);
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message
          });
          return;
        }

        console.info('Mövcud sessiya:', session ? 'Var' : 'Yoxdur');

        if (session) {
          await handleSessionChange(session);
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
          console.info('Auth vəziyyəti dəyişdi:', {
            isAuthenticated: false,
            isLoading: false,
            user: null,
            error: null
          });
        }
      } catch (err: any) {
        console.error('Sessiya yoxlanarkən xəta:', err);
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: err.message
        });
      }
    };

    // Call session check
    checkSession();

    // Listen for auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.info('Auth state dəyişdi:', event, session ? 'Session var' : 'Session yoxdur');
      
      if (session) {
        await handleSessionChange(session);
      } else {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
      }
    });

    // Cleanup on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle session change by fetching full user data
  const handleSessionChange = async (session: Session) => {
    try {
      // Get additional user data
      const { data: userData, error: userError } = await supabase
        .from('user_roles')
        .select(`
          role,
          region_id,
          sector_id,
          school_id,
          profiles!inner(
            id,
            full_name,
            avatar,
            phone,
            position,
            language,
            last_login,
            created_at,
            updated_at,
            status
          )
        `)
        .eq('user_id', session.user.id)
        .single();

      if (userError) {
        console.error('İstifadəçi məlumatları əldə edilərkən xəta:', userError);
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: userError.message
        });
        return;
      }

      if (!userData) {
        console.error('İstifadəçi məlumatları tapılmadı');
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'İstifadəçi məlumatları tapılmadı'
        });
        return;
      }

      const profile = userData.profiles;
      
      // Combine all user data
      const fullUserData: FullUserData = {
        id: session.user.id,
        email: session.user.email || '',
        full_name: profile.full_name,
        role: userData.role,
        region_id: userData.region_id,
        sector_id: userData.sector_id,
        school_id: userData.school_id,
        phone: profile.phone,
        position: profile.position,
        language: profile.language || 'az',
        avatar: profile.avatar,
        status: profile.status || 'active',
        last_login: profile.last_login,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        
        // JavaScript/React tərəfində istifadə üçün CamelCase əlavə edir
        name: profile.full_name,
        regionId: userData.region_id,
        sectorId: userData.sector_id,
        schoolId: userData.school_id,
        lastLogin: profile.last_login,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at
      };

      // Update last login time
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', session.user.id);

      // Update authenticated state
      setState({
        user: fullUserData,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
      console.info('İstifadəçi məlumatları yükləndi:', {
        id: fullUserData.id,
        email: fullUserData.email,
        role: fullUserData.role,
        name: fullUserData.name
      });
    } catch (err: any) {
      console.error('İstifadəçi məlumatları əldə edilərkən xəta:', err);
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: err.message
      });
    }
  };

  // Login function
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setState(prevState => ({ ...prevState, isLoading: true, error: null }));
      console.info('Giriş cəhdi:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Giriş xətası:', error);
        setState(prevState => ({ 
          ...prevState, 
          isLoading: false, 
          error: error.message 
        }));
        return false;
      }

      // No need to set state here as it will be handled by the auth state change listener
      console.info('Giriş uğurlu:', data.user?.email);
      return true;
    } catch (err: any) {
      console.error('Giriş zamanı istisna:', err);
      setState(prevState => ({ 
        ...prevState, 
        isLoading: false, 
        error: err.message 
      }));
      return false;
    }
  }, []);

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    try {
      setState(prevState => ({ ...prevState, isLoading: true }));
      console.info('Çıxış cəhdi');
      
      await supabase.auth.signOut();
      
      // No need to set state here as it will be handled by the auth state change listener
      console.info('Çıxış uğurlu');
    } catch (err: any) {
      console.error('Çıxış zamanı xəta:', err);
      setState(prevState => ({ 
        ...prevState, 
        isLoading: false, 
        error: err.message 
      }));
    }
  }, []);

  // Update user info
  const updateUser = useCallback(async (userData: Partial<FullUserData>): Promise<boolean> => {
    try {
      setState(prevState => ({ ...prevState, isLoading: true, error: null }));
      
      if (!state.user) {
        setState(prevState => ({ 
          ...prevState, 
          isLoading: false, 
          error: 'İstifadəçi hesabı tapılmadı' 
        }));
        return false;
      }

      // Get actual updateable fields for the profile
      const profileUpdates: any = {};
      
      if (userData.full_name !== undefined) profileUpdates.full_name = userData.full_name;
      if (userData.avatar !== undefined) profileUpdates.avatar = userData.avatar;
      if (userData.phone !== undefined) profileUpdates.phone = userData.phone;
      if (userData.position !== undefined) profileUpdates.position = userData.position;
      if (userData.language !== undefined) profileUpdates.language = userData.language;
      if (userData.status !== undefined) profileUpdates.status = userData.status;

      if (Object.keys(profileUpdates).length > 0) {
        profileUpdates.updated_at = new Date().toISOString();
        
        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', state.user.id);
        
        if (profileError) {
          console.error('Profil yenilərkən xəta:', profileError);
          setState(prevState => ({ 
            ...prevState, 
            isLoading: false, 
            error: profileError.message 
          }));
          return false;
        }
      }

      // Update auth email if it's changing
      if (userData.email && userData.email !== state.user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: userData.email
        });
        
        if (emailError) {
          console.error('Email yenilərkən xəta:', emailError);
          setState(prevState => ({ 
            ...prevState, 
            isLoading: false, 
            error: emailError.message 
          }));
          return false;
        }
      }

      // Update user state
      setState(prevState => ({ 
        ...prevState,
        user: prevState.user ? { ...prevState.user, ...userData } : null,
        isLoading: false,
        error: null
      }));
      
      return true;
    } catch (err: any) {
      console.error('İstifadəçi məlumatları yenilərkən xəta:', err);
      setState(prevState => ({ 
        ...prevState, 
        isLoading: false, 
        error: err.message 
      }));
      return false;
    }
  }, [state.user]);

  // Clear error function
  const clearError = useCallback(() => {
    setState(prevState => ({ ...prevState, error: null }));
  }, []);

  // Context value
  const contextValue = {
    ...state,
    login,
    logout,
    updateUser,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
