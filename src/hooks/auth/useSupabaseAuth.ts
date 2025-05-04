
import { useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData, Profile } from '@/types/supabase';

// NodeJS.Timeout tipini düzəltmək üçün
type TimeoutType = ReturnType<typeof setTimeout>;

interface UseSupabaseAuthReturn {
  user: FullUserData | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<FullUserData>) => Promise<boolean>;
}

export const useSupabaseAuth = (
  client = supabase
): UseSupabaseAuthReturn => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<FullUserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [lastFetchedUserId, setLastFetchedUserId] = useState<string | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<TimeoutType | null>(null);
  const CACHE_DURATION = 60000; // 1 dəqiqə (millisaniyə ilə)

  // Supabase sessiyası və istifadəçi profili məlumatlarını sinxronlaşdıran funksiya
  const fetchUserData = useCallback(async (sessionData: Session | null, forceRefresh = false) => {
    try {
      if (!sessionData?.user) {
        console.log('No session or user, clearing state');
        setUser(null);
        setLoading(false);
        return;
      }

      const userId = sessionData.user.id;
      console.log(`Fetching user data for ID: ${userId}`);
      const now = Date.now();
      
      // Daha güclü keşləmə yoxlaması
      if (!forceRefresh && 
          user && 
          lastFetchedUserId === userId && 
          now - lastFetchTime < CACHE_DURATION) {
        console.log('Using cached user data for:', userId);
        setLoading(false);
        return;
      }
      
      // Keş vaxtını və istifadəçi ID-sini yenilə
      setLastFetchTime(now);
      setLastFetchedUserId(userId);

      try {
        if (sessionData?.access_token) {
          await client.auth.setSession({
            access_token: sessionData.access_token,
            refresh_token: sessionData.refresh_token || ''
          });
          console.log('Session token set successfully');
        }
      } catch (tokenErr) {
        console.warn('Error setting session token:', tokenErr);
      }

      // Paralel sorğular göndər
      const [userRolesResult, profileResult] = await Promise.all([
        client
          .from('user_roles')
          .select('role, region_id, sector_id, school_id')
          .eq('user_id', userId)
          .maybeSingle(),
        
        client
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle()
      ]);

      // Rol məlumatları
      let userRole = 'user';
      let region_id = null;
      let sector_id = null; 
      let school_id = null;
      
      if (!userRolesResult.error && userRolesResult.data) {
        userRole = userRolesResult.data.role;
        region_id = userRolesResult.data.region_id;
        sector_id = userRolesResult.data.sector_id;
        school_id = userRolesResult.data.school_id;
        console.log('Role data fetched:', userRole);
      } else {
        console.warn('Role fetch error:', userRolesResult.error);
      }

      // Profil məlumatları
      let profile: any = null;
      
      if (!profileResult.error && profileResult.data) {
        profile = profileResult.data;
        console.log('Profile data fetched');
      } else {
        console.warn('Profile fetch error:', profileResult.error);
        
        // Profil tapılmadı, yaratmağa cəhd et
        console.log('Attempting to create profile for user:', userId);
        const createResult = await client
          .from('profiles')
          .insert({
            id: userId,
            full_name: sessionData.user.email?.split('@')[0] || 'İstifadəçi',
            email: sessionData.user.email,
            language: 'az',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .maybeSingle();
        
        if (!createResult.error && createResult.data) {
          profile = createResult.data;
          console.log('Profile created successfully');
        } else {
          console.error('Failed to create profile:', createResult.error);
          profile = {
            id: userId,
            full_name: sessionData.user.email?.split('@')[0] || 'İstifadəçi',
            email: sessionData.user.email,
            language: 'az',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
      }

      // İstifadəçi məlumatlarını birləşdir
      const userData: FullUserData = {
        id: userId,
        email: sessionData.user.email || '',
        role: userRole,
        region_id: region_id,
        sector_id: sector_id,
        school_id: school_id,
        full_name: profile?.full_name || sessionData.user.email?.split('@')[0] || '',
        avatar: profile?.avatar || '',
        phone: profile?.phone || '',
        position: profile?.position || '',
        language: profile?.language || 'az',
        status: profile?.status || 'active',
        last_login: profile?.last_login || null,
        created_at: profile?.created_at || new Date().toISOString(),
        updated_at: profile?.updated_at || new Date().toISOString(),
        adminEntity: {
          type: userRole,
          name: profile?.full_name || '',
          schoolName: '',
          sectorName: '',
          regionName: ''
        }
      };

      console.log('User data compiled:', { 
        id: userData.id,
        email: userData.email,
        role: userData.role,
        isAuthenticated: true
      });
      
      setUser(userData);
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      setLoading(false);
    }
  }, [client, user, lastFetchTime, lastFetchedUserId]);

  // Auth state listener
  useEffect(() => {
    setLoading(true);
    console.log('Setting up auth state listener and checking session');
  
    // Əvvəlcə listener-i quraşdır
    const { data: { subscription } } = client.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN') {
          console.log('SIGNED_IN event detected, session:', currentSession?.user?.email);
          setSession(currentSession);
          
          // Əvvəlki timer-i təmizlə
          if (debounceTimer) clearTimeout(debounceTimer);
          
          // Yeni timer qur
          const timer = setTimeout(() => {
            fetchUserData(currentSession);
          }, 100);
          
          setDebounceTimer(timer);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('TOKEN_REFRESHED event detected');
          setSession(currentSession);
        } else if (event === 'USER_UPDATED') {
          console.log('USER_UPDATED event detected');
          setSession(currentSession);
          
          if (debounceTimer) clearTimeout(debounceTimer);
          
          const timer = setTimeout(() => {
            fetchUserData(currentSession, true);
          }, 100);
          
          setDebounceTimer(timer);
        } else if (event === 'SIGNED_OUT') {
          console.log('SIGNED_OUT event detected');
          setUser(null);
          setSession(null);
          setLoading(false);
          setLastFetchedUserId(null);
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
          // Birbaşa fetchUserData çağır
          fetchUserData(data.session);
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
      // Təmizləmə işləri
      subscription.unsubscribe();
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [client, fetchUserData, debounceTimer]);

  // Login funksiyası
  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with:', email);
      setLoading(true);
      
      // Əvvəlcə çıxış etdiyimizdən əmin olaq
      await client.auth.signOut();
      
      // Kiçik gözləmə ilə yeni giriş
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = await client.auth.signInWithPassword({
        email,
        password
      });

      console.log('Sign in result:', result.error 
        ? `Error: ${result.error.message}` 
        : 'Success, user: ' + result.data?.user?.email);
        
      return result;
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { data: null, error };
    } finally {
      // Loading state will be updated by auth state listener
    }
  };

  // Çıxış funksiyası
  const signOut = async () => {
    try {
      console.log('Signing out...');
      setLoading(true);
      
      if (debounceTimer) clearTimeout(debounceTimer);
      
      await client.auth.signOut();
      
      console.log('Signed out successfully');
      setUser(null);
      setSession(null);
      setLastFetchedUserId(null);
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
      console.log('Updating profile for user:', user.id);
      
      const updateData: Partial<Profile> = {
        full_name: updates.full_name,
        phone: updates.phone,
        position: updates.position,
        language: updates.language,
        avatar: updates.avatar,
        status: updates.status,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await client
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        return false;
      }

      // Yenilənmiş məlumatları əldə edək
      if (session) {
        await fetchUserData(session, true);
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
