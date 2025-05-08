import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Profile } from '@/types/supabase';
import { FullUserData, UserRole } from '@/types/user';

// Giriş funksiyası
export const signIn = async (email: string, password: string, setLoading: (loading: boolean) => void) => {
  try {
    setLoading(true);
    
    console.log(`Giriş edilir: ${email}`);
    
    // Mövcud sessiyaları təmizləyək
    await supabase.auth.signOut();
    
    // Qısa bir gözləmə əlavə edək ki, əvvəlki sessiya tam təmizlənsin
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Supabase auth ilə daxil olma
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
      } else if (error.message === 'Failed to fetch') {
        errorMessage = 'Server ilə əlaqə qurula bilmədi. İnternet bağlantınızı yoxlayın.';
      } else if (error.message.includes('Invalid API key')) {
        errorMessage = 'Yanlış API açarı. Konfiqurasiya yoxlanılmalıdır.';
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
export const signUp = async (email: string, password: string, userData: Partial<Profile> = {}, setLoading: (loading: boolean) => void) => {
  try {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.full_name || email.split('@')[0],
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
    
    // Profilin olub-olmadığını yoxlayaq
    const { data: profileData, error: profileCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (profileCheckError && profileCheckError.code === 'PGRST116') {
      // Profil tapılmadı, yenisini yaradaq
      await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: updates.full_name || 'İstifadəçi',
          language: updates.language || 'az',
          status: updates.status || 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    } else {
      // Profil var, yeniləyək
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);
      
      if (error) throw error;
    }
    
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
