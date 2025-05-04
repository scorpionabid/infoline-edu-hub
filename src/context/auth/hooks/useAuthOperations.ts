
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';
import { UserFormData } from '../types';
import { toast } from 'sonner';
import { Session } from '@supabase/supabase-js';

/**
 * Auth əməliyyatlarını (giriş, çıxış, profil yeniləmə, istifadəçi yaratma) təmin edən hook
 */
export const useAuthOperations = (
  setUser: (user: FullUserData | null) => void,
  setSession: (session: Session | null) => void,
  setError: (error: string | null) => void,
  setAuthState: (state: any) => void,
  fetchUserData: (session: Session | null, forceRefresh: boolean) => Promise<FullUserData | null>,
  setCachedUser: (userData: FullUserData | null) => void,
  cancelPreviousFetch: () => void,
  user: FullUserData | null,
  session: Session | null
) => {
  /**
   * Giriş funksiyası
   */
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      // Əvvəlki xəta və məlumatları təmizləyirik
      setError(null);
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      console.log('Giriş cəhdi edilir:', email);
      
      // Giriş məlumatlarını yoxlayırıq
      if (!email.trim() || !password.trim()) {
        setError('Email və şifrə daxil edilməlidir');
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
      }
      
      // Giriş edirik - KRİTİK: signOut çağırmadan birbaşa giriş edirik!
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      // Giriş xətasını emal edirik
      if (signInError) {
        console.error('Giriş xətası:', signInError);
        
        // Giriş xətası mesajları
        if (signInError.message?.includes('Invalid login credentials')) {
          setError('Yanlış email və ya şifrə');
        } else if (signInError.message?.includes('Email not confirmed')) {
          setError('Email təsdiqlənməyib');
        } else if (signInError.message === 'Failed to fetch') {
          setError('Server ilə əlaqə qurula bilmədi. İnternet bağlantınızı yoxlayın.');
        } else {
          setError(signInError.message || 'Giriş zamanı xəta baş verdi');
        }
        
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
      }
      
      // Giriş uğurludursa, session-u təyin edirik
      console.log('Giriş uğurlu oldu, session təyin olunur');
      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        });
        
        // Sessiyanı təyin edirik
        setSession(data.session);
      }
      
      return true;
    } catch (error: any) {
      console.error('Gözlənilməz giriş xətası:', error);
      setError(error.message || 'Gözlənilməz xəta baş verdi');
      toast.error('Login xətası', {
        description: error.message || 'Gözlənilməz xəta baş verdi'
      });
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [setError, setAuthState, setSession]);

  /**
   * Çıxış funksiyası
   */
  const logout = useCallback(async () => {
    try {
      setError(null);
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Əvvəlki sorğuları ləğv edirik
      cancelPreviousFetch();
      
      // Keşi təmizləyirik
      setCachedUser(null);
      
      // Çıxış edirik
      await supabase.auth.signOut();
      
      // Məlumatları təmizləyirik
      setUser(null);
      setSession(null);
      
      console.log('Çıxış uğurlu oldu');
      setAuthState({
        isAuthenticated: false,
        isLoading: false
      });
    } catch (error: any) {
      console.error('Çıxış xətası:', error);
      setError(error.message || 'Gözlənilməz xəta baş verdi');
      toast.error('Çıxış xətası', {
        description: error.message || 'Gözlənilməz xəta baş verdi'
      });
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, [cancelPreviousFetch, setCachedUser, setError, setAuthState, setUser, setSession]);

  /**
   * İstifadəçi profilini yeniləmək
   */
  const updateUser = useCallback(async (updates: Partial<FullUserData>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setError(null);
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Yalnız uyğun sahələri seçirik
      const updateData: any = {
        updated_at: new Date().toISOString()
      };
      
      // Sahələri yoxlayırıq və yalnız təqdim olunanları əlavə edirik
      if (updates.full_name !== undefined) updateData.full_name = updates.full_name;
      if (updates.phone !== undefined) updateData.phone = updates.phone;
      if (updates.position !== undefined) updateData.position = updates.position;
      if (updates.language !== undefined) updateData.language = updates.language;
      if (updates.avatar !== undefined) updateData.avatar = updates.avatar;
      
      // Profil məlumatlarını yeniləyirik
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);
        
      if (error) {
        throw error;
      }
      
      // İstifadəçi məlumatlarını yeniləyirik
      if (session) {
        await fetchUserData(session, true);
      }
      
      toast.success('Profil uğurla yeniləndi');
      return true;
    } catch (error: any) {
      console.error('Profil yeniləmə xətası:', error);
      setError(error.message || 'Profil yeniləmə zamanı xəta baş verdi');
      toast.error('Profil yeniləmə xətası', {
        description: error.message || 'Profil yeniləmə zamanı xəta baş verdi'
      });
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [fetchUserData, session, user, setError, setAuthState]);

  /**
   * İstifadəçi yaratma funksiyası (uyumluluk üçün əlavə edilib)
   */
  const createUser = useCallback(async (userData: UserFormData) => {
    try {
      setError(null);
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Supabase auth system üzərindən istifadəçi yaratmaq
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password || Math.random().toString(36).slice(-8),
        options: {
          data: {
            full_name: userData.full_name,
            role: userData.role,
          },
        },
      });
      
      if (error) {
        throw error;
      }
      
      // Profiles tablosuna istifadəçi əlavə etmək
      if (data?.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: data.user.id,
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role,
          region_id: userData.region_id,
          sector_id: userData.sector_id,
          school_id: userData.school_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
        if (profileError) {
          throw profileError;
        }
        
        // Rol tablosuna əlavə etmək
        const { error: roleError } = await supabase.from('user_roles').insert({
          user_id: data.user.id,
          role: userData.role,
          region_id: userData.region_id,
          sector_id: userData.sector_id,
          school_id: userData.school_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
        if (roleError) {
          throw roleError;
        }
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('İstifadəçi yaratma xətası:', error);
      setError(error.message || 'İstifadəçi yaratma zamanı xəta baş verdi');
      return { data: null, error };
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, [setError, setAuthState]);

  /**
   * Compatibility functions for legacy interface
   */
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const success = await login(email, password);
      if (success) {
        return { data: { user }, error: null };
      } else {
        return { data: null, error: new Error(String(setError) || 'Giriş uğursuz oldu') };
      }
    } catch (err: any) {
      return { data: null, error: err };
    }
  }, [login, user, setError]);

  const signOut = useCallback(async () => {
    return await logout();
  }, [logout]);

  /**
   * İstifadəçi profilini manual yeniləmək
   */
  const refreshProfile = useCallback(async (): Promise<FullUserData | null> => {
    if (!session) {
      // Sessiyanı yenidən əldə etməyə çalışırıq
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        console.warn('refreshProfile: Session məlumatları tapılmadı');
        return null;
      }
      
      // Sessiya tapıldıqda onu təyin edir və istifadəçi məlumatlarını yeniləyirik
      setSession(data.session);
      return await fetchUserData(data.session, true);
    }
    
    try {
      const updatedUser = await fetchUserData(session, true);
      return updatedUser;
    } catch (error) {
      console.error('Profil yeniləmə xətası:', error);
      return null;
    }
  }, [session, fetchUserData, setSession]);

  /**
   * Xəta mesajını təmizləmək
   */
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    login,
    logout,
    updateUser,
    createUser,
    signIn,
    signOut,
    refreshProfile,
    clearError
  };
};
