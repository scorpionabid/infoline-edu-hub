
import React, { useState, useEffect, ReactNode } from 'react';
import { useSupabaseAuth } from '@/hooks/auth';
import { AuthContext } from './context';
import { FullUserData } from '@/types/supabase';
import { toast } from 'sonner';
import { AuthState } from './types';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    user,
    isLoading,
    error: authError,
    signIn,
    signOut,
    updateProfile,
  } = useSupabaseAuth();

  const [error, setError] = useState<string | null>(null);

  // Derive auth state from Supabase user
  const authState: AuthState = {
    user,
    isAuthenticated: !!user && !!user.id && !!user.email && !!user.role,
    isLoading: isLoading,
    error,
  };

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      console.log(`AuthContext: ${email} ilə giriş edilir...`);
      
      if (!signIn) {
        throw new Error('Sign in functionality is not available');
      }
      
      const { data, error } = await signIn(email, password);
      
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
      } else if (error.message?.includes('İstifadəçi profili tapılmadı')) {
        setError('Bu hesab üçün profil tapılmadı, zəhmət olmasa adminə müraciət edin');
      } else if (error.message?.includes('rol təyin edilməyib')) {
        setError('Bu hesab üçün rol təyin edilməyib, zəhmət olmasa adminə müraciət edin');
      } else {
        setError(error.message || 'Bilinməyən giriş xətası');
      }
      
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setError(null);
      
      if (!signOut) {
        throw new Error('Sign out functionality is not available');
      }
      
      await signOut();
      console.log('AuthContext: İstifadəçi uğurla çıxış etdi');
    } catch (error: any) {
      console.error('AuthContext: Çıxış zamanı xəta:', error);
      setError(error.message || 'Çıxış zamanı xəta baş verdi');
      toast.error('Çıxış zamanı xəta baş verdi');
    }
  };

  // Update user function
  const updateUser = async (userData: Partial<FullUserData>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setError(null);
      
      if (!updateProfile) {
        throw new Error('Update profile functionality is not available');
      }
      
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
      
      const success = await updateProfile(profileUpdates);
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
