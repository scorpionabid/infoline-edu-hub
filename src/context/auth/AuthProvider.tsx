
import React, { useState, useEffect, ReactNode } from 'react';
import { useAuth as useSupabaseAuth } from '@/hooks/auth/useAuth';
import { AuthContext } from './context';
import { FullUserData } from '@/types/supabase';
import { toast } from 'sonner';
import { AuthState } from './types';
import { supabase } from '@/integrations/supabase/client';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    user,
    isLoading,
    error: authError,
    logout
  } = useSupabaseAuth();

  const [error, setError] = useState<string | null>(null);

  // Derive auth state from Supabase user
  const authState: AuthState = {
    user,
    isAuthenticated: !!user && !!user.id && !!user.email && !!user.role,
    isLoading,
    error,
  };

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      console.log(`AuthContext: ${email} ilə giriş edilir...`);
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('AuthContext: Giriş uğursuz oldu:', error);
        throw error; // Xətanı irəli ötürək
      }
      
      if (!data || !data.user) {
        console.error('AuthContext: Giriş uğursuz oldu - istifadəçi məlumatları yoxdur');
        setError('Giriş uğursuz oldu - istifadəçi məlumatları yoxdur');
        return false;
      }
      
      console.log('AuthContext: Giriş uğurlu oldu');
      return true;
    } catch (error: any) {
      console.error('AuthContext: Login error:', error);
      
      // Daha detallı xəta mesajlarını təyin edək
      if (error.status === 500) {
        setError('Server xətası: verilənlər bazasında problem var');
      } else if (error.status === 401) {
        setError('Giriş icazəsi yoxdur: yanlış e-poçt və ya şifrə');
      } else if (error.message?.includes('Invalid login credentials')) {
        setError('Yanlış giriş məlumatları: e-poçt və ya şifrə səhvdir');
      } else if (error.message?.includes('Email not confirmed')) {
        setError('E-poçt təsdiqlənməyib');
      } else {
        setError(error.message || 'Bilinməyən giriş xətası');
      }
      
      return false;
    }
  };

  // Update user function
  const updateUser = async (userData: Partial<FullUserData>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setError(null);
      
      // Convert FullUserData to Profile format
      const profileUpdates = {
        full_name: userData.full_name,
        phone: userData.phone,
        position: userData.position,
        language: userData.language,
        avatar: userData.avatar,
        status: userData.status,
      };
      
      // Remove undefined values
      Object.keys(profileUpdates).forEach(key => {
        if (profileUpdates[key as keyof typeof profileUpdates] === undefined) {
          delete profileUpdates[key as keyof typeof profileUpdates];
        }
      });
      
      const { error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', user.id);
        
      if (error) throw error;
      
      return true;
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

  // Hər dəfə auth vəziyyəti dəyişdikdə log edək
  useEffect(() => {
    console.log('Auth vəziyyəti dəyişdi:', {
      isAuthenticated: !!user && !!user.id && !!user.email && !!user.role,
      isLoading,
      user: user ? { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        full_name: user.full_name
      } : null,
      error
    });
  }, [user, isLoading, error]);

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
