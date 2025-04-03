
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getUserData } from './userDataService';
import { toast } from 'sonner';
import { FullUserData, UserRole } from '@/types/supabase';

// Supabase URL-ni mühit dəyişənlərdən əldə edirik
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<FullUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Yüklənir vəziyyəti
  const [signingIn, setSigningIn] = useState(false);
  const [signingUp, setSigningUp] = useState(false);
  const [sendingPasswordReset, setSendingPasswordReset] = useState(false);
  const [confirmingPasswordReset, setConfirmingPasswordReset] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Oturum durumunu izlə
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          try {
            const userData = await getUserData(session.user.id);
            if (userData) {
              // FullUserData və User tiplərini uyğunlaşdırmaq üçün tiplərini çevirək
              const authUser: FullUserData = {
                ...userData,
                id: userData.id,
                email: userData.email || '',
                name: userData.full_name || userData.name || '',
                role: userData.role,
                regionId: userData.region_id || null,
                sectorId: userData.sector_id || null,
                schoolId: userData.school_id || null,
                avatar: userData.avatar || null,
                app_metadata: {},
                user_metadata: {},
                aud: 'authenticated'
              };
              setUser(authUser);
            }
          } catch (err) {
            console.error('Oturum durumu dəyişikliyi zamanı xəta:', err);
            setError(err instanceof Error ? err : new Error('Xəta baş verdi'));
          }
        } else {
          setUser(null);
        }
        setLoading(false);
        
        console.info('Auth state dəyişdi:', event);
      }
    );
    
    // İlkin oturumu yoxla
    const getInitialSession = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const userData = await getUserData(session.user.id);
          if (userData) {
            const authUser: FullUserData = {
              ...userData,
              id: userData.id,
              email: userData.email || '',
              name: userData.full_name || userData.name || '',
              role: userData.role,
              regionId: userData.region_id || null,
              sectorId: userData.sector_id || null,
              schoolId: userData.school_id || null,
              avatar: userData.avatar || null,
              app_metadata: {},
              user_metadata: {},
              aud: 'authenticated'
            };
            setUser(authUser);
          }
        }
      } catch (err) {
        console.error('İlkin sessiya yoxlanarkən xəta:', err);
        setError(err instanceof Error ? err : new Error('Xəta baş verdi'));
      } finally {
        setLoading(false);
      }
    };
    
    getInitialSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Giriş et
  const signIn = async (email: string, password: string) => {
    try {
      setSigningIn(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        const userData = await getUserData(data.user.id);
        if (userData) {
          const authUser: FullUserData = {
            ...userData,
            id: userData.id,
            email: userData.email || '',
            name: userData.full_name || userData.name || '',
            role: userData.role,
            regionId: userData.region_id || null,
            sectorId: userData.sector_id || null,
            schoolId: userData.school_id || null,
            avatar: userData.avatar || null,
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated'
          };
          setUser(authUser);
        }
      }
      
      return data.user;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Giriş zamanı xəta baş verdi'));
      throw err;
    } finally {
      setSigningIn(false);
    }
  };
  
  // Qeydiyyat
  const signUp = async (email: string, password: string, metadata: any = {}) => {
    try {
      setSigningUp(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      
      if (error) throw error;
      
      toast.success('Qeydiyyat uğurla tamamlandı', {
        description: 'Hesabınız uğurla yaradıldı. E-poçtunuzu təsdiqləyin.'
      });
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Qeydiyyat zamanı xəta baş verdi'));
      throw err;
    } finally {
      setSigningUp(false);
    }
  };
  
  // Çıxış et
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      toast.info('Çıxış edildi');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Çıxış zamanı xəta baş verdi'));
      throw err;
    }
  };
  
  // Şifrə sıfırlama linki göndər
  const sendPasswordResetEmail = async (email: string) => {
    try {
      setSendingPasswordReset(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast.success('Şifrə sıfırlama bağlantısı göndərildi', {
        description: 'E-poçt qutunuzu yoxlayın'
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Şifrə sıfırlama linki göndərilərkən xəta baş verdi'));
      throw err;
    } finally {
      setSendingPasswordReset(false);
    }
  };
  
  // Şifrə sıfırlamanı təsdiqlə
  const confirmPasswordReset = async (password: string) => {
    try {
      setConfirmingPasswordReset(true);
      
      const { error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) throw error;
      
      toast.success('Şifrəniz yeniləndi', {
        description: 'İndi yeni şifrənizlə giriş edə bilərsiniz'
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Şifrə yeniləmə zamanı xəta baş verdi'));
      throw err;
    } finally {
      setConfirmingPasswordReset(false);
    }
  };
  
  // Qeydiyyat
  const signUp = async (email: string, password: string, metadata: any = {}) => {
    try {
      setSigningUp(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      
      if (error) throw error;
      
      toast.success('Qeydiyyat uğurla tamamlandı', {
        description: 'Hesabınız uğurla yaradıldı. E-poçtunuzu təsdiqləyin.'
      });
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Qeydiyyat zamanı xəta baş verdi'));
      throw err;
    } finally {
      setSigningUp(false);
    }
  };
  
  // Çıxış et
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      toast.info('Çıxış edildi');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Çıxış zamanı xəta baş verdi'));
      throw err;
    }
  };
  
  // Profil məlumatlarını yenilə
  const updateProfile = async (userData: Partial<FullUserData>) => {
    if (!user) return false;
    
    try {
      setUpdatingProfile(true);
      
      // İlk öncə Supabase auth istifadəçi məlumatlarını yeniləyin
      if (userData.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: userData.email,
          data: {
            full_name: userData.full_name || userData.name,
          },
        });
        
        if (authError) throw authError;
      }
      
      // Sonra profil məlumatlarını yeniləyin
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: userData.full_name || userData.name,
          phone: userData.phone,
          position: userData.position,
          language: userData.language,
          avatar: userData.avatar,
        })
        .eq('id', user.id);
      
      if (profileError) throw profileError;
      
      // İstifadəçi rolunu yeniləyin
      if (userData.role) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({
            role: userData.role,
            region_id: userData.region_id || null,
            sector_id: userData.sector_id || null,
            school_id: userData.school_id || null,
          })
          .eq('user_id', user.id);
        
        if (roleError) throw roleError;
      }
      
      // İstifadəçi məlumatlarını yeniləmək
      if (user) {
        const updatedUserData = await getUserData(user.id);
        if (updatedUserData) {
          const authUser: FullUserData = {
            ...updatedUserData,
            id: updatedUserData.id,
            email: updatedUserData.email || '',
            name: updatedUserData.full_name || updatedUserData.name || '',
            role: updatedUserData.role,
            regionId: updatedUserData.region_id || null,
            sectorId: updatedUserData.sector_id || null,
            schoolId: updatedUserData.school_id || null,
            avatar: updatedUserData.avatar || null,
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated'
          };
          setUser(authUser);
        }
      }
      
      toast.success('Profil məlumatlarınız yeniləndi');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Profil yeniləmə zamanı xəta baş verdi'));
      throw err;
    } finally {
      setUpdatingProfile(false);
    }
  };
  
  // Şifrə dəyişdirmə
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setChangingPassword(true);
      
      // Verify current password first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });
      
      if (signInError) throw new Error('Hazırkı şifrə düzgün deyil');
      
      // Then change the password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      
      toast.success('Şifrəniz uğurla dəyişdirildi');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Şifrə dəyişdirmə zamanı xəta baş verdi'));
      throw err;
    } finally {
      setChangingPassword(false);
    }
  };

  // Təyin edilmiş rolun olub-olmadığını yoxla
  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };
  
  return {
    user,
    loading,
    error,
    signingIn,
    signingUp,
    sendingPasswordReset,
    confirmingPasswordReset,
    updatingProfile,
    changingPassword,
    signIn,
    signUp,
    signOut,
    sendPasswordResetEmail,
    confirmPasswordReset,
    updateProfile,
    changePassword,
    hasRole,
    getUserData
  };
};

export default useSupabaseAuth;
