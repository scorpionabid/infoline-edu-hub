import React, { createContext, useContext, useReducer, useEffect, ReactNode, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData, UserRole } from '@/types/supabase';
import { AuthState } from '@/hooks/auth/types';
import { getUserData } from '@/hooks/auth/userDataService';

export type Role = UserRole;

type AuthContextType = {
  user: FullUserData | null;
  loading: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  session: any | null; // Supabase sessiyası
  login: (email: string, password: string) => Promise<{ user: FullUserData | null; error: Error | null }>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
  updateProfile: (data: Partial<FullUserData>) => Promise<{ profile: FullUserData | null; error: Error | null }>;
  isRole: (roles: UserRole[]) => boolean;
  useRole: (role: UserRole | UserRole[], fallback?: JSX.Element | null) => boolean | JSX.Element | null;
  confirmPasswordReset: (newPassword: string) => Promise<boolean>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction = 
  | { type: 'SET_USER'; payload: FullUserData | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error | null }
  | { type: 'CLEAR_ERROR' };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
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
  const [isLoading, setIsLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      setIsLoading(true);
      
      try {
        console.log('Auth başlatılır...');
        const { data: { user } } = await supabase.auth.getUser();
        const { data: { session } } = await supabase.auth.getSession();
        setSessionData(session);
        console.log('Auth məlumatları alındı, istifadəçi:', user ? 'mövcuddur' : 'yoxdur');
        
        if (user) {
          try {
            const userData = await getUserData(user.id);
            console.log('İstifadəçi məlumatları alındı:', userData ? 'uğurlu' : 'xəta');
            
            if (userData) {
              setCurrentUser(userData);
              dispatch({ type: 'SET_USER', payload: userData });
            } else {
              console.error('İstifadəçi məlumatları tapılmadı!');
              setCurrentUser(null);
              dispatch({ type: 'SET_USER', payload: null });
            }
          } catch (userError) {
            console.error('İstifadəçi məlumatlarını alarkən xəta:', userError);
            setCurrentUser(null);
            dispatch({ type: 'SET_USER', payload: null });
          }
        } else {
          console.log('İstifadəçi tapılmadı');
          setCurrentUser(null);
          dispatch({ type: 'SET_USER', payload: null });
        }
      } catch (error) {
        console.error('Auth inicializasiyası xətası:', error);
        setError(error as Error);
        dispatch({ type: 'SET_ERROR', payload: error as Error });
      } finally {
        console.log('Auth yüklənməsi tamamlandı');
        setIsLoading(false);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    initializeAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.info('Auth vəziyyəti dəyişdi:', event);
      setSessionData(session);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          try {
            const userData = await getUserData(session.user.id);
            if (userData) {
              setCurrentUser(userData);
              dispatch({ type: 'SET_USER', payload: userData });
            } else {
              console.error('İstifadəçi məlumatları tapılmadı (onAuthStateChange)');
            }
          } catch (userError) {
            console.error('İstifadəçi məlumatlarını alarkən xəta (onAuthStateChange):', userError);
          }
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
      setIsLoading(true);
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        setError(error);
        throw error;
      }
      
      const userData = data.user ? await getUserData(data.user.id) : null;
      
      if (userData) {
        setCurrentUser(userData);
        dispatch({ type: 'SET_USER', payload: userData });
        return { user: userData, error: null };
      }
      
      return { user: null, error: new Error('User data could not be fetched') };
    } catch (error) {
      console.error('Login error:', error);
      setError(error as Error);
      dispatch({ type: 'SET_ERROR', payload: error as Error });
      return { user: null, error: error as Error };
    } finally {
      setIsLoading(false);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      setSessionData(null);
      dispatch({ type: 'SET_USER', payload: null });
    } catch (error) {
      console.error('Logout error:', error);
      setError(error as Error);
    }
  };
  
  const sendPasswordReset = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        setError(error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      setError(error as Error);
      return false;
    }
  };
  
  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        setError(error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Update password error:', error);
      setError(error as Error);
      return false;
    }
  };
  
  const confirmPasswordReset = async (newPassword: string) => {
    return updatePassword(newPassword);
  };
  
  const clearError = () => {
    setError(null);
    dispatch({ type: 'CLEAR_ERROR' });
  };
  
  const updateProfile = async (profileData: Partial<FullUserData>) => {
    try {
      if (!currentUser) {
        throw new Error('No user is currently logged in');
      }
      
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
        setError(error);
        throw error;
      }
      
      if (profileData.email && profileData.email !== currentUser.email) {
        const { error: updateAuthError } = await supabase.auth.updateUser({
          email: profileData.email
        });
        
        if (updateAuthError) {
          setError(updateAuthError);
          throw updateAuthError;
        }
      }
      
      const updatedUserData = await getUserData(currentUser.id);
      
      if (updatedUserData) {
        setCurrentUser(updatedUserData);
        dispatch({ type: 'SET_USER', payload: updatedUserData });
      }
      
      return { profile: updatedUserData, error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      setError(error as Error);
      return { profile: null, error: error as Error };
    }
  };
  
  const isRole = (roles: UserRole[]) => {
    if (!currentUser) return false;
    return roles.includes(currentUser.role);
  };
  
  const useRole = (role: UserRole | UserRole[], fallback: JSX.Element | null = null) => {
    const roles = Array.isArray(role) ? role : [role];
    
    if (isLoading) return fallback;
    if (!currentUser) return fallback;
    
    const hasPermission = roles.includes(currentUser.role);
    return hasPermission ? true : fallback;
  };
  
  const value = {
    user: currentUser,
    loading: isLoading,
    isLoading,
    isAuthenticated: !!currentUser,
    login,
    logout,
    sendPasswordReset,
    updatePassword,
    updateProfile,
    isRole,
    useRole,
    error,
    session: sessionData,
    confirmPasswordReset,
    clearError,
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

export const useRole = (
  role: UserRole | UserRole[], 
  fallback: JSX.Element | null = null
): boolean | JSX.Element | null => {
  const { user, loading } = useAuth();
  
  const roles = Array.isArray(role) ? role : [role];
  
  if (loading) return fallback;
  if (!user) return fallback;
  
  const hasPermission = roles.includes(user.role);
  return hasPermission ? true : fallback;
};
