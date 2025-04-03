import React, { createContext, useContext, useReducer, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData, UserRole } from '@/types/supabase';

interface AuthState {
  user: FullUserData | null;
  loading: boolean;
  error: Error | null;
  session: any | null;
  profile: any | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ error: any | null }>;
  signup: (email: string, password: string, userData: Partial<FullUserData>) => Promise<{ error: any | null }>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<FullUserData>) => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any | null }>;
  updatePassword: (password: string) => Promise<{ error: any | null }>;
  clearError: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentUser: FullUserData | null;
  sessionData: any | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'LOGIN'; payload: FullUserData }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: FullUserData | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_SESSION'; payload: any | null };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload, loading: false, error: null };
    case 'LOGOUT':
      return { ...state, user: null, loading: false, error: null, session: null };
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_SESSION':
      return { ...state, session: action.payload };
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
  
  // İstifadəçi məlumatlarını əldə etmək üçün funksiya
  const getUserData = async (userId: string): Promise<FullUserData | null> => {
    try {
      // Əvvəlcə profiles cədvəlindən məlumatları əldə et
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.error('Profil məlumatları alınarkən xəta:', profileError);
        throw profileError;
      }
      
      if (!profileData) {
        console.warn('İstifadəçi profili tapılmadı');
        return null;
      }
      
      // Sonra users cədvəlindən əlavə məlumatları əldə et
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (userError) {
        console.error('İstifadəçi məlumatları alınarkən xəta:', userError);
        throw userError;
      }
      
      // Bütün məlumatları birləşdir
      const fullUserData: FullUserData = {
        id: userId,
        email: userData?.email || '',
        role: userData?.role || 'user',
        full_name: profileData?.full_name || '',
        phone: profileData?.phone || '',
        position: profileData?.position || '',
        language: profileData?.language || 'az',
        avatar: profileData?.avatar || '',
        created_at: profileData?.created_at || new Date().toISOString(),
        updated_at: profileData?.updated_at || new Date().toISOString(),
      };
      
      return fullUserData;
    } catch (error) {
      console.error('İstifadəçi məlumatları alınarkən xəta:', error);
      throw error;
    }
  };
  
  useEffect(() => {
    const initializeAuth = async () => {
      // Timeout əlavə et
      const authTimeout = setTimeout(() => {
        if (isLoading) {
          console.warn('Auth yüklənməsi timeout-a uğradı - 10 saniyə keçdi');
          setIsLoading(false);
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }, 10000); // 10 saniyə
      
      dispatch({ type: 'SET_LOADING', payload: true });
      setIsLoading(true);
      
      try {
        console.log('Auth başlatılır...');
        
        // Əvvəlcə mövcud sessionu yoxla
        const sessionResponse = await supabase.auth.getSession();
        const session = sessionResponse.data?.session;
        const sessionError = sessionResponse.error;
        
        // Session xəta yoxlaması
        if (sessionError) {
          console.error('Session alınarkən xəta:', sessionError);
          throw sessionError;
        }
        
        setSessionData(session);
        dispatch({ type: 'SET_SESSION', payload: session });
        
        // İstifadəçi məlumatlarını əldə et
        if (session?.user) {
          console.log('Aktiv sessiya tapıldı, istifadəçi məlumatları alınır...');
          try {
            const userData = await getUserData(session.user.id);
            
            if (userData) {
              console.log('İstifadəçi məlumatları uğurla alındı:', userData.role);
              setCurrentUser(userData);
              dispatch({ type: 'SET_USER', payload: userData });
            } else {
              console.warn('İstifadəçi məlumatları tapılmadı!');
              setCurrentUser(null);
              dispatch({ type: 'SET_USER', payload: null });
            }
          } catch (userError) {
            console.error('İstifadəçi məlumatlarını alarkən xəta:', userError);
            setCurrentUser(null);
            dispatch({ type: 'SET_USER', payload: null });
          }
        } else {
          console.log('Aktiv sessiya tapılmadı');
          setCurrentUser(null);
          dispatch({ type: 'SET_USER', payload: null });
        }
      } catch (error) {
        console.error('Auth inicializasiya xətası:', error);
        setError(error as Error);
        dispatch({ type: 'SET_ERROR', payload: error as Error });
        // Xəta halında istifadəçi və sessiya məlumatlarını təmizlə
        setCurrentUser(null);
        dispatch({ type: 'SET_USER', payload: null });
      } finally {
        // Timeout-u təmizlə
        clearTimeout(authTimeout);
        console.log('Auth yüklənməsi tamamlandı');
        setIsLoading(false);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    // Auth inicializasiyasını başlat
    initializeAuth().catch(error => {
      console.error('Auth inicializasiya prosesində gözlənilməz xəta:', error);
      setIsLoading(false);
      dispatch({ type: 'SET_LOADING', payload: false });
    });
    
    // Auth vəziyyəti dəyişikliklərini izlə
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.info('Auth vəziyyəti dəyişdi:', event);
      setSessionData(session);
      dispatch({ type: 'SET_SESSION', payload: session });
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          try {
            const userData = await getUserData(session.user.id);
            if (userData) {
              console.log('Auth vəziyyəti dəyişdi: İstifadəçi məlumatları alındı');
              setCurrentUser(userData);
              dispatch({ type: 'SET_USER', payload: userData });
            } else {
              console.error('İstifadəçi məlumatları tapılmadı (onAuthStateChange)');
              setCurrentUser(null);
              dispatch({ type: 'SET_USER', payload: null });
            }
          } catch (userError) {
            console.error('Auth vəziyyəti dəyişdikdə istifadəçi məlumatları alınarkən xəta:', userError);
            setCurrentUser(null);
            dispatch({ type: 'SET_USER', payload: null });
          }
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('İstifadəçi çıxış etdi');
        setCurrentUser(null);
        dispatch({ type: 'LOGOUT' });
      }
    });
    
    // Təmizləmə funksiyası
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const login = async (email: string, password: string) => {
    try {
      console.log('Login prosesi başladı');
      setIsLoading(true);
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('Supabase cavabı:', data, error);
      
      if (error) {
        setError(error);
        dispatch({ type: 'SET_ERROR', payload: error });
        return { error };
      }
      
      // Login uğurlu olduqda, onAuthStateChange hadisəsi avtomatik işləyəcək
      // və istifadəçi məlumatlarını yükləyəcək
      
      return { error: null };
    } catch (error) {
      setError(error as Error);
      dispatch({ type: 'SET_ERROR', payload: error as Error });
      return { error };
    } finally {
      setIsLoading(false);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const signup = async (email: string, password: string, userData: Partial<FullUserData>) => {
    try {
      setIsLoading(true);
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Əvvəlcə auth ilə qeydiyyatdan keç
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) {
        setError(error);
        dispatch({ type: 'SET_ERROR', payload: error });
        return { error };
      }
      
      if (data.user) {
        // Sonra profiles cədvəlinə məlumatları əlavə et
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              full_name: userData.full_name || '',
              phone: userData.phone || '',
              position: userData.position || '',
              language: userData.language || 'az',
              avatar: userData.avatar || '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);
        
        if (profileError) {
          setError(profileError);
          dispatch({ type: 'SET_ERROR', payload: profileError });
          return { error: profileError };
        }
        
        // Sonra users cədvəlinə məlumatları əlavə et
        const { error: userError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: email,
              role: userData.role || 'user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);
        
        if (userError) {
          setError(userError);
          dispatch({ type: 'SET_ERROR', payload: userError });
          return { error: userError };
        }
      }
      
      return { error: null };
    } catch (error) {
      setError(error as Error);
      dispatch({ type: 'SET_ERROR', payload: error as Error });
      return { error };
    } finally {
      setIsLoading(false);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const logout = async () => {
    try {
      setIsLoading(true);
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        setError(error);
        dispatch({ type: 'SET_ERROR', payload: error });
      } else {
        setCurrentUser(null);
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      setError(error as Error);
      dispatch({ type: 'SET_ERROR', payload: error as Error });
    } finally {
      setIsLoading(false);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
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
        
        const { error: updateUserError } = await supabase
          .from('users')
          .update({
            email: profileData.email,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentUser.id);
        
        if (updateUserError) {
          setError(updateUserError);
          throw updateUserError;
        }
      }
      
      if (profileData.role && profileData.role !== currentUser.role) {
        const { error: updateRoleError } = await supabase
          .from('users')
          .update({
            role: profileData.role,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentUser.id);
        
        if (updateRoleError) {
          setError(updateRoleError);
          throw updateRoleError;
        }
      }
      
      // Yenilənmiş istifadəçi məlumatlarını əldə et
      const updatedUser = await getUserData(currentUser.id);
      
      if (updatedUser) {
        setCurrentUser(updatedUser);
        dispatch({ type: 'SET_USER', payload: updatedUser });
      }
    } catch (error) {
      setError(error as Error);
      dispatch({ type: 'SET_ERROR', payload: error as Error });
      throw error;
    }
  };
  
  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        setError(error);
        dispatch({ type: 'SET_ERROR', payload: error });
        return { error };
      }
      
      return { error: null };
    } catch (error) {
      setError(error as Error);
      dispatch({ type: 'SET_ERROR', payload: error as Error });
      return { error };
    } finally {
      setIsLoading(false);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const updatePassword = async (password: string) => {
    try {
      setIsLoading(true);
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const { error } = await supabase.auth.updateUser({
        password
      });
      
      if (error) {
        setError(error);
        dispatch({ type: 'SET_ERROR', payload: error });
        return { error };
      }
      
      return { error: null };
    } catch (error) {
      setError(error as Error);
      dispatch({ type: 'SET_ERROR', payload: error as Error });
      return { error };
    } finally {
      setIsLoading(false);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const clearError = () => {
    setError(null);
    dispatch({ type: 'CLEAR_ERROR' });
  };
  
  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        signup,
        logout,
        updateProfile,
        resetPassword,
        updatePassword,
        clearError,
        isAuthenticated: !!currentUser,
        isLoading,
        currentUser,
        sessionData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useRole = (
  role: UserRole | UserRole[], 
  fallback: JSX.Element | null = null
): boolean | JSX.Element | null => {
  const { currentUser, isLoading } = useAuth();
  
  if (isLoading) return fallback;
  
  if (!currentUser) return fallback;
  
  if (Array.isArray(role)) {
    return role.includes(currentUser.role as UserRole) || fallback;
  }
  
  return currentUser.role === role || fallback;
};