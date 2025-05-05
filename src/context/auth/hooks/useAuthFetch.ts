
import { useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';
import { AuthContextType } from '../types';

/**
 * Auth üçün istifadəçi məlumatlarını fetch etmək üçün hook
 */
export const useAuthFetch = (
  setCachedUser: (user: FullUserData | null) => void,
  lastFetchedUserId: React.MutableRefObject<string | null>,
  lastFetchTime: React.MutableRefObject<number>,
  fetchingUserData: React.MutableRefObject<boolean>,
  fetchAbortController: React.MutableRefObject<AbortController | null>,
  fetchTimeoutTimer: React.MutableRefObject<NodeJS.Timeout | null>,
) => {
  /**
   * Əvvəlki fetch əməliyyatını dayandırmaq
   */
  const cancelPreviousFetch = useCallback(() => {
    if (fetchAbortController.current) {
      fetchAbortController.current.abort();
    }
    
    if (fetchTimeoutTimer.current) {
      clearTimeout(fetchTimeoutTimer.current);
    }
    
    fetchingUserData.current = false;
  }, [fetchAbortController, fetchTimeoutTimer, fetchingUserData]);
  
  /**
   * İstifadəçi məlumatlarını fetch etmək
   */
  const fetchUserData = useCallback(async (
    session: Session | null,
    forceRefresh: boolean = false,
    setUser: (user: FullUserData | null) => void,
    setAuthState: (state: Partial<{ isAuthenticated: boolean, isLoading: boolean }>) => void,
    setError: (error: string | null) => void,
    currentUser: FullUserData | null,
  ): Promise<FullUserData | null> => {
    if (!session || !session.user) {
      setUser(null);
      setCachedUser(null);
      setAuthState({ isAuthenticated: false, isLoading: false });
      return null;
    }
    
    const userId = session.user.id;
    
    // Əgər hələ məlumatlar yüklənir və eyni istifadəçi üçündürsə, çıxırıq
    if (fetchingUserData.current && !forceRefresh && lastFetchedUserId.current === userId) {
      console.log('User data is already being fetched for this user');
      return currentUser;
    }
    
    // Məlumatların yüklənmə vaxtı ilə bağlı yoxlama
    const now = Date.now();
    const CACHE_DURATION = 10000; // 10 saniyə
    if (
      !forceRefresh && 
      currentUser && 
      lastFetchedUserId.current === userId && 
      now - lastFetchTime.current < CACHE_DURATION
    ) {
      console.log('Using cached user data (time-based cache)');
      return currentUser;
    }
    
    // Əvvəlki sorğuları ləğv edirik
    cancelPreviousFetch();
    
    // Yeni abort controller yaradırıq
    fetchAbortController.current = new AbortController();
    fetchingUserData.current = true;
    
    try {
      // Timeout timer əlavə edirik
      fetchTimeoutTimer.current = setTimeout(() => {
        if (fetchingUserData.current) {
          console.warn('Fetch user data timeout, cancelling');
          cancelPreviousFetch();
          setAuthState({ isLoading: false });
        }
      }, 15000); // 15 saniyə timeout
      
      // Tokeni yeniləyirik
      try {
        if (session?.access_token) {
          await supabase.auth.setSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token || ''
          });
        }
      } catch (tokenErr) {
        console.warn('Error setting access token:', tokenErr);
      }
      
      // İstifadəçi məlumatlarını fetch edirik - rol
      const { data: userRoleData, error: userRoleError } = await supabase
        .from('user_roles')
        .select('role, region_id, sector_id, school_id')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (userRoleError) {
        console.error('Error fetching user role:', userRoleError);
      }
      
      // İstifadəçi profili
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
      }
      
      // Profil yaratırıq əgər yoxdursa
      let profile = profileData;
      if (!profile) {
        try {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              full_name: session.user.email?.split('@')[0] || 'İstifadəçi',
              language: 'az',
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .maybeSingle();
            
          if (createError) {
            console.error('Error creating new profile:', createError);
          } else {
            profile = newProfile;
          }
        } catch (e) {
          console.error('Exception creating new profile:', e);
        }
      }
      
      // İstifadəçi məlumatlarını yaradırıq
      const userData: FullUserData = {
        id: userId,
        email: session.user.email || '',
        role: userRoleData?.role || 'user',
        region_id: userRoleData?.region_id || null,
        sector_id: userRoleData?.sector_id || null,
        school_id: userRoleData?.school_id || null,
        regionId: userRoleData?.region_id || null,
        sectorId: userRoleData?.sector_id || null,
        schoolId: userRoleData?.school_id || null,
        name: profile?.full_name || session.user.email?.split('@')[0] || '',
        full_name: profile?.full_name || session.user.email?.split('@')[0] || '',
        avatar: profile?.avatar || '',
        phone: profile?.phone || '',
        position: profile?.position || '',
        language: profile?.language || 'az',
        status: profile?.status || 'active',
        lastLogin: profile?.last_login || null,
        last_login: profile?.last_login || null,
        createdAt: profile?.created_at || new Date().toISOString(),
        updatedAt: profile?.updated_at || new Date().toISOString(),
        created_at: profile?.created_at || new Date().toISOString(),
        updated_at: profile?.updated_at || new Date().toISOString(),
        notificationSettings: {
          email: true,
          system: true
        },
        adminEntity: {
          type: userRoleData?.role || 'user',
          name: profile?.full_name || '',
          schoolName: '', // Bu məlumatı sonra əldə edə bilərik
          sectorName: '',
          regionName: ''
        }
      };
      
      // İstifadəçi məlumatlarını yeniləyirik
      setUser(userData);
      setCachedUser(userData);
      setAuthState({ isAuthenticated: true, isLoading: false });
      
      // Məlumatları keşləyirik
      lastFetchedUserId.current = userId;
      lastFetchTime.current = Date.now();
      
      return userData;
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      
      if (error.name !== 'AbortError') {
        setError(error.message || 'İstifadəçi məlumatları əldə edilərkən xəta baş verdi');
        setAuthState({ isLoading: false });
      }
      
      return null;
    } finally {
      fetchingUserData.current = false;
      
      if (fetchTimeoutTimer.current) {
        clearTimeout(fetchTimeoutTimer.current);
        fetchTimeoutTimer.current = null;
      }
    }
  }, [cancelPreviousFetch, setCachedUser, fetchingUserData, fetchAbortController, fetchTimeoutTimer, lastFetchedUserId, lastFetchTime]);
  
  return {
    fetchUserData,
    cancelPreviousFetch
  };
};
