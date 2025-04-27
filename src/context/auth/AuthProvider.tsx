
import React, { useState, useEffect, ReactNode } from 'react';
import { useSupabaseAuth } from '@/hooks/auth';
import { AuthContext } from './context';
import { FullUserData } from '@/types/supabase';
import { toast } from 'sonner';
import { AuthState } from './types';
import { supabase } from '@/integrations/supabase/client';

interface AuthProviderProps {
  children: ReactNode;
  initialState?: AuthState;
  supabaseClient?: any;
  initialSession?: any;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ 
  children, 
  initialState,
  supabaseClient,
  initialSession
}) => {
  const {
    user,
    session,
    loading,
    signIn,
    signOut,
    updateProfile,
  } = useSupabaseAuth(supabaseClient, initialSession);

  const [error, setError] = useState<string | null>(initialState?.error || null);

  // Derive auth state from Supabase user or initialState if provided
  const authState: AuthState = initialState || {
    user,
    session,
    isAuthenticated: !!user && !!user.id && !!user.email,
    isLoading: loading,
    error,
  };

  useEffect(() => {
    console.log('AuthProvider state updated:', {
      isAuthenticated: !!user && !!user.id && !!user.email,
      user: user ? {
        id: user.id,
        email: user.email,
        role: user.role
      } : null,
      isLoading: loading
    });
    
    // Rolu olmayan istifadəçilər üçün xəbərdarlıq
    if (user && !user.role) {
      console.warn('User has no role assigned!', user);
    }
  }, [user, loading]);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      console.log(`AuthContext: ${email} ilə giriş edilir...`);
      
      const { data, error } = await signIn(email, password);
      
      if (error) {
        console.error('AuthContext: Giriş uğursuz oldu:', error);
        throw error;
      }
      
      if (!data || !data.user) {
        console.error('AuthContext: Giriş uğursuz oldu - istifadəçi məlumatları yoxdur');
        setError('Giriş uğursuz oldu - istifadəçi məlumatları yoxdur');
        return false;
      }
      
      console.log('AuthContext: Giriş uğurlu oldu, istifadəçi ID:', data.user.id);
      return true;
    } catch (error: any) {
      console.error('AuthContext: Login error:', error);
      
      // Daha detallı xəta mesajlarını təyin edək
      if (error.message?.includes('Invalid login credentials')) {
        setError('Yanlış giriş məlumatları: e-poçt və ya şifrə səhvdir');
      } else if (error.message?.includes('Email not confirmed')) {
        setError('E-poçt təsdiqlənməyib');
      } else if (error.message === 'Failed to fetch') {
        setError('Server ilə əlaqə qurula bilmədi. İnternet bağlantınızı yoxlayın.');
      } else {
        setError(error.message || 'Bilinməyən giriş xətası');
      }
      
      toast.error('Giriş uğursuz oldu', {
        description: error.message || 'Bilinməyən giriş xətası'
      });
      
      return false;
    }
  };

  // Çıxış funksiyası
  const logout = async () => {
    try {
      setError(null);
      await signOut();
      console.log('AuthContext: İstifadəçi uğurla çıxış etdi');
    } catch (error: any) {
      console.error('AuthContext: Çıxış zamanı xəta:', error);
      setError(error.message || 'Çıxış zamanı xəta baş verdi');
      toast.error('Çıxış zamanı xəta baş verdi');
    }
  };

  // İstifadəçi məlumatlarını yeniləmək funksiyası
  const updateUser = async (userData: Partial<FullUserData>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setError(null);
      const success = await updateProfile(userData);
      return success;
    } catch (error: any) {
      console.error('Update user error:', error);
      setError(error.message || 'İstifadəçi məlumatlarını yeniləmə zamanı xəta');
      return false;
    }
  };

  // Error təmizləmə funksiyası
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        updateUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
