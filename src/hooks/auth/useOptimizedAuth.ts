
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData, UserRole } from '@/types/supabase';

// User profile üçün local storage keşləmə
const USER_PROFILE_CACHE_KEY = 'user_profile';
const USER_SESSION_CACHE_KEY = 'user_session';
const CACHE_EXPIRY_MS = 30 * 60 * 1000; // 30 dəqiqə
const DEBOUNCE_MS = 300; // Debounce vaxtı millisaniyə ilə

interface UseOptimizedAuthReturn {
  user: FullUserData | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<FullUserData>) => Promise<boolean>;
  refreshProfile: () => Promise<FullUserData | null>;
  isAuthenticated: boolean;
  clearError: () => void;
}

export const useOptimizedAuth = (
  client = supabase,
  initialSession?: Session | null
): UseOptimizedAuthReturn => {
  const [session, setSession] = useState<Session | null>(initialSession || null);
  const [user, setUser] = useState<FullUserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isAuthStateChangeActive, setIsAuthStateChangeActive] = useState<boolean>(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // İstifadəçinin autentifikasiya statusunu hesablayırıq
  const isAuthenticated = useMemo(() => {
    return !!session && !!user;
  }, [session, user]);

  // Xətanı təmizləmə funksiyası
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Profil keşini əldə et
  const getCachedProfile = useCallback(() => {
    try {
      const cachedProfileStr = localStorage.getItem(USER_PROFILE_CACHE_KEY);
      if (!cachedProfileStr) return null;
      
      const cachedProfile = JSON.parse(cachedProfileStr);
      const now = new Date().getTime();
      
      if (cachedProfile.expiry && cachedProfile.expiry > now) {
        console.log('Keşdən istifadəçi məlumatı istifadə olunur');
        return cachedProfile.data;
      }
      
      // Vaxtı keçmiş keşi sil
      localStorage.removeItem(USER_PROFILE_CACHE_KEY);
      return null;
    } catch (e) {
      console.warn('Profil keşi oxuma xətası:', e);
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
      console.warn('Profil keşi yazma xətası:', e);
    }
  }, []);

  // İstifadəçi profil məlumatlarını əldə et
  const fetchUserProfile = useCallback(async (userId: string): Promise<FullUserData | null> => {
    try {
      console.log('İstifadəçi profili üçün sorğu:', userId);
      
      // Əvvəlcə keşdən yoxla
      const cachedProfile = getCachedProfile();
      if (cachedProfile && cachedProfile.id === userId) {
        console.log('Keşlənmiş profil istifadə edilir');
        return cachedProfile;
      }

      // Alternativ RPC funksiyası ilə istifadəçi rolunu əldə et
      const { data: roleData, error: roleError } = await client.rpc('get_user_role_safe');
      
      let userRole: UserRole = 'user';
      if (!roleError && roleData) {
        userRole = roleData as UserRole;
      } else {
        console.warn('RPC role sorğu xətası:', roleError);
      }

      // İstifadəçi profilini əldə et
      const { data: profileData, error: profileError } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (profileError) {
        console.error('Profil sorğu xətası:', profileError);
      }
      
      // İstifadəçi rolunu əldə et
      const { data: userRoleData, error: userRoleError } = await client
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (userRoleError) {
        console.warn('İstifadəçi rolu sorğu xətası:', userRoleError);
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
      console.error('İstifadəçi məlumatlarını əldə etmə xətası:', error);
      return null;
    }
  }, [client, getCachedProfile, setCachedProfile]);

  // İstifadəçi sessiyasını və profilini fetch edən əsas funksiya
  const fetchUserData = useCallback(async (sessionData: Session | null) => {
    if (isAuthStateChangeActive) {
      console.log('Auth state dəyişikliyi aktivdir, sorğu dayandırıldı');
      return;
    }
    
    setIsAuthStateChangeActive(true);
    setLoading(true);
    
    try {
      if (!sessionData?.user) {
        setUser(null);
        setCachedProfile(null);
        setLoading(false);
        setIsAuthStateChangeActive(false);
        return;
      }

      const userId = sessionData.user.id;
      
      try {
        if (sessionData?.access_token) {
          await client.auth.setSession({
            access_token: sessionData.access_token,
            refresh_token: sessionData.refresh_token || ''
          });
        }
      } catch (tokenErr) {
        console.warn('Session tokenini təyin edərkən xəta:', tokenErr);
      }

      // İstifadəçi profilini əldə et
      const userData = await fetchUserProfile(userId);
      
      if (userData) {
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error: any) {
      console.error('fetchUserData xətası:', error);
      setError(error);
      setUser(null);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setIsAuthStateChangeActive(false);
      }, 500);
    }
  }, [client, fetchUserProfile, setCachedProfile, isAuthStateChangeActive]);

  // Auth state listener
  useEffect(() => {
    let isMounted = true;
    console.info('Auth state dinləyicisi quraşdırılır');
    
    // Auth state dəyişikliklərinə abunə olmaq
    const { data: { subscription } } = client.auth.onAuthStateChange(
      (event, currentSession) => {
        if (!isMounted) return;
        
        // Debounce tətbiq et
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
        
        const timer = setTimeout(() => {
          console.log('Auth state dəyişdi:', event);
          
          setSession(currentSession);
          
          if (currentSession) {
            const cachedProfile = getCachedProfile();
            if (cachedProfile && cachedProfile.id === currentSession.user.id) {
              setUser(cachedProfile);
              // Yüklənməni dayandır, profili arxa planda yeniləyərik
              setLoading(false);
            }
            
            // İstifadəçi məlumatlarını çəkmək üçün 100ms gözlə
            setTimeout(() => {
              fetchUserData(currentSession);
            }, 100);
          } else {
            setUser(null);
            setCachedProfile(null);
            setLoading(false);
          }
        }, DEBOUNCE_MS);
        
        setDebounceTimer(timer);
      }
    );

    // İlk sessiya yoxlaması
    const checkSession = async () => {
      try {
        const { data, error } = await client.auth.getSession();
        
        if (error) {
          console.error('Sessiya əldə etmə xətası:', error);
          if (isMounted) {
            setSession(null);
            setUser(null);
            setCachedProfile(null);
            setLoading(false);
          }
          return;
        }
        
        console.log('İlkin sessiya yoxlaması:', data.session ? 'Sessiya mövcuddur' : 'Sessiya yoxdur');
        
        if (isMounted) {
          setSession(data.session);
          
          if (data.session) {
            // Əvvəlcə keşdən profili əldə et
            const cachedProfile = getCachedProfile();
            if (cachedProfile && cachedProfile.id === data.session.user.id) {
              setUser(cachedProfile);
              setLoading(false);
            }
            
            // Arxa planda profili yenilə
            setTimeout(() => {
              fetchUserData(data.session);
            }, 100);
          } else {
            setUser(null);
            setCachedProfile(null);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Sessiya yoxlama xətası:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // İlkin yüklənmədə sessiyanı yoxla
    checkSession();

    // Təmizləmə
    return () => {
      isMounted = false;
      subscription.unsubscribe();
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [client, fetchUserData, getCachedProfile, setCachedProfile, debounceTimer]);

  // Login funksiyası
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      console.log('Giriş cəhdi:', email);
      setLoading(true);
      setError(null);
      
      const result = await client.auth.signInWithPassword({
        email,
        password
      });

      if (result.error) {
        setError(result.error);
        console.error('Giriş xətası:', result.error.message);
      } else {
        console.log('Uğurlu giriş:', result.data.user?.email);
      }
      
      return result;
    } catch (error: any) {
      console.error('Giriş xətası:', error);
      setError(error);
      return { data: null, error };
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
    } catch (error: any) {
      console.error('Çıxış xətası:', error);
      setError(error);
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
        console.error('Profil yeniləmə xətası:', error);
        return false;
      }

      // Yenilənmiş profili əldə et
      const updatedUser = await fetchUserProfile(user.id);
      if (updatedUser) {
        setUser(updatedUser);
      }
      
      return true;
    } catch (error) {
      console.error('Profil yeniləmə xətası:', error);
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
      console.error('Profil yeniləmə xətası:', error);
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
    refreshProfile,
    isAuthenticated,
    clearError,
    error
  }), [
    user, 
    session, 
    loading, 
    signIn, 
    signOut, 
    updateProfile, 
    refreshProfile, 
    isAuthenticated, 
    clearError,
    error
  ]);

  return authValue;
};
