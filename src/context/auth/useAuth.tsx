
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { FullUserData } from '@/types/user';
import { toast } from 'sonner';
import { AuthContextType } from './types';

// Standart deafult dəyərlər
const defaultContextValue: AuthContextType = {
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => false,
  logout: async () => {},
  updateUser: async () => false,
  clearError: () => {}
};

// Context yaratmaq
export const AuthContext = createContext<AuthContextType>(defaultContextValue);

// Provider komponenti
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FullUserData | null>(null);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        setSession(sessionData?.session);
        
        if (sessionData?.session) {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sessionData.session.user.id)
            .single();
            
          if (userError) throw userError;
          
          setUser({
            id: userData.id,
            email: userData.email || sessionData.session.user.email || '',
            full_name: userData.full_name || '',
            role: userData.role || '',
            avatar: userData.avatar,
            region_id: userData.region_id,
            sector_id: userData.sector_id,
            school_id: userData.school_id
          });
          setIsAuthenticated(true);
        }
      } catch (err: any) {
        console.error('Auth initialization error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
    
    // Auth status dəyişikliyini izləyirik
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      
      if (event === 'SIGNED_IN' && session?.user) {
        setIsLoading(true);
        try {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (userError) throw userError;
          
          setUser({
            id: userData.id,
            email: userData.email || session.user.email || '',
            full_name: userData.full_name || '',
            role: userData.role || '',
            avatar: userData.avatar,
            region_id: userData.region_id,
            sector_id: userData.sector_id,
            school_id: userData.school_id
          });
          setIsAuthenticated(true);
        } catch (err: any) {
          console.error('User data fetch error:', err);
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      return true;
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message);
      toast.error('Giriş uğursuz oldu', {
        description: err.message
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(err.message);
      toast.error('Çıxış zamanı xəta', {
        description: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (updates: Partial<FullUserData>): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user?.id);
        
      if (error) throw error;
      
      setUser((prev) => prev ? { ...prev, ...updates } : null);
      toast.success('Profil uğurla yeniləndi');
      return true;
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.message);
      toast.error('Profil yenilənərkən xəta', {
        description: err.message
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
        updateUser,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
