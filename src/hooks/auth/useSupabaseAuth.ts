
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserData } from './userDataService';
import { toast } from 'sonner';
import { FullUserData } from '@/types/supabase';

export type AuthState = {
  loading: boolean;
  isAuthenticated: boolean;
  user: FullUserData | null;
  session: any | null;
};

export type AuthActions = {
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, userData: any) => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (password: string) => Promise<boolean>;
  fetchUserData: (userId: string) => Promise<FullUserData>;
  refreshSession: () => Promise<any>;
};

export type UseSupabaseAuthReturn = AuthState & AuthActions;

export const useSupabaseAuth = (): UseSupabaseAuthReturn => {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<FullUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Sessiya məlumatlarını yeniləmək
  const refreshSession = useCallback(async () => {
    try {
      console.log('refreshSession çağrılır');
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session yeniləmə xətası:', error);
        return null;
      }
      
      if (data.session) {
        console.log('Session yeniləndi');
        setSession(data.session);
        setIsAuthenticated(true);
        
        // İstifadəçi məlumatlarını yeniləyək
        try {
          if (data.session.user.id) {
            const userData = await fetchUserData(data.session.user.id);
            setUser(userData);
          }
        } catch (userError) {
          console.error('İstifadəçi məlumatları yeniləmə xətası:', userError);
        }
      }
      
      return data.session;
    } catch (error) {
      console.error('Session yeniləmə xətası:', error);
      return null;
    }
  }, []);

  // Sessiya dəyişikliklərini izləmək
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      try {
        // Əvvəlcə mövcud sessiyanı yoxlayaq
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('getSession xətası:', sessionError);
          setLoading(false);
          return;
        }
        
        console.log('Mövcud sessiya:', sessionData?.session?.user?.id || 'yoxdur');
        
        // Sessiyanı qeyd edək və istifadəçi məlumatlarını yükləyək
        if (sessionData?.session) {
          setSession(sessionData.session);
          setIsAuthenticated(true);
          
          try {
            const userData = await fetchUserData(sessionData.session.user.id);
            setUser(userData);
            console.log('İstifadəçi rolu:', userData.role);
          } catch (userError) {
            console.error('İstifadəçi məlumatları yükləmə xətası:', userError);
          }
        }
      } catch (error) {
        console.error('Auth initializing xətası:', error);
      } finally {
        setLoading(false);
      }
      
      // Auth dəyişikliklərini dinləyək
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          console.log('Auth state dəyişdi:', event, newSession?.user?.id);
          
          if (newSession) {
            setSession(newSession);
            setIsAuthenticated(true);
            
            try {
              const userData = await fetchUserData(newSession.user.id);
              setUser(userData);
              console.log('İstifadəçi rolu:', userData.role);
            } catch (userError) {
              console.error('İstifadəçi məlumatları yükləmə xətası:', userError);
            }
          } else {
            setSession(null);
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      );
      
      return () => {
        authListener.subscription.unsubscribe();
      };
    };
    
    initializeAuth();
  }, []);

  // Login funksiyası
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Login prosesi başlayır:', email);
      
      const isSuperAdmin = email.toLowerCase() === 'superadmin@infoline.az';
      
      // Əgər SuperAdmin girişidirsə, safe-login edge function istifadə edək
      if (isSuperAdmin) {
        try {
          console.log('SuperAdmin giriş aşkarlandı, safe-login istifadə edilir');
          
          const result = await fetch(`${supabase.supabaseUrl}/functions/v1/safe-login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabase.supabaseKey}`
            },
            body: JSON.stringify({ email, password })
          });
          
          const responseData = await result.json();
          
          if (!result.ok) {
            console.error('Safe-login xətası:', responseData);
            throw new Error(responseData.error || 'SuperAdmin giriş xətası');
          }
          
          console.log('Safe-login uğurlu oldu');
          
          // Session-u və token-ləri tənzimləyək
          await supabase.auth.setSession({
            access_token: responseData.session.access_token,
            refresh_token: responseData.session.refresh_token
          });
          
          // Session-u yenidən əldə edək
          const { data: refreshedSession } = await supabase.auth.getSession();
          
          // İstifadəçi məlumatlarını əldə edək
          const userData = await fetchUserData(responseData.user.id);
          setUser(userData);
          setSession(refreshedSession.session);
          setIsAuthenticated(true);
          
          return responseData;
        } catch (safeLoginError) {
          console.error('Safe-login funksiyasında xəta:', safeLoginError);
          
          // Standart metodla cəhd edək
          console.log('Standart giriş metoduna keçid edilir');
        }
      }
      
      // Standart login metodu
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Login xətası:', error.message);
        throw error;
      }
      
      console.log('Login uğurla tamamlandı:', data?.user?.id);
      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Signup funksiyası
  const signUp = async (email: string, password: string, userData: any) => {
    try {
      setLoading(true);
      console.log('Qeydiyyat prosesi başlayır:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      
      if (error) {
        console.error('Qeydiyyat xətası:', error.message);
        throw error;
      }
      
      console.log('Qeydiyyat uğurla tamamlandı:', data?.user?.id);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Çıxış funksiyası
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Çıxış xətası:', error);
        throw error;
      }
      
      setSession(null);
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('Çıxış uğurla tamamlandı');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Profil yeniləmə funksiyası
  const updateProfile = async (updates: any) => {
    try {
      if (!user) {
        console.error('İstifadəçi təyin olunmayıb, profil yeniləməsi mümkün deyil');
        return false;
      }
      
      console.log('Profil yenilənir:', updates);
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (error) {
        console.error('Profil yeniləmə xətası:', error);
        return false;
      }
      
      // Profil yeniləndikdən sonra istifadəçi məlumatlarını yeniləyək
      const updatedUser = await fetchUserData(user.id);
      setUser(updatedUser);
      
      return true;
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  };

  // Şifrə sıfırlama funksiyası
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) {
        console.error('Şifrə sıfırlama xətası:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      return false;
    }
  };

  // Şifrə yeniləmə funksiyası
  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password
      });
      
      if (error) {
        console.error('Şifrə yeniləmə xətası:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Update password error:', error);
      return false;
    }
  };

  return {
    loading,
    isAuthenticated,
    user,
    session,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
    fetchUserData,
    refreshSession,
  };
};

export default useSupabaseAuth;
