import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserFormData } from '@/types/user';

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
  isLoading: boolean; // Login.tsx-də istifadə olunur
  error: string | null;
  isAuthenticated: boolean; // Login.tsx-də istifadə olunur
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  createUser: (userData: UserFormData) => Promise<{ error?: any }>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isLoading: true,
  error: null,
  isAuthenticated: false,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  createUser: async () => ({ error: null }),
  clearError: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FullUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          throw error;
        }
        
        if (data?.user) {
          const { data: userProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          
          if (profileError) {
            throw profileError;
          }
          
          setUser({
            id: userProfile.id,
            email: userProfile.email || data.user.email || '',
            full_name: userProfile.full_name || '',
            role: userProfile.role || 'user',
            avatar: userProfile.avatar_url,
            region_id: userProfile.region_id,
            sector_id: userProfile.sector_id,
            school_id: userProfile.school_id,
            adminEntity: userProfile.admin_entity || {
              schoolName: '',
              sectorName: '',
              regionName: ''
            }
          });
        }
      } catch (error: any) {
        console.error('Auth error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        fetchUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      return { data };
    } catch (error: any) {
      console.error('Sign in error:', error);
      setError(error.message);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
    } catch (error: any) {
      console.error('Sign out error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // İstifadəçi yaratma funksiyası
  const createUser = async (userData: UserFormData) => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  // Xəta mesajlarını təmizləmək üçün funksiya
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isLoading: loading, error, isAuthenticated: !!user, signIn, signOut, createUser, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
