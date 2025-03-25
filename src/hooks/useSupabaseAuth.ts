
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Profile, UserRoleData, FullUserData, UserRole } from '@/types/supabase';

export const useSupabaseAuth = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<FullUserData | null>(null);
  const [session, setSession] = useState<any>(null);
  
  // Session-da dəyişiklik olduqda yenilə
  useEffect(() => {
    // İlkin sessiya məlumatını əldə et
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session?.user) {
        await fetchUserData(session.user.id);
      }
      
      setLoading(false);
    };
    
    // Auth state-ə qulaq asaq
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state dəyişdi:', event);
      setSession(session);
      
      if (session?.user) {
        await fetchUserData(session.user.id);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });
    
    initializeAuth();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // İstifadəçi məlumatlarını əldə et (profil və rol)
  const fetchUserData = async (userId: string) => {
    try {
      // Profil məlumatlarını əldə et
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) throw profileError;
      
      // Rol məlumatlarını əldə et
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (roleError) throw roleError;
      
      // Auth istifadəçi məlumatlarını əldə et
      const { data: userData, error: userError } = await supabase.auth.getUser(userId);
      
      if (userError) throw userError;
      
      // Tam istifadəçi datası
      const fullUserData: FullUserData = {
        id: userId,
        email: userData.user.email || '',
        full_name: profileData.full_name,
        role: roleData.role,
        region_id: roleData.region_id,
        sector_id: roleData.sector_id,
        school_id: roleData.school_id,
        phone: profileData.phone,
        position: profileData.position,
        language: profileData.language || 'az',
        avatar: profileData.avatar,
        status: profileData.status || 'active' as 'active' | 'inactive' | 'blocked',
        last_login: profileData.last_login,
        created_at: profileData.created_at,
        updated_at: profileData.updated_at,
        
        // Əlavə tətbiq xüsusiyyətləri üçün alias-lar
        name: profileData.full_name,
        regionId: roleData.region_id,
        sectorId: roleData.sector_id,
        schoolId: roleData.school_id,
        lastLogin: profileData.last_login,
        createdAt: profileData.created_at,
        updatedAt: profileData.updated_at,
        
        // Əlavə tətbiq xüsusiyyətləri
        twoFactorEnabled: false, // Supabase-də saxlanılmır, tətbiq səviyyəsindədir
        notificationSettings: {
          email: true,
          system: true
        }
      };
      
      setUser(fullUserData);
      return fullUserData;
    } catch (error) {
      console.error('İstifadəçi məlumatlarını əldə edərkən xəta baş verdi:', error);
      return null;
    }
  };
  
  // Giriş
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Update last login
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id);
      
      return data;
    } catch (error: any) {
      console.error('Giriş zamanı xəta:', error);
      let errorMessage = 'Giriş zamanı xəta baş verdi';
      
      if (error.message) {
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Yanlış e-poçt və ya şifrə';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'E-poçt ünvanınız təsdiqlənməyib';
        }
      }
      
      toast.error('Giriş uğursuz oldu', {
        description: errorMessage
      });
      
      setLoading(false);
      return null;
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
      
      return null;
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
      
      return false;
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
      await fetchUserData(user.id);
      
      toast.success('Profil yeniləndi', {
        description: 'Məlumatlarınız uğurla yeniləndi'
      });
      
      return true;
    } catch (error: any) {
      console.error('Profil yeniləmə zamanı xəta:', error);
      
      toast.error('Profil yeniləmə uğursuz oldu', {
        description: error.message
      });
      
      return false;
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
      
      return false;
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
