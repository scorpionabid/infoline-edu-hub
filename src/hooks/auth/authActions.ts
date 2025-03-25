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
    
    // İstifadəçi profili və rolunu yaratmaq/yeniləmək
    await setupUserProfileAndRole(data.user.id, email);
    
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

// İstifadəçi profili və rolunu yaratmaq/yeniləmək üçün funksiya
async function setupUserProfileAndRole(userId: string, email: string) {
  try {
    console.log(`İstifadəçi profili və rolu yoxlanılır/yaradılır: ${userId}`);
    
    // Profil yoxlanılır
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    // Profil yoxdursa, yaradaq
    if (profileError && profileError.code === 'PGRST116') {
      console.log('Profil tapılmadı, yenisi yaradılır...');
      
      await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: email.split('@')[0] || 'İstifadəçi',
          language: 'az',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      console.log(`${email} üçün profil yaradıldı`);
    } else {
      // Profil var, last_login yeniləyək
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);
        
      console.log(`${email} üçün son giriş tarixi yeniləndi`);
    }
    
    // Rol yoxlanılır
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    // Rol yoxdursa, yaradaq
    if (roleError && roleError.code === 'PGRST116') {
      console.log('Rol tapılmadı, yenisi yaradılır...');
      
      // Default olaraq superadmin@infoline.az üçün superadmin, digərləri üçün schooladmin
      const defaultRole: UserRole = email === 'superadmin@infoline.az' ? 'superadmin' : 'schooladmin';
      
      await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: defaultRole,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      console.log(`${email} üçün '${defaultRole}' rolu yaradıldı`);
    } else {
      console.log(`${email} üçün rol artıq mövcuddur: ${roleData?.role || 'bilinməyən'}`);
    }
  } catch (dbError: any) {
    console.error('İstifadəçi profili/rolunu yoxlama və ya yaratma xətası:', dbError);
    // Bu xətanı ignore edək və davam edək, çünki bu kritik bir xəta deyil
  }
}

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
