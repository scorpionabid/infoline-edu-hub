
import { useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';

interface UseSupabaseAuthReturn {
  user: FullUserData | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<FullUserData>) => Promise<boolean>;
}

export const useSupabaseAuth = (
  client = supabase,
  initialSession?: Session | null
): UseSupabaseAuthReturn => {
  const [session, setSession] = useState<Session | null>(initialSession || null);
  const [user, setUser] = useState<FullUserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Supabase sessiyası və istifadəçi profili məlumatlarını sinxronlaşdıran funksiya
  const fetchUserData = useCallback(async (sessionData: Session | null) => {
    try {
      if (!sessionData?.user) {
        setUser(null);
        return;
      }

      const userId = sessionData.user.id;
      console.log('Fetching user profile for:', userId);

      // İstifadəçi rolunun əldə edilməsi
      const { data: roleData, error: roleError } = await client
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (roleError) {
        console.warn('Error fetching user role:', roleError);
      }

      // İstifadəçi profilinin əldə edilməsi
      const { data: profileData, error: profileError } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.warn('Error fetching user profile:', profileError);
      }

      if (!roleData) {
        console.warn('No role data found for user:', userId);
      }

      const userData: FullUserData = {
        id: userId,
        email: sessionData.user.email || '',
        role: roleData?.role || 'user',
        region_id: roleData?.region_id,
        sector_id: roleData?.sector_id,
        school_id: roleData?.school_id,
        regionId: roleData?.region_id,
        sectorId: roleData?.sector_id,
        schoolId: roleData?.school_id,
        full_name: profileData?.full_name || sessionData.user.email?.split('@')[0] || '',
        name: profileData?.full_name || sessionData.user.email?.split('@')[0] || '',
        phone: profileData?.phone || '',
        position: profileData?.position || '',
        language: profileData?.language || 'az',
        avatar: profileData?.avatar || '',
        status: profileData?.status || 'active',
        last_login: profileData?.last_login || null,
        lastLogin: profileData?.last_login || null,
        created_at: profileData?.created_at || new Date().toISOString(),
        updated_at: profileData?.updated_at || new Date().toISOString(),
        createdAt: profileData?.created_at || new Date().toISOString(),
        updatedAt: profileData?.updated_at || new Date().toISOString(),
        notificationSettings: {
          email: true,
          system: true,
        },
      };

      console.log('User data fetched:', userData);
      setUser(userData);
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      setUser(null);
    }
  }, [client]);

  // Auth state listener
  useEffect(() => {
    setLoading(true);

    // İlk sessiya yoxlaması
    const checkSession = async () => {
      try {
        const { data, error } = await client.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setSession(null);
          setUser(null);
          return;
        }
        
        setSession(data.session);
        
        if (data.session) {
          // setTimeout istifadə edək ki, Supabase auth daxili dövrümüz olmasın
          setTimeout(() => {
            fetchUserData(data.session);
          }, 0);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    // Auth sessiyasındakı dəyişiklikləri dinləyək
    const { data: { subscription } } = client.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event);
        setSession(currentSession);
        
        // AuthStateChange callback-i sinxron işləməlidir
        // Əlavə Supabase sorğuları üçün setTimeout istifadə edirik
        if (currentSession) {
          setTimeout(() => {
            fetchUserData(currentSession);
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // İlk sessiya məlumatlarını yükləyək
    checkSession();

    // Komponentin dağılması zamanı əbunəliyi ləğv edək
    return () => {
      subscription.unsubscribe();
    };
  }, [client, fetchUserData]);

  // Login funksiyası
  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with:', email);
      setLoading(true);
      
      // Təmiz başlanğıc üçün əvvəlcə çıxış edək
      await client.auth.signOut();
      
      // Yeni giriş
      const result = await client.auth.signInWithPassword({
        email,
        password
      });

      console.log('Sign in result:', result);
      
      return result;
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Çıxış funksiyası
  const signOut = async () => {
    try {
      setLoading(true);
      await client.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Profil yeniləmə funksiyası
  const updateProfile = async (updates: Partial<FullUserData>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await client
        .from('profiles')
        .update({
          full_name: updates.full_name,
          phone: updates.phone,
          position: updates.position,
          language: updates.language,
          avatar: updates.avatar,
          status: updates.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        return false;
      }

      // Yenilənmiş məlumatları əldə edək
      if (session) {
        await fetchUserData(session);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  return {
    user,
    session,
    loading,
    signIn,
    signOut,
    updateProfile
  };
};
