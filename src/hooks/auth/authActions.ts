import { FullUserData, Profile } from '@/types/supabase';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Sign in function
export const signIn = async (
  email: string, 
  password: string, 
  setLoading: (loading: boolean) => void
) => {
  try {
    setLoading(true);
    console.log(`Auth signing in with email: ${email}`);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      toast.error('Giriş zamanı xəta baş verdi', {
        description: error.message
      });
      throw error;
    }
    
    toast.success('Uğurlu giriş');
    return data;
  } catch (error: any) {
    console.error('Auth signin error:', error);
    throw error;
  } finally {
    setLoading(false);
  }
};

// Sign out function
export const signOut = async (
  setLoading: (loading: boolean) => void,
  setUser: (user: FullUserData | null) => void,
  setSession: (session: any | null) => void
) => {
  try {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  } catch (error: any) {
    console.error('Auth signout error:', error);
    throw error;
  } finally {
    setLoading(false);
  }
};

// Sign up function
export const signUp = async (
  email: string, 
  password: string, 
  userData: Partial<Profile>,
  setLoading: (loading: boolean) => void
) => {
  try {
    setLoading(true);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    
    if (error) {
      toast.error('Qeydiyyat zamanı xəta baş verdi', {
        description: error.message
      });
      throw error;
    }
    
    toast.success('Qeydiyyat uğurla tamamlandı');
    return data;
  } catch (error: any) {
    console.error('Auth signup error:', error);
    throw error;
  } finally {
    setLoading(false);
  }
};

// Reset password function
export const resetPassword = async (
  email: string,
  setLoading: (loading: boolean) => void
) => {
  try {
    setLoading(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      toast.error('Şifrə sıfırlamada xəta baş verdi', {
        description: error.message
      });
      throw error;
    }
    
    toast.success('Şifrə sıfırlama linki e-poçt adresinizə göndərildi');
    return true;
  } catch (error: any) {
    console.error('Auth reset password error:', error);
    throw error;
  } finally {
    setLoading(false);
  }
};

// Update profile function
export const updateProfile = async (
  updates: Partial<Profile>,
  userId: string,
  fetchUserData: (id: string) => Promise<FullUserData>,
  setUser: (user: FullUserData | null) => void
) => {
  try {
    // Profil məlumatlarını yeniləyək
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    
    if (error) {
      toast.error('Profil yeniləmədə xəta baş verdi', {
        description: error.message
      });
      return false;
    }
    
    // Yeni istifadəçi məlumatlarını əldə edək
    const updatedUserData = await fetchUserData(userId);
    setUser(updatedUserData);
    
    toast.success('Profil uğurla yeniləndi');
    return true;
  } catch (error: any) {
    console.error('Update profile error:', error);
    return false;
  }
};

// Update password function
export const updatePassword = async (password: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password,
    });
    
    if (error) {
      toast.error('Şifrə yeniləmədə xəta baş verdi', {
        description: error.message
      });
      return false;
    }
    
    toast.success('Şifrə uğurla yeniləndi');
    return true;
  } catch (error: any) {
    console.error('Update password error:', error);
    return false;
  }
};
