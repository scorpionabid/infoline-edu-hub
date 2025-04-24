import { supabase, supabaseAdmin } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Profile, FullUserData, UserRole } from '@/types/supabase';
import { createClient } from '@supabase/supabase-js';

// Giriş funksiyası
export const signIn = async (email: string, password: string, setLoading: (loading: boolean) => void) => {
  try {
    setLoading(true);
    
    console.log(`Giriş edilir: ${email}`);
    
    // Mövcud sessiyaları təmizləyək
    await supabase.auth.signOut();
    
    // Qısa bir gözləmə əlavə edək ki, əvvəlki sessiya tam təmizlənsin
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Supabase URL və API açarını birbaşa hardcode edək
    const supabaseUrl = 'https://olbfnauhzpdskqnxtwav.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sYmZuYXVoenBkc2txbnh0d2F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTc1MzMzMTcsImV4cCI6MjAxMzEwOTMxN30.Tz-0XJdDFQrWQyXAFhJeUPtX8PRiMxuGY-XqgIvwfww';
    
    console.log('API açarı:', supabaseKey);
    
    // Yeni bir Supabase klienti yaradaq
    const tempClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      global: {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    });
    
    // Yeni klient ilə login cəhdi edək
    const { data, error } = await tempClient.auth.signInWithPassword({
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
    
    // Əsas Supabase klientinə sessiya məlumatlarını təyin edək
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: data.session?.access_token || '',
      refresh_token: data.session?.refresh_token || ''
    });
    
    if (sessionError) {
      console.error('Sessiya təyin etmə xətası:', sessionError);
      throw sessionError;
    }
    
    console.log('Aktiv sessiya:', sessionData.session ? 'Var' : 'Yoxdur');
    
    if (sessionData.session) {
      console.log('JWT token mövcuddur:', sessionData.session.access_token ? 'Bəli' : 'Xeyr');
      
      // Token-in saxlanma yerini yoxlayaq və əmin olaq ki, localStorage-də var
      try {
        // localStorage-də token-i yoxlayaq
        const storageKey = `sb-${supabaseUrl.split('//')[1].split('.')[0]}-auth-token`;
        console.log(`LocalStorage açarı: ${storageKey}`);
        
        const storedSession = localStorage.getItem(storageKey);
        console.log(`LocalStorage yoxlanılır (${storageKey}):`, storedSession ? 'Token var' : 'Token yoxdur');
        
        if (!storedSession) {
          // Əgər token yoxdursa, manual olaraq əlavə edək
          console.log('Token manual olaraq əlavə edilir...');
          const sessionObject = {
            access_token: sessionData.session.access_token,
            refresh_token: sessionData.session.refresh_token,
            expires_at: Math.floor(Date.now() / 1000) + 3600
          };
          
          localStorage.setItem(storageKey, JSON.stringify(sessionObject));
          console.log('Token manual olaraq əlavə edildi');
        }
      } catch (storageError) {
        console.warn('Token saxlama xətası:', storageError);
      }
      
      // Test sorğusu edək ki, token düzgün işləyir
      try {
        console.log('Test sorğusu edilir...');
        const { data: testData, error: testError } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);
          
        if (testError) {
          console.warn('Test sorğusu xətası:', testError);
        } else {
          console.log('Test sorğusu uğurlu oldu:', testData);
        }
      } catch (testError) {
        console.warn('Test sorğusu zamanı xəta:', testError);
      }
    }
    
    // Profil məlumatlarını əldə etməyə çalışaq
    try {
      console.log('Profil məlumatları əldə edilir...');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();
        
      if (profileError) {
        console.warn('Profil məlumatlarını əldə etmə xətası:', profileError);
      } else {
        console.log('Profil məlumatları:', profileData);
      }
    } catch (profileCheckError) {
      console.warn('Profil yoxlama xətası:', profileCheckError);
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
