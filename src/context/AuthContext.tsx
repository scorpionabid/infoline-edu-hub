
import React, { createContext, useContext, useReducer, useEffect, ReactNode, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData, UserRole } from '@/types/supabase';
import { AuthState } from '@/hooks/auth/types';
import { fetchUserData } from '@/hooks/auth/userDataService';

export type Role = UserRole;

type AuthContextType = {
  user: FullUserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ user: FullUserData | null; error: Error | null }>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
  updateProfile: (data: Partial<FullUserData>) => Promise<{ profile: FullUserData | null; error: Error | null }>;
  isRole: (roles: UserRole[]) => boolean;
  useRole: (role: UserRole | UserRole[], fallback?: JSX.Element | null) => boolean | JSX.Element | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction = 
  | { type: 'SET_USER'; payload: FullUserData | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error | null };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

const initialState: AuthState = {
  user: null,
  loading: true,
  error: null,
  session: null,
  profile: null
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [currentUser, setCurrentUser] = useState<FullUserData | null>(null);
  
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        // Get the current user and session
        const { data: { user } } = await supabase.auth.getUser();
        const { data: { session } } = await supabase.auth.getSession();
        
        // If we have a user, fetch their profile data
        if (user) {
          const userData = await fetchUserData(user.id);
          
          if (userData) {
            setCurrentUser(userData);
            dispatch({ type: 'SET_USER', payload: userData });
          } else {
            dispatch({ type: 'SET_USER', payload: null });
          }
        } else {
          dispatch({ type: 'SET_USER', payload: null });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch({ type: 'SET_ERROR', payload: error as Error });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    initializeAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.info('Auth state changed:', event);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          const userData = await fetchUserData(session.user.id);
          setCurrentUser(userData);
          dispatch({ type: 'SET_USER', payload: userData });
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        dispatch({ type: 'SET_USER', payload: null });
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      const userData = data.user ? await fetchUserData(data.user.id) : null;
      
      if (userData) {
        setCurrentUser(userData);
        dispatch({ type: 'SET_USER', payload: userData });
        return { user: userData, error: null };
      }
      
      return { user: null, error: new Error('User data could not be fetched') };
    } catch (error) {
      console.error('Login error:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      return { user: null, error: error as Error };
    }
  };
  
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      dispatch({ type: 'SET_USER', payload: null });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const sendPasswordReset = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      return false;
    }
  };
  
  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Update password error:', error);
      return false;
    }
  };
  
  const updateProfile = async (profileData: Partial<FullUserData>) => {
    try {
      if (!currentUser) {
        throw new Error('No user is currently logged in');
      }
      
      // Update profile in the profiles table
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name || currentUser.full_name,
          phone: profileData.phone || currentUser.phone,
          position: profileData.position || currentUser.position,
          language: profileData.language || currentUser.language,
          avatar: profileData.avatar || currentUser.avatar,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentUser.id)
        .select();
      
      if (error) {
        throw error;
      }
      
      // If email is provided, update the auth user as well
      if (profileData.email && profileData.email !== currentUser.email) {
        const { error: updateAuthError } = await supabase.auth.updateUser({
          email: profileData.email
        });
        
        if (updateAuthError) {
          throw updateAuthError;
        }
      }
      
      // Fetch updated user data
      const updatedUserData = await fetchUserData(currentUser.id);
      
      if (updatedUserData) {
        setCurrentUser(updatedUserData);
        dispatch({ type: 'SET_USER', payload: updatedUserData });
      }
      
      return { profile: updatedUserData, error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { profile: null, error: error as Error };
    }
  };
  
  const isRole = (roles: UserRole[]) => {
    if (!currentUser) return false;
    return roles.includes(currentUser.role);
  };
  
  const useRole = (role: UserRole | UserRole[], fallback: JSX.Element | null = null) => {
    const roles = Array.isArray(role) ? role : [role];
    
    if (state.loading) return fallback;
    if (!currentUser) return fallback;
    
    const hasPermission = roles.includes(currentUser.role);
    return hasPermission ? true : fallback;
  };
  
  const value = {
    user: currentUser,
    loading: state.loading,
    login,
    logout,
    sendPasswordReset,
    updatePassword,
    updateProfile,
    isRole,
    useRole,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
