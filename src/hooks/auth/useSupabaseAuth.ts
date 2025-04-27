
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

      // Token-u yoxla və set et
      try {
        if (sessionData?.access_token) {
          client.auth.setSession({
            access_token: sessionData.access_token,
            refresh_token: sessionData.refresh_token || ''
          });
        }
      } catch (tokenErr) {
        console.warn('Error setting session token:', tokenErr);
      }

      // İstifadəçi rolunu əldə etmək üçün bir neçə metod sınayaq
      let userRole: UserRole = 'user';
      let region_id = null;
      let sector_id = null; 
      let school_id = null;
      
      // Metod 1: get_user_role_safe RPC funksiyasını çağır
      try {
        const { data: roleData, error: roleError } = await client.rpc('get_user_role_safe');
        
        if (!roleError && roleData) {
          userRole = roleData as UserRole;
          console.log('Role fetched via RPC:', userRole);
        } else {
          console.warn('RPC role fetch error:', roleError);
        }
      } catch (rpcErr) {
        console.warn('RPC error catch:', rpcErr);
      }
      
      // Metod 2: Əgər RPC işləməzsə, birbaşa user_roles cədvəlini sorğulayırıq
      if (userRole === 'user') {
        try {
          const { data: roleData, error: roleError } = await client
            .from('user_roles')
            .select('role, region_id, sector_id, school_id')
            .eq('user_id', userId)
            .maybeSingle();
          
          if (!roleError && roleData) {
            userRole = roleData.role as UserRole;
            region_id = roleData.region_id;
            sector_id = roleData.sector_id;
            school_id = roleData.school_id;
            console.log('Role fetched via direct query:', userRole);
          } else {
            console.warn('Direct role query error:', roleError);
          }
        } catch (directErr) {
          console.warn('Direct query error catch:', directErr);
        }
      }

      // Metod 3: Profil məlumatlarını əldə etməyə çalışaq
      let profile: any = null;
      try {
        const { data: profileData, error: profileError } = await client
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        
        if (!profileError && profileData) {
          profile = profileData;
        } else {
          console.warn('Profile fetch error:', profileError);
        }
      } catch (profileErr) {
        console.warn('Profile fetch error catch:', profileErr);
      }
      
      // Uğursuz olduqda mock data istifadə edək
      if (!profile) {
        profile = {
          full_name: sessionData.user.email?.split('@')[0] || 'İstifadəçi',
          language: 'az',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
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
      setLoading(false);
    }
  }, [client]);

  // Auth state listener
  useEffect(() => {
    setLoading(true);
    console.log('Setting up auth state listener and checking session');

    // Əvvəlcə listener-i quraşdır
    const { data: { subscription } } = client.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event);
        setSession(currentSession);
        
        // Əlavə sorğular üçün setTimeout istifadə et - async olaraq çağırma!
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

    // Sonra cari sessiyanı yoxla
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
          // Ayrı thread-də işləsin deyə setTimeout istifadə et
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

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [client, fetchUserData]);

  // Login funksiyası
  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with:', email);
      setLoading(true);
      
      const result = await client.auth.signInWithPassword({
        email,
        password
      });

      console.log('Sign in result:', result.error ? `Error: ${result.error.message}` : 'Success');
      return result;
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
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
