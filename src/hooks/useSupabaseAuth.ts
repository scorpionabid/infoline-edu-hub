
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Profile, UserRoleData, FullUserData, UserRole } from '@/types/supabase';

export const useSupabaseAuth = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<FullUserData | null>(null);
  const [session, setSession] = useState<any>(null);
  
  // Sessiya dəyişikliklərinə qulaq asaq və yeniləyək
  useEffect(() => {
    // İlkin yükləmə
    const initializeAuth = async () => {
      try {
        console.log('Auth inisializasiya başladı');
        
        // Mövcud sessiyanı yoxlayaq
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Sessiya əldə etmə xətası:', sessionError);
          setLoading(false);
          return;
        }
        
        console.log('Mövcud sessiya:', currentSession ? 'Var' : 'Yoxdur');
        setSession(currentSession);
        
        // Əgər sessiya varsa, istifadəçi məlumatlarını əldə edək
        if (currentSession?.user) {
          try {
            const userData = await fetchUserData(currentSession.user.id);
            setUser(userData);
          } catch (userError) {
            console.error('İstifadəçi məlumatlarını əldə edərkən xəta:', userError);
            // Sessiya var amma user data yoxdur - silək
            if (currentSession) {
              await supabase.auth.signOut();
              setSession(null);
            }
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Auth inisializasiya xətası:', error);
        setLoading(false);
      }
    };
    
    // Auth state dəyişikliklərinə abunə olaq
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state dəyişdi:', event);
      setSession(newSession);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (newSession?.user) {
          try {
            const userData = await fetchUserData(newSession.user.id);
            setUser(userData);
          } catch (userError) {
            console.error('Giriş sonrası istifadəçi məlumatlarını əldə edərkən xəta:', userError);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });
    
    // İnisializasiya edək
    initializeAuth();
    
    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // İstifadəçi məlumatlarını əldə et (profil və rol)
  const fetchUserData = async (userId: string): Promise<FullUserData> => {
    try {
      console.log(`Profil məlumatları alınır, istifadəçi ID: ${userId}`);
      
      // Profil məlumatlarını əldə et
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.warn('Profil məlumatlarını əldə edərkən xəta:', profileError);
        // Boş profil məlumatları ilə davam edək
      }
      
      // Default profil məlumatları
      const profile: Profile = {
        id: userId,
        full_name: profileData?.full_name || '',
        avatar: profileData?.avatar || null,
        phone: profileData?.phone || null,
        position: profileData?.position || null,
        language: profileData?.language || 'az',
        last_login: profileData?.last_login || null,
        // Burada status tipini uyğun tipə çeviririk
        status: (profileData?.status as 'active' | 'inactive' | 'blocked') || 'active',
        created_at: profileData?.created_at || new Date().toISOString(),
        updated_at: profileData?.updated_at || new Date().toISOString()
      };
      
      console.log('Rol məlumatları alınır...');
      
      // Rol məlumatlarını əldə et
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (roleError) {
        console.warn('Rol məlumatlarını əldə edərkən xəta:', roleError);
        throw new Error(`Rol məlumatları əldə edilə bilmədi: ${roleError.message}`);
      }
      
      if (!roleData) {
        throw new Error('İstifadəçi üçün rol məlumatları tapılmadı');
      }
      
      // Auth istifadəçi məlumatlarını əldə et
      const { data: authData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.warn('Auth istifadəçi məlumatlarını əldə edərkən xəta:', userError);
        throw userError;
      }
      
      // Tam istifadəçi datası
      const fullUserData: FullUserData = {
        id: userId,
        email: authData.user?.email || '',
        full_name: profile.full_name,
        role: roleData.role as UserRole,
        region_id: roleData.region_id,
        sector_id: roleData.sector_id,
        school_id: roleData.school_id,
        phone: profile.phone,
        position: profile.position,
        language: profile.language,
        avatar: profile.avatar,
        status: profile.status,
        last_login: profile.last_login,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        
        // Əlavə tətbiq xüsusiyyətləri üçün alias-lar
        name: profile.full_name,
        regionId: roleData.region_id,
        sectorId: roleData.sector_id,
        schoolId: roleData.school_id,
        lastLogin: profile.last_login,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
        
        // Əlavə tətbiq xüsusiyyətləri
        twoFactorEnabled: false,
        notificationSettings: {
          email: true,
          system: true
        }
      };
      
      console.log('İstifadəçi məlumatları uğurla əldə edildi:', {
        id: fullUserData.id,
        email: fullUserData.email,
        role: fullUserData.role
      });
      
      return fullUserData;
    } catch (error) {
      console.error('İstifadəçi məlumatlarını əldə edərkən xəta baş verdi:', error);
      throw error;
    }
  };
  
  // Giriş
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      console.log(`Giriş edilir: ${email}`);
      
      // Sessiya əldə edək
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionData && sessionData.session) {
        console.log('Mövcud sessiya var, əvvəlcə çıxış edirik');
        await supabase.auth.signOut();
      }
      
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
  
  // Çıxış
  const signOut = async () => {
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
  
  // Qeydiyyat
  const signUp = async (email: string, password: string, userData: Partial<Profile>) => {
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
  const resetPassword = async (email: string) => {
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
  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) throw new Error('İstifadəçi daxil olmayıb');
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Yenilənmiş istifadəçi məlumatlarını əldə et
      const updatedUser = await fetchUserData(user.id);
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
  const updatePassword = async (password: string) => {
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

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    updatePassword,
    fetchUserData,
  };
};
