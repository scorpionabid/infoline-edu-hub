
import { supabase } from '@/integrations/supabase/client';
import { Profile, FullUserData } from '@/types/supabase';
import { toast } from 'sonner';

// Logout prosesinin sistemli işləməsini təmin edək
export const signOut = async (setLoading: (loading: boolean) => void, setUser: (user: FullUserData | null) => void, setSession: (session: any | null) => void) => {
  try {
    setLoading(true);
    console.log('Çıxış edilir...');
    
    // State-i təmizləmək üçün əvvəlcə user və sessiyanı null edirik (bundan sonra supabase.auth.signOut() çağrılacağını gözləyirik)
    setUser(null);
    setSession(null);
    
    // Supabase-dən çıxış
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Supabase çıxış xətası:', error);
      throw error;
    }
    
    console.log('Supabase-dən uğurla çıxış edildi');
    
    toast.success('Sistemdən uğurla çıxış edildi');
    return true;
  } catch (error: any) {
    console.error('Çıxış zamanı xəta:', error);
    toast.error('Çıxış uğursuz oldu', {
      description: error.message || 'Bilinməyən xəta'
    });
    throw error;
  } finally {
    setLoading(false);
  }
};

// Authentication funksiyaları
export const signIn = async (email: string, password: string, setLoading: (loading: boolean) => void) => {
  try {
    setLoading(true);
    console.log(`Giriş edilir: ${email}`);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    console.log('Uğurla giriş edildi:', data.user?.id);
    
    toast.success('Uğurla giriş edildiniz');
    
    return data;
  } catch (error: any) {
    console.error('Giriş zamanı xəta:', error);
    
    let errorMessage = 'Giriş uğursuz oldu';
    
    if (error.message.includes('Invalid login credentials')) {
      errorMessage = 'Yanlış e-poçt və ya şifrə';
    } else if (error.message.includes('Email not confirmed')) {
      errorMessage = 'E-poçt təsdiqlənməyib';
    }
    
    toast.error(errorMessage, {
      description: error.message
    });
    
    throw error;
  } finally {
    setLoading(false);
  }
};

export const signUp = async (email: string, password: string, userData: Partial<Profile>, setLoading: (loading: boolean) => void) => {
  try {
    setLoading(true);
    console.log(`Qeydiyyat edilir: ${email}`);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    
    if (error) throw error;
    
    console.log('Uğurla qeydiyyat edildi:', data.user?.id);
    toast.success('Qeydiyyat uğurla tamamlandı');
    
    return data;
  } catch (error: any) {
    console.error('Qeydiyyat zamanı xəta:', error);
    
    let errorMessage = 'Qeydiyyat uğursuz oldu';
    
    if (error.message.includes('already registered')) {
      errorMessage = 'Bu e-poçt artıq qeydiyyatdan keçib';
    }
    
    toast.error(errorMessage, {
      description: error.message
    });
    
    throw error;
  } finally {
    setLoading(false);
  }
};

export const resetPassword = async (email: string, setLoading: (loading: boolean) => void) => {
  try {
    setLoading(true);
    console.log(`Şifrə sıfırlanır: ${email}`);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) throw error;
    
    console.log('Şifrə sıfırlama e-poçtu göndərildi');
    toast.success('Şifrə sıfırlama e-poçtu göndərildi', {
      description: `${email} ünvanına şifrə sıfırlama təlimatları göndərildi`
    });
    
    return true;
  } catch (error: any) {
    console.error('Şifrə sıfırlama zamanı xəta:', error);
    
    toast.error('Şifrə sıfırlama uğursuz oldu', {
      description: error.message
    });
    
    return false;
  } finally {
    setLoading(false);
  }
};

export const updateProfile = async (updates: Partial<Profile>, userId: string, fetchUserData: (userId: string) => Promise<FullUserData>, setUser: (user: FullUserData | null) => void) => {
  try {
    console.log('Profil yenilənir:', updates);
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    
    if (error) throw error;
    
    const updatedUser = await fetchUserData(userId);
    setUser(updatedUser);
    
    console.log('Profil uğurla yeniləndi');
    toast.success('Profil uğurla yeniləndi');
    
    return true;
  } catch (error: any) {
    console.error('Profil yeniləmə zamanı xəta:', error);
    
    toast.error('Profil yeniləmə uğursuz oldu', {
      description: error.message
    });
    
    return false;
  }
};

export const updatePassword = async (password: string) => {
  try {
    console.log('Şifrə yenilənir');
    
    const { error } = await supabase.auth.updateUser({
      password,
    });
    
    if (error) throw error;
    
    console.log('Şifrə uğurla yeniləndi');
    toast.success('Şifrə uğurla yeniləndi');
    
    return true;
  } catch (error: any) {
    console.error('Şifrə yeniləmə zamanı xəta:', error);
    
    toast.error('Şifrə yeniləmə uğursuz oldu', {
      description: error.message
    });
    
    return false;
  }
};
