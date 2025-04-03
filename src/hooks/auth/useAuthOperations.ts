
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';

// Auth əməliyyatlarının idarəsi üçün hook
export const useAuthOperations = (setState: any) => {
  // Login əməliyyatı
  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        setState(prev => ({ ...prev, error, loading: false }));
        return { error };
      }
      
      // Login edildikdə "setState" lazım deyil, çünki onAuthStateChange avtomatik olaraq işləyəcək
      
      return { error: null };
    } catch (error) {
      console.error('Login error:', error);
      setState(prev => ({ ...prev, error: error as Error, loading: false }));
      return { error };
    }
  }, [setState]);
  
  // Qeydiyyat əməliyyatı
  const signup = useCallback(async (email: string, password: string, userData: Partial<FullUserData>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            // Digər məlumatlar
          }
        }
      });
      
      if (error) {
        setState(prev => ({ ...prev, error, loading: false }));
        return { error };
      }
      
      return { error: null };
    } catch (error) {
      console.error('Signup error:', error);
      setState(prev => ({ ...prev, error: error as Error, loading: false }));
      return { error };
    }
  }, [setState]);
  
  // Çıxış etmə əməliyyatı
  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      setState({ user: null, loading: false, error: null, session: null });
    } catch (error) {
      console.error('Logout error:', error);
      setState(prev => ({ ...prev, error: error as Error, loading: false }));
    }
  }, [setState]);
  
  // Profil yeniləmə
  const updateProfile = useCallback(async (profileData: Partial<FullUserData>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Auth məlumatlarını yeniləmək
      if (profileData.email) {
        const { error } = await supabase.auth.updateUser({
          email: profileData.email,
          data: {
            full_name: profileData.full_name || undefined,
          }
        });
        
        if (error) throw error;
      }
      
      // Profil məlumatlarını yeniləmək
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone,
          position: profileData.position,
          language: profileData.language,
          avatar: profileData.avatar,
          updated_at: new Date().toISOString()
        })
        .eq('id', profileData.id || '');
      
      if (error) throw error;
      
      setState(prev => ({ 
        ...prev, 
        user: { ...prev.user, ...profileData },
        loading: false 
      }));
    } catch (error) {
      console.error('Profile update error:', error);
      setState(prev => ({ ...prev, error: error as Error, loading: false }));
    }
  }, [setState]);
  
  // Şifrəni yeniləmə
  const updatePassword = useCallback(async (password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { error } = await supabase.auth.updateUser({
        password
      });
      
      if (error) {
        setState(prev => ({ ...prev, error, loading: false }));
        return { error };
      }
      
      setState(prev => ({ ...prev, loading: false }));
      return { error: null };
    } catch (error) {
      console.error('Password update error:', error);
      setState(prev => ({ ...prev, error: error as Error, loading: false }));
      return { error };
    }
  }, [setState]);
  
  // Şifrəni sıfırlamaq üçün email göndərmə
  const resetPassword = useCallback(async (email: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) {
        setState(prev => ({ ...prev, error, loading: false }));
        return { error };
      }
      
      setState(prev => ({ ...prev, loading: false }));
      return { error: null };
    } catch (error) {
      console.error('Password reset error:', error);
      setState(prev => ({ ...prev, error: error as Error, loading: false }));
      return { error };
    }
  }, [setState]);

  // Password reset email göndərmək (client api)
  const sendPasswordReset = useCallback(async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) {
        console.error('Password reset error:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      return false;
    }
  }, []);

  // Password yeniləmək (client api)
  const confirmPasswordReset = useCallback(async (password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        console.error('Password update error:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Password update error:', error);
      return false;
    }
  }, []);

  return {
    login,
    signup,
    logout,
    updateProfile,
    resetPassword,
    updatePassword,
    sendPasswordReset,
    confirmPasswordReset
  };
};
