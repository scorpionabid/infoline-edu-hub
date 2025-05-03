
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { UserFormData } from '@/types/user';
import { useAuth as useAuthFromNewContext } from './auth/useAuth';

interface FullUserData {
  id: string;
  email: string;
  full_name: string;
  role: string;
  avatar?: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  adminEntity?: {
    schoolName?: string;
    sectorName?: string;
    regionName?: string;
  };
}

interface AuthContextType {
  user: FullUserData | null;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  createUser: (userData: UserFormData) => Promise<{ error?: any }>;
}

// Yeni və köhnə kontekst arasında körpü yaradaq
// Bu köhnə kontekst referanslarını qorumaq üçündür
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  clearError: () => {},
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  login: async () => false,
  logout: async () => {},
  createUser: async () => ({ error: null }),
});

// Yeni provider-ı istifadə edən yeni provider yaradaq
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Köhnə konteksti yeni kontekstə əlaqələndirək
  const newAuth = useAuthFromNewContext();
  const [error, setError] = useState<string | null>(null);

  // İstifadəçi yaratma funksiyası
  const createUser = async (userData: UserFormData) => {
    try {
      setError(null);
      
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
        });
        
        if (roleError) {
          throw roleError;
        }
      }
      
      return { data };
    } catch (error: any) {
      console.error('Create user error:', error);
      setError(error.message);
      return { error };
    }
  };

  // Köhnə API uyğunluğunu təmin etmək üçün signIn/signOut wrapper-ləri
  const signIn = async (email: string, password: string) => {
    try {
      setError(null); // Əvvəlki xətaları təmizləyirik
      const success = await newAuth.login(email, password);
      return success ? { data: {} } : { error: newAuth.error };
    } catch (error: any) {
      setError(error.message);
      return { error };
    }
  };

  const signOut = async () => {
    await newAuth.logout();
  };

  // Xəta təmizləmə funksiyası
  const clearError = () => {
    if (newAuth.clearError) {
      newAuth.clearError();
    }
    setError(null);
  };

  // Login və logout funksiyalarını doğrudan yeni kontekstdən alaq
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      return await newAuth.login(email, password);
    } catch (error: any) {
      setError(error.message);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await newAuth.logout();
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <AuthContext.Provider value={{
      user: newAuth.user,
      loading: newAuth.isLoading,
      error: newAuth.error || error,
      clearError,
      signIn,
      signOut,
      login,
      logout,
      createUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
