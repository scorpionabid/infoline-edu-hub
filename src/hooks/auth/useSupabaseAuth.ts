import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AuthUser } from '@/types/auth';

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setUser(null);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Profile yüklənməsində xəta:', profileError);
        throw profileError;
      }

      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (roleError && roleError.code !== 'PGRST116') {
        console.error('Role yüklənməsində xəta:', roleError);
        throw roleError;
      }

      setUser({
        id: session.user.id,
        email: session.user.email || '',
        fullName: profile?.full_name || '',
        role: userRole?.role || 'user',
        regionId: userRole?.region_id || null,
        sectorId: userRole?.sector_id || null,
        schoolId: userRole?.school_id || null,
        avatar: profile?.avatar || null,
        language: profile?.language || 'az',
        position: profile?.position || '',
        status: profile?.status || 'active'
      });
    } catch (error) {
      console.error('User yüklənməsində xəta:', error);
      setError('İstifadəçi məlumatları alınarkən xəta baş verdi');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      await loadUser();
      window.location.href = '/'; // React Router olmadan yönləndirmə
      toast.success('Uğurla daxil oldunuz!');
      return true; // Uğurlu login halında true qaytarırıq
    } catch (error: any) {
      console.error('Login xətası:', error);
      const errorMessage = error.message || 'Daxil olarkən xəta baş verdi';
      
      let localizedError = errorMessage;
      if (errorMessage.includes('Invalid login credentials')) {
        localizedError = 'Yanlış email və ya şifrə';
      } else if (errorMessage.includes('Email not confirmed')) {
        localizedError = 'Email təsdiqlənməyib';
      }
      
      setError(localizedError);
      toast.error('Daxil ola bilmədik', {
        description: localizedError
      });
      return false; // Xəta halında false qaytarırıq
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) {
        throw error;
      }

      toast.success('Qeydiyyat tamamlandı!', {
        description: 'Email-inizi təsdiqləmək üçün link göndərildi.'
      });
      return true;
    } catch (error: any) {
      console.error('Qeydiyyat xətası:', error);
      const errorMessage = error.message || 'Qeydiyyat zamanı xəta baş verdi';
      
      let localizedError = errorMessage;
      if (errorMessage.includes('User already registered')) {
        localizedError = 'Bu email artıq qeydiyyatdan keçib';
      } else if (errorMessage.includes('Password should be')) {
        localizedError = 'Şifrə ən azı 6 simvoldan ibarət olmalıdır';
      }
      
      setError(localizedError);
      toast.error('Qeydiyyat alınmadı', {
        description: localizedError
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      setUser(null);
      window.location.href = '/login'; // React Router olmadan yönləndirmə
      toast.success('Uğurla çıxış etdiniz');
    } catch (error: any) {
      console.error('Logout xətası:', error);
      toast.error('Çıxış edərkən xəta baş verdi', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`
      });

      if (error) {
        throw error;
      }

      toast.success('Şifrə sıfırlama linki göndərildi', {
        description: 'Zəhmət olmasa email-inizi yoxlayın'
      });
      return true;
    } catch (error: any) {
      console.error('Şifrə sıfırlama xətası:', error);
      setError(error.message);
      toast.error('Şifrə sıfırlama xətası', {
        description: error.message
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      toast.success('Şifrəniz uğurla yeniləndi', {
        description: 'İndi yeni şifrənizlə daxil ola bilərsiniz'
      });
      window.location.href = '/login'; // React Router olmadan yönləndirmə
      return true;
    } catch (error: any) {
      console.error('Şifrə yeniləmə xətası:', error);
      setError(error.message);
      toast.error('Şifrə yeniləmə xətası', {
        description: error.message
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<AuthUser>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: userData.fullName,
          avatar: userData.avatar,
          language: userData.language,
          position: userData.position,
          phone: userData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (error) {
        throw error;
      }

      setUser(prev => prev ? { ...prev, ...userData } : null);
      
      toast.success('Profil məlumatları yeniləndi');
      return true;
    } catch (error: any) {
      console.error('Profil yeniləmə xətası:', error);
      setError(error.message);
      toast.error('Profil yeniləmə xətası', {
        description: error.message
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          await loadUser();
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    loadUser();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [loadUser]);

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    updateUser,
    clearError
  };
};
