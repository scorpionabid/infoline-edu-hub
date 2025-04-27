
import { useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData, UserRole } from '@/types/supabase';

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
        setLoading(false);
        return;
      }

      const userId = sessionData.user.id;
      console.log('Fetching user profile for:', userId);

      // Mümkün JSON web token xətasını korrigirovka etmək üçün
      try {
        // Düzgün authToken olduğunu yoxla
        if (sessionData?.access_token) {
          client.auth.setSession({
            access_token: sessionData.access_token,
            refresh_token: sessionData.refresh_token || ''
          });
        }
      } catch (tokenErr) {
        console.warn('Error setting session token:', tokenErr);
      }

      // İlk profil və rol məlumatlarını əldə edək
      const [profileResult, roleResult] = await Promise.allSettled([
        // İstifadəçi profilini əldə et
        client.from('profiles').select('*').eq('id', userId).single(),
        // Rol məlumatını get_user_role_safe RPC üsulu ilə əldə et
        client.rpc('get_user_role_safe')
      ]);
      
      let profile: any = null;
      if (profileResult.status === 'fulfilled' && profileResult.value?.data) {
        profile = profileResult.value.data;
      } else {
        console.warn('Profile fetch error:', 
          profileResult.status === 'rejected' ? profileResult.reason : profileResult.value?.error
        );
      }
      
      let userRole: UserRole = 'user';
      if (roleResult.status === 'fulfilled' && roleResult.value?.data) {
        userRole = roleResult.value.data as UserRole;
      } else {
        console.warn('Role fetch error:', 
          roleResult.status === 'rejected' ? roleResult.reason : roleResult.value?.error
        );
        
        // Alternativ üsul: birbaşa user_roles cədvəlinə sorğu göndər
        try {
          const { data: roleData } = await client
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .single();
            
          if (roleData?.role) {
            userRole = roleData.role as UserRole;
          }
        } catch (fallbackErr) {
          console.warn('Fallback role fetch error:', fallbackErr);
        }
      }

      // RPC işləməsə xüsusi RLS qaydaları ilə user_roles cədvəlinə sorğu göndər
      let region_id = null;
      let sector_id = null;
      let school_id = null;
      
      try {
        const { data: roleEntityData } = await client
          .from('user_roles')
          .select('region_id, sector_id, school_id')
          .eq('user_id', userId)
          .single();
        
        if (roleEntityData) {
          region_id = roleEntityData.region_id;
          sector_id = roleEntityData.sector_id; 
          school_id = roleEntityData.school_id;
        }
      } catch (entitiesError) {
        console.warn('Error fetching user entities:', entitiesError);
      }

      // İstifadəçi məlumatlarını birləşdir
      const userData: FullUserData = {
        id: userId,
        email: sessionData.user.email || '',
        role: userRole,
        region_id: region_id,
        sector_id: sector_id,
        school_id: school_id,
        regionId: region_id,
        sectorId: sector_id,
        schoolId: school_id,
        full_name: profile?.full_name || sessionData.user.email?.split('@')[0] || '',
        name: profile?.full_name || sessionData.user.email?.split('@')[0] || '',
        phone: profile?.phone || '',
        position: profile?.position || '',
        language: profile?.language || 'az',
        avatar: profile?.avatar || '',
        status: profile?.status || 'active',
        last_login: profile?.last_login || null,
        lastLogin: profile?.last_login || null,
        created_at: profile?.created_at || new Date().toISOString(),
        updated_at: profile?.updated_at || new Date().toISOString(),
        createdAt: profile?.created_at || new Date().toISOString(),
        updatedAt: profile?.updated_at || new Date().toISOString(),
        notificationSettings: {
          email: true,
          system: true,
        },
      };

      console.log('User data fetched successfully:', { 
        id: userData.id,
        email: userData.email,
        role: userData.role,
        region_id: userData.region_id,
        sector_id: userData.sector_id,
        school_id: userData.school_id 
      });
      
      setUser(userData);
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      setUser(null);
      setLoading(false);
    }
  }, [client]);

  // Auth state listener
  useEffect(() => {
    setLoading(true);
    console.log('Setting up auth state listener and checking session');

    // İlk sessiya yoxlaması
    const checkSession = async () => {
      try {
        const { data, error } = await client.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }
        
        console.log('Initial session check:', data.session ? 'Session exists' : 'No session');
        setSession(data.session);
        
        if (data.session) {
          // setTimeout istifadə edək ki, Supabase auth daxili dövrümüz olmasın
          setTimeout(() => {
            fetchUserData(data.session);
          }, 0);
        } else {
          setUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Session check error:', error);
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
          setLoading(false);
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
      
      // Login
      const result = await client.auth.signInWithPassword({
        email,
        password
      });

      console.log('Sign in result:', result.error ? `Error: ${result.error.message}` : 'Success');
      
      return result;
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      // Yüklənmə vəziyyətini dəyişmirik, çünki fetchUserData funksiyası loading state-ni dəyişəcək
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
