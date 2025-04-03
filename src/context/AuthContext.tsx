
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from './LanguageContext';
import { FullUserData } from '@/types/supabase';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: FullUserData | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<FullUserData | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  // İstifadəçi sessiyasını yoxlamaq
  const checkUserSession = async () => {
    try {
      setIsLoading(true);
      
      // İndiki sessiyanı əldə et
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      
      if (currentSession) {
        // İstifadəçi məlumatlarını RPC vasitəsilə əldə et
        const { data: userData, error: userError } = await supabase.rpc(
          'get_full_user_data',
          { user_id_param: currentSession.user.id }
        );
        
        if (userError) {
          throw userError;
        }
        
        // İstifadəçi məlumatlarını təyin et
        setUser(userData as FullUserData);
        setIsAuthenticated(true);
        console.log('İstifadəçi sessiyası yükləndi:', userData);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        console.log('İstifadəçi sessiyası yoxdur');
      }
    } catch (error) {
      console.error('Sessiya yoxlanışı zamanı xəta:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // İlkin sessiya yoxlaması və authStateChange listener
  useEffect(() => {
    checkUserSession();
    
    // Auth state dəyişikliyini izləmək
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state dəyişdi:', event);
        setSession(newSession);
        
        if (event === 'SIGNED_IN' && newSession) {
          try {
            // İstifadəçi məlumatlarını RPC vasitəsilə əldə et
            const { data: userData, error: userError } = await supabase.rpc(
              'get_full_user_data',
              { user_id_param: newSession.user.id }
            );
            
            if (userError) {
              throw userError;
            }
            
            // İstifadəçi məlumatlarını təyin et
            setUser(userData as FullUserData);
            setIsAuthenticated(true);
            console.log('İstifadəçi giriş etdi:', userData);
          } catch (error) {
            console.error('İstifadəçi məlumatlarını əldə edərkən xəta:', error);
            setUser(null);
            setIsAuthenticated(false);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
          console.log('İstifadəçi çıxış etdi');
        }
      }
    );
    
    // Komponentin silinməsi zamanı abunəliyi ləğv et
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Login funksiyası
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Supabase-də login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      setSession(data.session);
      toast.success(t('loginSuccess'), {
        description: t('welcomeBack')
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login xətası:', error);
      let errorMessage = t('loginError');
      
      // Xəta mesajlarını müəyyənləşdirək
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = t('invalidCredentials');
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = t('emailNotConfirmed');
      }
      
      toast.error(t('loginFailed'), {
        description: errorMessage
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout funksiyası
  const logout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      setUser(null);
      setIsAuthenticated(false);
      setSession(null);
      
      toast.success(t('logoutSuccess'));
      navigate('/login');
    } catch (error: any) {
      console.error('Logout xətası:', error);
      toast.error(t('logoutError'), {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Şifrə sıfırlama funksiyası
  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      
      // Şifrə sıfırlama linki göndərmək
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      toast.success(t('resetPasswordEmailSent'), {
        description: t('checkYourEmail')
      });
    } catch (error: any) {
      console.error('Şifrə sıfırlama xətası:', error);
      toast.error(t('resetPasswordError'), {
        description: error.message
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Yeni şifrə təyin etmək
  const updatePassword = async (password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) {
        throw error;
      }
      
      toast.success(t('passwordUpdated'), {
        description: t('passwordUpdateSuccess')
      });
      navigate('/login');
    } catch (error: any) {
      console.error('Şifrə yeniləmə xətası:', error);
      toast.error(t('passwordUpdateError'), {
        description: error.message
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Kontekst dəyərləri
  const value = {
    isAuthenticated,
    isLoading,
    user,
    session,
    login,
    logout,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook üçün convenience method
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
