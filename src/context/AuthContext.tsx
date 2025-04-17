
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { FullUserData } from '@/types/supabase';
import { useLanguage } from './LanguageContext';
import { toast } from 'sonner';

interface AuthContextProps {
  user: FullUserData | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<FullUserData>) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<FullUserData>) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FullUserData | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t, setLanguage } = useLanguage();

  useEffect(() => {
    // Cari sessiyayı yüklə
    const loadSession = async () => {
      try {
        setIsLoading(true);
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          setError(sessionError.message);
          setIsLoading(false);
          return;
        }
        
        setSession(currentSession);
        
        if (currentSession?.user) {
          await loadUserData(currentSession.user);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSession();
    
    // Auth vəziyyəti dəyişikliyini dinlə
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        
        if (event === 'SIGNED_IN' && newSession?.user) {
          await loadUserData(newSession.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );
    
    return () => {
      // Təmizləmə
      authListener.subscription.unsubscribe();
    };
  }, []);

  // İstifadəçi məlumatlarını yüklə
  const loadUserData = async (authUser: User) => {
    try {
      setIsLoading(true);
      
      // İstifadəçi rolunu və əlaqədar məlumatlarını əldə et
      const { data: userData, error: userError } = await supabase
        .rpc('get_full_user_data', { user_id_param: authUser.id });
      
      if (userError) {
        throw userError;
      }
      
      if (!userData) {
        // İstifadəçi məlumatları tapılmadı - profil yaradılmalıdır
        setUser(null);
        return;
      }

      // Profil və rol haqqında tam məlumatları birləşdir
      const fullUserData: FullUserData = {
        id: authUser.id,
        email: authUser.email || '',
        full_name: userData.full_name || '',
        name: userData.full_name || '', // name xüsusiyyəti əlavə et (uyğunluq üçün)
        role: userData.role || 'user',
        region_id: userData.region_id || null,
        regionId: userData.region_id || null, // regionId əlavə et (uyğunluq üçün)
        sector_id: userData.sector_id || null,
        sectorId: userData.sector_id || null, // sectorId əlavə et (uyğunluq üçün)
        school_id: userData.school_id || null,
        schoolId: userData.school_id || null, // schoolId əlavə et (uyğunluq üçün)
        region_name: userData.region_name || '',
        sector_name: userData.sector_name || '',
        school_name: userData.school_name || '',
        status: userData.status || 'active',
        last_login: userData.last_login || null,
        phone: userData.phone || '',
        position: userData.position || '',
        avatar: userData.avatar || '',
        language: userData.language || 'az',
        created_at: userData.created_at || '',
        updated_at: userData.updated_at || ''
      };
      
      setUser(fullUserData);
      
      // İstifadəçinin seçdiyi dilə keç
      if (fullUserData.language) {
        setLanguage(fullUserData.language);
      }
    } catch (err: any) {
      console.error('İstifadəçi məlumatlarını yükləmə xətası:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Daxil olma
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInError) {
        return { success: false, error: signInError.message };
      }
      
      // İstifadəçi sonuncu giriş tarixini yenilə
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id);
      
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Çıxış
  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setUser(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Qeydiyyat
  const signUp = async (
    email: string,
    password: string,
    userData: Partial<FullUserData>
  ) => {
    try {
      setIsLoading(true);
      
      // Metadata hazırla
      const metadata = {
        full_name: userData.full_name || '',
        role: userData.role || 'user',
        region_id: userData.region_id || null,
        sector_id: userData.sector_id || null,
        school_id: userData.school_id || null
      };
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (signUpError) {
        return { success: false, error: signUpError.message };
      }
      
      toast.success(t('signUpSuccess'));
      
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Profil yeniləmə
  const updateProfile = async (data: Partial<FullUserData>) => {
    try {
      if (!user) {
        return { success: false, error: 'User not logged in' };
      }
      
      setIsLoading(true);
      
      // Profil cədvəlini yenilə
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          phone: data.phone,
          position: data.position,
          language: data.language,
          avatar: data.avatar,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (updateError) {
        return { success: false, error: updateError.message };
      }
      
      // İstifadəçi məlumatlarını yeniləyək
      await refreshUser();
      
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // İstifadəçi məlumatlarını yenilə
  const refreshUser = async () => {
    if (session?.user) {
      await loadUserData(session.user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        error,
        signIn,
        signOut,
        signUp,
        updateProfile,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
