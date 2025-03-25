import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Profile, FullUserData, UserRole } from '@/types/supabase';

// Giriş funksiyası
export const signIn = async (email: string, password: string, setLoading: (loading: boolean) => void) => {
  try {
    setLoading(true);
    
    console.log(`Giriş edilir: ${email}`);
    
    // Mövcud sessiyaları təmizləyək
    await supabase.auth.signOut();
    
    // Login cəhdi edək
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Giriş xətası:', error);
      throw error;
    }
    
    console.log('Giriş uğurludur, məlumatlar:', data ? 'Əldə edildi' : 'Yoxdur');
    
    if (!data || !data.user) {
      throw new Error('İstifadəçi məlumatları əldə edilmədi');
    }
    
    // Last login yeniləyək
    try {
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id);
    } catch (updateError) {
      console.warn('Last login yeniləmə xətası:', updateError);
      // Bu xətanı ignore edək və davam edək
    }
    
    return data;
  } catch (error: any) {
    console.error('Giriş zamanı xəta:', error);
    
    let errorMessage = 'Giriş zamanı xəta baş verdi';
    
    if (error.message) {
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Yanlış e-poçt və ya şifrə';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'E-poçt ünvanınız təsdiqlənməyib';
      } else if (error.message.includes('Database error')) {
        errorMessage = 'Verilənlər bazası xətası. Zəhmət olmasa administratora müraciət edin.';
      } else {
        errorMessage = error.message;
      }
    }
    
    toast.error('Giriş uğursuz oldu', {
      description: errorMessage
    });
    
    throw error;
  } finally {
    setLoading(false);
  }
};

// Çıxış funksiyası
export const signOut = async (setLoading: (loading: boolean) => void, setUser: (user: FullUserData | null) => void, setSession: (session: any | null) => void) => {
  try {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    setUser(null);
    setSession(null);
    
    toast.success('Sistemdən uğurla çıxış edildi');
  } catch (error: any) {
    console.error('Çıxış zamanı xəta:', error);
    toast.error('Çıxış uğursuz oldu', {
      description: error.message
    });
  } finally {
    setLoading(false);
  }
};

// Qeydiyyat funksiyası
export const signUp = async (email: string, password: string, userData: Partial<Profile>, setLoading: (loading: boolean) => void) => {
  try {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.full_name,
          role: 'schooladmin' as UserRole, // Default olaraq schooladmin
        }
      }
    });
    
    if (error) throw error;
    
    toast.success('Qeydiyyat uğurla tamamlandı', {
      description: 'Zəhmət olmasa e-poçtunuzu yoxlayın və hesabınızı təsdiqləyin'
    });
    
    return data;
  } catch (error: any) {
    console.error('Qeydiyyat zamanı xəta:', error);
    let errorMessage = 'Qeydiyyat zamanı xəta baş verdi';
    
    if (error.message) {
      if (error.message.includes('User already registered')) {
        errorMessage = 'Bu e-poçt artıq qeydiyyatdan keçib';
      }
    }
    
    toast.error('Qeydiyyat uğursuz oldu', {
      description: errorMessage
    });
    
    throw error;
  } finally {
    setLoading(false);
  }
};

// Şifrəni sıfırla
export const resetPassword = async (email: string, setLoading: (loading: boolean) => void) => {
  try {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) throw error;
    
    toast.success('Şifrə sıfırlama linki göndərildi', {
      description: 'Zəhmət olmasa e-poçtunuzu yoxlayın'
    });
    
    return true;
  } catch (error: any) {
    console.error('Şifrə sıfırlama zamanı xəta:', error);
    
    toast.error('Şifrə sıfırlama uğursuz oldu', {
      description: error.message
    });
    
    throw error;
  } finally {
    setLoading(false);
  }
};

// İstifadəçi profilini yenilə
export const updateProfile = async (updates: Partial<Profile>, userId: string, fetchUserData: (userId: string) => Promise<FullUserData>, setUser: (user: FullUserData) => void) => {
  try {
    if (!userId) throw new Error('İstifadəçi daxil olmayıb');
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    
    if (error) throw error;
    
    // Yenilənmiş istifadəçi məlumatlarını əldə et
    const updatedUser = await fetchUserData(userId);
    setUser(updatedUser);
    
    toast.success('Profil yeniləndi', {
      description: 'Məlumatlarınız uğurla yeniləndi'
    });
    
    return true;
  } catch (error: any) {
    console.error('Profil yeniləmə zamanı xəta:', error);
    
    toast.error('Profil yeniləmə uğursuz oldu', {
      description: error.message
    });
    
    throw error;
  }
};

// İstifadəçinin şifrəsini yenilə
export const updatePassword = async (password: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password,
    });
    
    if (error) throw error;
    
    toast.success('Şifrə yeniləndi', {
      description: 'Şifrəniz uğurla yeniləndi'
    });
    
    return true;
  } catch (error: any) {
    console.error('Şifrə yeniləmə zamanı xəta:', error);
    
    toast.error('Şifrə yeniləmə uğursuz oldu', {
      description: error.message
    });
    
    throw error;
  }
};
