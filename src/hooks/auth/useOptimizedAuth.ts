
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData, UserRole } from '@/types/supabase';

// User profile üçün local storage keşləmə
const USER_PROFILE_CACHE_KEY = 'user_profile';
const USER_SESSION_CACHE_KEY = 'user_session';
const CACHE_EXPIRY_MS = 30 * 60 * 1000; // 30 dəqiqə

interface UseOptimizedAuthReturn {
  user: FullUserData | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<FullUserData>) => Promise<boolean>;
  refreshProfile: () => Promise<FullUserData | null>;
}

export const useOptimizedAuth = (
  client = supabase,
  initialSession?: Session | null
): UseOptimizedAuthReturn => {
  const [session, setSession] = useState<Session | null>(initialSession || null);
  const [user, setUser] = useState<FullUserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Profil keşini əldə et
  const getCachedProfile = useCallback(() => {
    try {
      const cachedProfileStr = localStorage.getItem(USER_PROFILE_CACHE_KEY);
      if (!cachedProfileStr) return null;
      
      const cachedProfile = JSON.parse(cachedProfileStr);
      const now = new Date().getTime();
      
      if (cachedProfile.expiry && cachedProfile.expiry > now) {
        return cachedProfile.data;
      }
      
      // Vaxtı keçmiş keşi sil
      localStorage.removeItem(USER_PROFILE_CACHE_KEY);
      return null;
    } catch (e) {
      console.warn('Profile cache read error:', e);
      return null;
    }
  }, []);

  // Profil keşini yadda saxla
  const setCachedProfile = useCallback((profile: FullUserData | null) => {
    try {
      if (!profile) {
        localStorage.removeItem(USER_PROFILE_CACHE_KEY);
        return;
      }
      
      const expiry = new Date().getTime() + CACHE_EXPIRY_MS;
      localStorage.setItem(
        USER_PROFILE_CACHE_KEY,
        JSON.stringify({
          data: profile,
          expiry
        })
      );
    } catch (e) {
      console.warn('Profile cache write error:', e);
    }
  }, []);

  // İstifadəçi profil məlumatlarını əldə et
  const fetchUserProfile = useCallback(async (userId: string): Promise<FullUserData | null> => {
    try {
      console.log('Fetching user profile for:', userId);
      
      // Əvvəlcə keşdən yoxla
      const cachedProfile = getCachedProfile();
      if (cachedProfile && cachedProfile.id === userId) {
        console.log('Using cached profile');
        return cachedProfile;
      }

      // RPC funksiyası ilə istifadəçi rolunu əldə et
      const { data: roleData, error: roleError } = await client.rpc('get_user_role_safe');
      let userRole: UserRole = 'user';
      
      if (!roleError && roleData) {
        userRole = roleData as UserRole;
        console.log('Role fetched via RPC:', userRole);
      } else {
        console.warn('RPC role fetch error:', roleError);
      }

      // İstifadəçi profilini əldə et
      const { data: profileData, error: profileError } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (profileError) {
        console.error('Profile fetch error:', profileError);
      }
      
      // İstifadəçi rolunu əldə et
      const { data: userRoleData, error: userRoleError } = await client
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (userRoleError) {
        console.warn('User role fetch error:', userRoleError);
      }

      // İstifadəçi e-poçtunu əldə et
      const { data: authUserData } = await client.auth.getUser();
      const userEmail = authUserData?.user?.email || '';

      // Profil məlumatları və rol məlumatlarını birləşdir
      const profile = profileData || {};
      const role = userRoleData || {};

      const fullUserData: FullUserData = {
        id: userId,
        email: userEmail,
        full_name: profile.full_name || userEmail?.split('@')[0] || '',
        name: profile.full_name || userEmail?.split('@')[0] || '',
        role: role.role as UserRole || userRole,
        region_id: role.region_id,
        sector_id: role.sector_id,
        school_id: role.school_id,
        regionId: role.region_id,
        sectorId: role.sector_id,
        schoolId: role.school_id,
        phone: profile.phone || '',
        position: profile.position || '',
        language: profile.language || 'az',
        avatar: profile.avatar || '',
        status: profile.status || 'active',
        last_login: profile.last_login || null,
        lastLogin: profile.last_login || null,
        created_at: profile.created_at || new Date().toISOString(),
        updated_at: profile.updated_at || new Date().toISOString(),
        createdAt: profile.created_at || new Date().toISOString(),
        updatedAt: profile.updated_at || new Date().toISOString(),
        notificationSettings: {
          email: true,
          system: true,
        }
      };

      // Profili keşdə saxla
      setCachedProfile(fullUserData);
      
      return fullUserData;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }, [client, getCachedProfile, setCachedProfile]);

  // İstifadəçi sessiyasını və profilini fetch edən əsas funksiya
  const fetchUserData = useCallback(async (sessionData: Session | null) => {
    setLoading(true);
    
    try {
      if (!sessionData?.user) {
        setUser(null);
        setCachedProfile(null);
        return;
      }

      const userId = sessionData.user.id;
      
      // Auth token-ı təyin et
      try {
        if (sessionData?.access_token) {
          await client.auth.setSession({
            access_token: sessionData.access_token,
            refresh_token: sessionData.refresh_token || ''
          });
        }
      } catch (tokenErr) {
        console.warn('Error setting session token:', tokenErr);
      }

      // İstifadəçi profilini əldə et
      const userData = await fetchUserProfile(userId);
      
      if (userData) {
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [client, fetchUserProfile, setCachedProfile]);

  // Auth state listener
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    console.log('Setting up auth state listener and checking session');

    // Əvvəlcə listener-i quraşdır
    const { data: { subscription } } = client.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event);
        
        if (isMounted) {
          setSession(currentSession);
          
          // Əlavə sorğular üçün setTimeout istifadə et - async olaraq çağırma!
          if (currentSession) {
            setTimeout(() => {
              fetchUserData(currentSession);
            }, 0);
          } else {
            setUser(null);
            setCachedProfile(null);
            setLoading(false);
          }
        }
      }
    );

    // Sonra cari sessiyanı yoxla
    const checkSession = async () => {
      try {
        const { data, error } = await client.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (isMounted) {
            setSession(null);
            setUser(null);
            setCachedProfile(null);
            setLoading(false);
          }
          return;
        }
        
        console.log('Initial session check:', data.session ? 'Session exists' : 'No session');
        
        if (isMounted) {
          setSession(data.session);
          
          if (data.session) {
            // Əvvəlcə keşdən profili əldə etməyə çalışaq
            const cachedProfile = getCachedProfile();
            if (cachedProfile && cachedProfile.id === data.session.user.id) {
              setUser(cachedProfile);
              setLoading(false);
              
              // Arxa planda profili yenilə, amma gözləmə
              setTimeout(() => {
                fetchUserProfile(data.session.user.id);
              }, 0);
            } else {
              // Keşdə olmadığı halda serverdən gətir
              fetchUserData(data.session);
            }
          } else {
            setUser(null);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkSession();

    // Cleanup
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [client, fetchUserData, getCachedProfile, setCachedProfile]);

  // Login funksiyası
  const signIn = useCallback(async (email: string, password: string) => {
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
    } finally {
      // Loading halını dəyişmə, çünki auth state listener zaten bunu edir
    }
  }, [client]);

  // Çıxış funksiyası
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      await client.auth.signOut();
      setUser(null);
      setSession(null);
      setCachedProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [client, setCachedProfile]);

  // Profil yeniləmə funksiyası
  const updateProfile = useCallback(async (updates: Partial<FullUserData>): Promise<boolean> => {
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

      // Yenilənmiş profili əldə et
      const updatedUser = await fetchUserProfile(user.id);
      if (updatedUser) {
        setUser(updatedUser);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  }, [user, client, fetchUserProfile]);
  
  // İstifadəçi profilini manual yeniləmək üçün funksiya
  const refreshProfile = useCallback(async () => {
    if (!session?.user) return null;
    
    try {
      const updatedProfile = await fetchUserProfile(session.user.id);
      if (updatedProfile) {
        setUser(updatedProfile);
      }
      return updatedProfile;
    } catch (error) {
      console.error('Error refreshing profile:', error);
      return null;
    }
  }, [session, fetchUserProfile]);

  const authValue = useMemo(() => ({
    user,
    session,
    loading,
    signIn,
    signOut,
    updateProfile,
    refreshProfile
  }), [user, session, loading, signIn, signOut, updateProfile, refreshProfile]);

  return authValue;
};
