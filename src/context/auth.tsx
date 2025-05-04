
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserFormData } from '@/types/user';
import { FullUserData } from '@/types/supabase';
import { AuthContextType } from './auth/types';
import { Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isLoading: true,
  error: null,
  isAuthenticated: false,
  login: async () => false,
  logout: async () => {},
  updateUser: async () => false,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  createUser: async () => ({ error: null }),
  clearError: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FullUserData | null>(null);
  const [session, setSession] = useState<Session | null>(null);
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
            },
            // İnterfeys tələblərinə uyğun əlavə sahələr
            name: userProfile.full_name || '',
            regionId: userProfile.region_id,
            sectorId: userProfile.sector_id,
            schoolId: userProfile.school_id,
            lastLogin: userProfile.last_login,
            createdAt: userProfile.created_at,
            updatedAt: userProfile.updated_at,
            notificationSettings: {
              email: true,
              system: true,
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

    // Auth statusunu izləmək
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      setSession(session);
      
      if (session?.user) {
        // Əgər sessiya yox deyilsə istifadəçi məlumatlarını əldə et
        try {
          const { data: userProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileError) {
            if (profileError.code !== 'PGRST116') {  // Məlumat tapılmadı xətası deyilsə
              throw profileError;
            }
            
            // Profil tapılmadı, boş istifadəçi təyin et
            setUser(null);
            return;
          }
          
          setUser({
            id: userProfile.id,
            email: userProfile.email || session.user.email || '',
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
            },
            // İnterfeys tələblərinə uyğun əlavə sahələr
            name: userProfile.full_name || '',
            regionId: userProfile.region_id,
            sectorId: userProfile.sector_id,
            schoolId: userProfile.school_id,
            lastLogin: userProfile.last_login,
            createdAt: userProfile.created_at,
            updatedAt: userProfile.updated_at,
            notificationSettings: {
              email: true,
              system: true,
            }
          });
        } catch (error: any) {
          console.error('Profile fetch error:', error);
          setUser(null);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
      }
    });

    // İlk yüklənmə zamanı sessiya vəziyyətini yoxla
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        fetchUser();
      } else {
        setLoading(false);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Login funksiyası - həm köhnə signIn həm də yeni login interfeysi ilə uyğunlaşır
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setError(error.message);
        return false;
      }
      
      return true;
    } catch (error: any) {
      console.error('Sign in error:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Compatibility function for old interface
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

  // Çıxış funksiyası - həm köhnə signOut həm də yeni logout interfeysi ilə uyğunlaşır
  const logout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error: any) {
      console.error('Sign out error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Compatibility function for old interface
  const signOut = async () => {
    await logout();
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

  // İstifadəçi məlumatlarını yeniləmək
  const updateUser = async (updates: Partial<FullUserData>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.full_name,
          phone: updates.phone,
          position: updates.position,
          language: updates.language,
          avatar: updates.avatar,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (error) {
        throw error;
      }
      
      // İstifadəçi məlumatlarını yenilə
      setUser({ ...user, ...updates });
      toast.success('Profil uğurla yeniləndi');
      return true;
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast.error('Profil yeniləmə xətası', { description: error.message });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Xəta mesajlarını təmizləmək üçün funksiya
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session,
        loading, 
        isLoading: loading, 
        error, 
        isAuthenticated: !!user, 
        login,
        logout,
        updateUser,
        signIn,
        signOut,
        createUser,
        clearError 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
