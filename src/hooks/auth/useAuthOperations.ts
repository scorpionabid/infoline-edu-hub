
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getUserData } from '@/hooks/auth/userDataService';
import { FullUserData } from '@/types/supabase';

/**
 * Auth əməliyyatları üçün hook - giriş, çıxış, şifrə sıfırlama və s.
 */
export const useAuthOperations = (setState: any) => {
  // Yüklənmə indikatoru statusu
  const [signingIn, setSigningIn] = useState(false);
  const [signingUp, setSigningUp] = useState(false);
  const [sendingPasswordReset, setSendingPasswordReset] = useState(false);
  const [confirmingPasswordReset, setConfirmingPasswordReset] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Login funksiyası
  const login = async (email: string, password: string) => {
    try {
      setSigningIn(true);
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        setState(prev => ({ ...prev, error, loading: false }));
        return { error };
      }
      
      if (data.user) {
        try {
          const userData = await getUserData(data.user.id);
          setState(prev => ({ 
            ...prev, 
            user: userData, 
            session: data.session,
            loading: false
          }));
        } catch (err) {
          console.error('İstifadəçi məlumatları alınarkən xəta:', err);
        }
      }
      
      return { error: null };
    } catch (error: any) {
      setState(prev => ({ ...prev, error, loading: false }));
      return { error };
    } finally {
      setSigningIn(false);
      setState(prev => ({ ...prev, loading: false }));
    }
  };
  
  // Qeydiyyat funksiyası
  const signup = async (email: string, password: string, userData: Partial<FullUserData>) => {
    try {
      setSigningUp(true);
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Əvvəlcə auth ilə qeydiyyatdan keç
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name || '',
            role: userData.role || 'user'
          }
        }
      });
      
      if (error) {
        setState(prev => ({ ...prev, error, loading: false }));
        return { error };
      }
      
      return { error: null };
    } catch (error: any) {
      setState(prev => ({ ...prev, error, loading: false }));
      return { error };
    } finally {
      setSigningUp(false);
      setState(prev => ({ ...prev, loading: false }));
    }
  };
  
  // Çıxış et funksiyası
  const logout = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      await supabase.auth.signOut();
      setState({ user: null, loading: false, error: null, session: null });
    } catch (error: any) {
      setState(prev => ({ ...prev, error, loading: false }));
    }
  };
  
  // Şifrə sıfırlama linki göndər
  const sendPasswordReset = async (email: string) => {
    try {
      setSendingPasswordReset(true);
      setState(prev => ({ ...prev, loading: true }));
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        setState(prev => ({ ...prev, error, loading: false }));
        return false;
      }
      
      toast.success('Şifrə sıfırlama linki e-poçt adresinizə göndərildi');
      return true;
    } catch (error: any) {
      setState(prev => ({ ...prev, error, loading: false }));
      return false;
    } finally {
      setSendingPasswordReset(false);
      setState(prev => ({ ...prev, loading: false }));
    }
  };
  
  // Şifrə sıfırlamanı təsdiqlə
  const confirmPasswordReset = async (password: string) => {
    try {
      setConfirmingPasswordReset(true);
      setState(prev => ({ ...prev, loading: true }));
      
      const { error } = await supabase.auth.updateUser({
        password
      });
      
      if (error) {
        setState(prev => ({ ...prev, error, loading: false }));
        return false;
      }
      
      toast.success('Şifrəniz uğurla yeniləndi');
      return true;
    } catch (error: any) {
      setState(prev => ({ ...prev, error, loading: false }));
      return false;
    } finally {
      setConfirmingPasswordReset(false);
      setState(prev => ({ ...prev, loading: false }));
    }
  };
  
  // Şifrə sıfırlama (kompatibllik üçün)
  const resetPassword = async (email: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        setState(prev => ({ ...prev, error, loading: false }));
        return { error };
      }
      
      toast.success('Şifrə sıfırlama linki e-poçt adresinizə göndərildi');
      return { error: null };
    } catch (error: any) {
      setState(prev => ({ ...prev, error, loading: false }));
      return { error };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };
  
  // Şifrəni yenilə
  const updatePassword = async (password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const { error } = await supabase.auth.updateUser({
        password
      });
      
      if (error) {
        setState(prev => ({ ...prev, error, loading: false }));
        return { error };
      }
      
      toast.success('Şifrəniz uğurla yeniləndi');
      return { error: null };
    } catch (error: any) {
      setState(prev => ({ ...prev, error, loading: false }));
      return { error };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };
  
  // Profil məlumatlarını yenilə
  const updateProfile = async (profileData: Partial<FullUserData>) => {
    try {
      setUpdatingProfile(true);
      const state = setState(prev => ({ ...prev })); // Cari state-i almaq
      
      if (!state.user) {
        throw new Error('No user is currently logged in');
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name || state.user.full_name,
          phone: profileData.phone || state.user.phone,
          position: profileData.position || state.user.position,
          language: profileData.language || state.user.language,
          avatar: profileData.avatar || state.user.avatar,
          updated_at: new Date().toISOString(),
        })
        .eq('id', state.user.id)
        .select();
      
      if (error) {
        setState(prev => ({ ...prev, error }));
        throw error;
      }
      
      // If the email has changed, update both auth and users
      if (profileData.email && profileData.email !== state.user.email) {
        const { error: updateAuthError } = await supabase.auth.updateUser({
          email: profileData.email
        });
        
        if (updateAuthError) {
          setState(prev => ({ ...prev, error: updateAuthError }));
          throw updateAuthError;
        }
      }
      
      // If role has changed, update the user_roles table
      if (profileData.role && profileData.role !== state.user.role) {
        const { error: updateRoleError } = await supabase
          .from('user_roles')
          .update({
            role: profileData.role,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', state.user.id);
        
        if (updateRoleError) {
          setState(prev => ({ ...prev, error: updateRoleError }));
          throw updateRoleError;
        }
      }
      
      // Get updated user data
      if (state.user) {
        const updatedUser = await getUserData(state.user.id);
        if (updatedUser) {
          setState(prev => ({ ...prev, user: updatedUser }));
        }
      }
      
      toast.success('Profil məlumatlarınız yeniləndi');
      return true;
    } catch (error: any) {
      setState(prev => ({ ...prev, error }));
      throw error;
    } finally {
      setUpdatingProfile(false);
    }
  };
  
  // Şifrə dəyişdirmə
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setChangingPassword(true);
      const state = setState(prev => ({ ...prev })); // Cari state-i almaq
      
      // Əvvəlcə cari şifrəni yoxla
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: state.user?.email || '',
        password: currentPassword,
      });
      
      if (signInError) throw new Error('Hazırkı şifrə düzgün deyil');
      
      // Sonra şifrəni dəyiş
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      
      toast.success('Şifrəniz uğurla dəyişdirildi');
      return true;
    } catch (error: any) {
      setState(prev => ({ ...prev, error }));
      return false;
    } finally {
      setChangingPassword(false);
    }
  };

  return {
    login,
    signup,
    logout,
    resetPassword,
    updatePassword,
    updateProfile,
    sendPasswordReset,
    confirmPasswordReset,
    changePassword,
    signingIn,
    signingUp,
    sendingPasswordReset,
    confirmingPasswordReset,
    updatingProfile,
    changingPassword,
  };
};
