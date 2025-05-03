
import { useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { FullUserData, UserRole } from '@/types/supabase';

// NodeJS.Timeout tipini düzəltmək üçün
import type { Timeout } from 'node:timers';
type TimeoutType = Timeout;

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
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [lastFetchedUserId, setLastFetchedUserId] = useState<string | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<TimeoutType | null>(null);
  const CACHE_DURATION = 60000; // 1 dəqiqə (millisaniyə ilə)

  // Supabase sessiyası və istifadəçi profili məlumatlarını sinxronlaşdıran funksiya
  const fetchUserData = useCallback(async (sessionData: Session | null, forceRefresh = false) => {
    try {
      if (!sessionData?.user) {
        setUser(null);
        setLoading(false);
        return;
      }

      const userId = sessionData.user.id;
      const now = Date.now();
      
      // Daha güclü keşləmə yoxlaması - son sorğudan 1 dəqiqə keçməyibsə, 
      // məcburi yeniləmə tələb olunmursa və eyni istifadəçi ID-si üçün sorğu göndərilirsə
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

      // Paralel sorğular göndər
      const [roleResult, profileResult] = await Promise.all([
        // Metod 1: user_roles cədvəlini sorğula
        client
          .from('user_roles')
          .select('role, region_id, sector_id, school_id')
          .eq('user_id', userId)
          .maybeSingle(),
        
        // Metod 2: profiles cədvəlini sorğula
        client
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle()
      ]);

      // Rol məlumatlarını əldə et
      let userRole: UserRole = 'user';
      let region_id = null;
      let sector_id = null; 
      let school_id = null;
      
      if (!roleResult.error && roleResult.data) {
        userRole = roleResult.data.role as UserRole;
        region_id = roleResult.data.region_id;
        sector_id = roleResult.data.sector_id;
        school_id = roleResult.data.school_id;
        console.log('Role fetched via direct query:', userRole);
      } else {
        console.warn('Direct role query error:', roleResult.error);
      }

      // Profil məlumatlarını əldə et
      let profile: any = null;
      
      if (!profileResult.error && profileResult.data) {
        profile = profileResult.data;
      } else {
        console.warn('Profile fetch error:', profileResult.error);
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
  }, [client, user, lastFetchTime, lastFetchedUserId]);

  // Auth state listener
  useEffect(() => {
    setLoading(true);
    console.log('Setting up auth state listener and checking session');
  
    // Əvvəlcə listener-i quraşdır
    const { data: { subscription } } = client.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event);
        
        // Yalnız əhəmiyyətli hadisələrdə məlumatları yenilə
        if (event === 'SIGNED_IN') {
          setSession(currentSession);
          
          // Əvvəlki timer-i təmizlə
          if (debounceTimer) clearTimeout(debounceTimer);
          
          // Yeni timer qur
          const timer = setTimeout(() => {
            fetchUserData(currentSession);
          }, 300); // 300ms debounce
          
          setDebounceTimer(timer);
        } else if (event === 'TOKEN_REFRESHED') {
          // Token yeniləndikdə yalnız session-u yenilə, məlumatları yeniləmə
          setSession(currentSession);
          console.log('Token refreshed, session updated but not fetching user data again');
        } else if (event === 'USER_UPDATED') {
          setSession(currentSession);
          
          // Əvvəlki timer-i təmizlə
          if (debounceTimer) clearTimeout(debounceTimer);
          
          // Yeni timer qur
          const timer = setTimeout(() => {
            fetchUserData(currentSession, true); // forceRefresh=true
          }, 300); // 300ms debounce
          
          setDebounceTimer(timer);
        } else if (event === 'SIGNED_OUT') {
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
      // Əvvəlki timer-i təmizlə
      if (debounceTimer) clearTimeout(debounceTimer);
      
      await client.auth.signOut();
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
      // Paralel sorğular göndər
      const [profileResult, roleResult] = await Promise.all([
        // 1. profiles cədvəlini yenilə
        client
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
          .eq('id', user.id),
        
        // 2. user_roles cədvəlini yenilə (əgər rol, region, sektor və ya məktəb dəyişibsə)
        (updates.role || updates.region_id || updates.sector_id || updates.school_id) 
          ? client
              .from('user_roles')
              .update({
                role: updates.role || user.role,
                region_id: updates.region_id || user.region_id,
                sector_id: updates.sector_id || user.sector_id,
                school_id: updates.school_id || user.school_id,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', user.id)
          : { error: null } // Əgər rol məlumatları dəyişməyibsə, heç bir sorğu göndərmə
      ]);

      if (profileResult.error) {
        console.error('Error updating profile:', profileResult.error);
        return false;
      }

      if (roleResult.error) {
        console.error('Error updating user role:', roleResult.error);
        return false;
      }

      // Yenilənmiş məlumatları əldə edək
      if (session) {
        await fetchUserData(session, true); // forceRefresh=true
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
