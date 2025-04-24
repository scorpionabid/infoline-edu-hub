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
    loading,
    signIn,
    signOut,
    updateProfile,
  } = useSupabaseAuth(supabaseClient, initialSession);

  const [error, setError] = useState<string | null>(initialState?.error || null);

  // Derive auth state from Supabase user or initialState if provided
  const authState: AuthState = initialState || {
    user,
    isAuthenticated: !!user && !!user.id && !!user.email && !!user.role,
    isLoading: loading,
    error,
  };

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      console.log(`AuthContext: ${email} ilə giriş edilir...`);
      
      // Əvvəlcə çıxış edək ki, təmiz sessiya ilə başlayaq
      await supabase.auth.signOut();
      console.log('Əvvəlki sessiya təmizləndi');
      
      // Qısa bir gözləmə əlavə edək
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Login cəhdi edək
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
      
      console.log('AuthContext: Giriş uğurlu oldu, istifadəçi ID:', data.user.id);
      
      // Sessiya məlumatlarını yoxlayaq
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.error('AuthContext: Sessiya yaradıla bilmədi');
        setError('Sessiya yaradıla bilmədi. Zəhmət olmasa yenidən cəhd edin.');
        return false;
      }
      
      console.log('AuthContext: Sessiya yaradıldı, token mövcuddur');
      
      // Profil məlumatlarını əldə etməyə çalışaq
      try {
        console.log('Profil məlumatları əldə edilir...');
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();
          
        if (profileError) {
          console.warn('Profil məlumatlarını əldə etmə xətası:', profileError);
          
          // Xətanı göstərək, lakin login prosesini dayandırmayaq
          toast.warning('Profil məlumatları əldə edilə bilmədi', {
            description: 'Giriş uğurlu oldu, lakin profil məlumatları əldə edilə bilmədi. Bəzi funksiyalar məhdud ola bilər.'
          });
        } else {
          console.log('Profil məlumatları əldə edildi:', profileData);
        }
      } catch (profileCheckError) {
        console.warn('Profil yoxlama xətası:', profileCheckError);
      }
      
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
      } else if (error.message === 'Failed to fetch') {
        setError('Server ilə əlaqə qurula bilmədi. İnternet bağlantınızı yoxlayın.');
      } else if (error.message?.includes('Invalid API key')) {
        setError('API açarı xətası. Zəhmət olmasa administratora müraciət edin.');
      } else {
        setError(error.message || 'Bilinməyən giriş xətası');
      }
      
      toast.error('Giriş uğursuz oldu', {
        description: error.message || 'Bilinməyən giriş xətası'
      });
      
      return false;
    }
  };

  // Logout function
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
      isLoading: loading,
      user: user ? { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        full_name: user.full_name
      } : null,
      error
    });
    
    // İstifadəçi məlumatları dəyişdikdə əlavə yoxlama
    if (user && user.id && user.email && user.role) {
      console.log('İstifadəçi məlumatları tam əldə edildi:', {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        region_id: user.region_id,
        sector_id: user.sector_id,
        school_id: user.school_id
      });
      
      // Superadmin hesabı üçün əlavə loq
      if (user.role === 'superadmin') {
        console.log('Superadmin hesabı ilə giriş edildi');
      }
    }
  }, [user, loading, error]);

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
