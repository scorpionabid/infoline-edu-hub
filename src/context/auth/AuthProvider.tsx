import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';
import { FullUserData } from '@/types/supabase';
import { toast } from 'sonner';
import { AuthContext } from './context';
import { AuthContextType } from './types';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session, loading, signIn, signOut, updateProfile } = useSupabaseAuth();
  const [error, setError] = useState<string | null>(null);
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true
  });

  // İstifadəçi və yüklənmə vəziyyəti dəyişdikdə auth vəziyyətini yenilə
  useEffect(() => {
    // Development mühitində loqlaşdırma
    if (process.env.NODE_ENV === 'development') {
      console.log('AuthProvider state updated:', {
        isAuthenticated: !!user,
        user: user ? { id: user.id, email: user.email, role: user.role } : null,
        isLoading: loading
      });
    }

    setAuthState({
      isAuthenticated: !!user,
      isLoading: loading
    });
  }, [user, loading]);

  // Login funksiyası - mövcud interfeysi saxlamaq üçün boolean qaytarır
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      const { data, error } = await signIn(email, password);
      
      if (error) {
        console.error('Login error:', error);
        setError(error.message);
        return false;
      }
      
      return true;
    } catch (error: any) {
      console.error('Unexpected login error:', error);
      setError(error.message || 'Gözlənilməz xəta baş verdi');
      toast.error('Login xətası', {
        description: error.message || 'Gözlənilməz xəta baş verdi'
      });
      return false;
    }
  }, [signIn]);

  // Logout funksiyası
  const logout = useCallback(async () => {
    try {
      setError(null);
      await signOut();
    } catch (error: any) {
      console.error('Logout error:', error);
      setError(error.message || 'Gözlənilməz xəta baş verdi');
      toast.error('Çıxış xətası', {
        description: error.message || 'Gözlənilməz xəta baş verdi'
      });
    }
  }, [signOut]);

  // Profil yeniləmə funksiyası
  const updateUser = useCallback(async (updates: Partial<FullUserData>): Promise<boolean> => {
    try {
      setError(null);
      const success = await updateProfile(updates);
      
      if (success) {
        toast.success('Profil yeniləndi', {
          description: 'Məlumatlarınız uğurla yeniləndi'
        });
      } else {
        setError('Məlumatlarınızı yeniləmək mümkün olmadı');
        toast.error('Profil yeniləmə xətası', {
          description: 'Məlumatlarınızı yeniləmək mümkün olmadı'
        });
      }
      
      return success;
    } catch (error: any) {
      console.error('Profile update error:', error);
      setError(error.message || 'Gözlənilməz xəta baş verdi');
      toast.error('Profil yeniləmə xətası', {
        description: error.message || 'Gözlənilməz xəta baş verdi'
      });
      return false;
    }
  }, [updateProfile]);

  // Xəta təmizləmə funksiyası
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Context dəyərini memoize et
  const contextValue = useMemo<AuthContextType>(() => ({
    user,
    session,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error,
    login,
    logout,
    updateUser,
    clearError
  }), [
    user, 
    session,
    authState.isAuthenticated, 
    authState.isLoading,
    error,
    login, 
    logout, 
    updateUser,
    clearError
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
