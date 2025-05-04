
import { useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';
import { AdminEntity } from '../types';

// Sabitlər
const FETCH_TIMEOUT = 15000; // 15 saniyə maksimum sorğu müddəti

/**
 * Auth ilə əlaqəli sorğuları idarə edən hook
 */
export const useAuthFetch = (
  setCachedUser: (userData: FullUserData | null) => void,
  lastFetchedUserId: React.MutableRefObject<string | null>,
  lastFetchTime: React.MutableRefObject<number>,
  fetchingUserData: React.MutableRefObject<boolean>,
  fetchAbortController: React.MutableRefObject<AbortController | null>,
  fetchTimeoutTimer: React.MutableRefObject<NodeJS.Timeout | null>,
) => {
  /**
   * Əvvəlki sorğuları ləğv edən funksiya
   */
  const cancelPreviousFetch = useCallback(() => {
    if (fetchTimeoutTimer.current) {
      clearTimeout(fetchTimeoutTimer.current);
      fetchTimeoutTimer.current = null;
    }
    
    if (fetchAbortController.current) {
      fetchAbortController.current.abort();
      fetchAbortController.current = null;
    }
  }, [fetchTimeoutTimer, fetchAbortController]);
  
  /**
   * İstifadəçi məlumatlarını əldə edən əsas funksiya
   */
  const fetchUserData = useCallback(async (
    currentSession: Session | null, 
    forceRefresh = false,
    setUser: (user: FullUserData | null) => void,
    setAuthState: (state: any) => void,
    setError: (error: string | null) => void,
    user: FullUserData | null
  ): Promise<FullUserData | null> => {
    // Əgər artıq sorğu icra olunursa, təkrar sorğuya ehtiyac yoxdur
    if (fetchingUserData.current && !forceRefresh) {
      console.log('Artıq istifadəçi məlumatları sorğusu icra olunur, gözləyirik...');
      return user;
    }
    
    // Sessiya yoxdursa, istifadəçi məlumatlarını təmizləyirik
    if (!currentSession?.user) {
      console.log('Session yoxdur, istifadəçi məlumatlarını təmizləyirik');
      setUser(null);
      setAuthState({ isLoading: false, isAuthenticated: false });
      setCachedUser(null);
      return null;
    }
    
    const userId = currentSession.user.id;
    
    // Keş yoxlaması
    const now = Date.now();
    const shouldUseCache = !forceRefresh && 
                        user && 
                        lastFetchedUserId.current === userId && 
                        now - lastFetchTime.current < (30 * 60 * 1000); // 30 dəqiqə
                        
    if (shouldUseCache) {
      console.log('Keşdən istifadəçi məlumatı istifadə olunur:', userId);
      
      if (!user?.isAuthenticated) {
        setAuthState({ isLoading: false, isAuthenticated: true });
      }
      return user;
    }
    
    // Əvvəlki sorğuları ləğv edirik
    cancelPreviousFetch();
    
    // Yeni sorğu üçün abort controller yaradırıq
    fetchAbortController.current = new AbortController();
    
    // Sorğunun vaxtını keçməməsi üçün timeout qururuq
    fetchTimeoutTimer.current = setTimeout(() => {
      if (fetchingUserData.current) {
        console.warn('İstifadəçi məlumatlarını əldə etmə vaxtı keçdi');
        cancelPreviousFetch();
        fetchingUserData.current = false;
        
        // User artıq varsa, onu saxlayırıq, yoxdursa yüklənmə vəziyyətini sonlandırırıq
        if (user) {
          setAuthState({ isLoading: false, isAuthenticated: true });
        } else {
          setAuthState({ isLoading: false, isAuthenticated: false });
        }
      }
    }, FETCH_TIMEOUT);
    
    // Yüklənmə vəziyyətini təyin edirik
    fetchingUserData.current = true;
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Auth token yeniləməsi - session-un hələ də etibarlı olduğundan əmin oluruq
      try {
        if (currentSession.access_token) {
          await supabase.auth.setSession({
            access_token: currentSession.access_token,
            refresh_token: currentSession.refresh_token || ''
          });
        }
      } catch (tokenError) {
        console.warn('Token yeniləmə xətası:', tokenError);
      }
      
      // Rol və profil məlumatlarını paralel şəkildə əldə edirik
      const [userRolesResult, profileResult] = await Promise.all([
        supabase
          .from('user_roles')
          .select('role, region_id, sector_id, school_id')
          .eq('user_id', userId)
          .maybeSingle(),
        
        supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle()
      ]);

      // Rol məlumatları
      const userRole = userRolesResult.data?.role || 'user';
      const region_id = userRolesResult.data?.region_id || null;
      const sector_id = userRolesResult.data?.sector_id || null;
      const school_id = userRolesResult.data?.school_id || null;
      
      // Xəta halında rolları yaratmağa çalışaq
      if (userRolesResult.error && userRolesResult.error.code === 'PGRST116') {
        try {
          // Default rol yaratmağa cəhd edirik
          console.log('İstifadəçi rolu tapılmadı, default rol yaratmağa cəhd edilir');
          await supabase.from('user_roles').insert({
            user_id: userId,
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        } catch (createRoleError) {
          console.warn('Rol yaratma xətası:', createRoleError);
        }
      }
      
      // Profil məlumatları
      const profile = profileResult.data || {
        id: userId,
        full_name: currentSession.user.email?.split('@')[0] || 'İstifadəçi',
        email: currentSession.user.email,
        language: 'az',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Profil tapılmadısa profil yaratmağa çalışırıq
      if (profileResult.error && profileResult.error.code === 'PGRST116') {
        try {
          console.log('İstifadəçi profili tapılmadı, profil yaratmağa cəhd edilir');
          await supabase
            .from('profiles')
            .insert({
              id: userId,
              full_name: currentSession.user.email?.split('@')[0] || 'İstifadəçi',
              email: currentSession.user.email,
              language: 'az',
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
        } catch (createProfileError) {
          console.warn('Profil yaratma xətası:', createProfileError);
        }
      }

      // Admin qurumuna aid məlumatlar
      let adminEntity: AdminEntity = { 
        type: userRole,
        name: profile.full_name || currentSession.user.email?.split('@')[0] || ''
      };

      // Rola görə əlavə admin qurumu məlumatları
      if (userRole === 'regionadmin' && region_id) {
        try {
          const { data } = await supabase
            .from('regions')
            .select('name')
            .eq('id', region_id)
            .single();
            
          if (data) {
            adminEntity.name = data.name || adminEntity.name;
            adminEntity.regionName = data.name;
          }
        } catch (error) {
          console.warn('Region məlumatları əldə edilə bilmədi:', error);
        }
      } else if (userRole === 'sectoradmin' && sector_id) {
        try {
          const { data } = await supabase
            .from('sectors')
            .select('name, regions(name)')
            .eq('id', sector_id)
            .single();
            
          if (data) {
            adminEntity.name = data.name || adminEntity.name;
            adminEntity.sectorName = data.name;
            adminEntity.regionName = data.regions?.name;
          }
        } catch (error) {
          console.warn('Sektor məlumatları əldə edilə bilmədi:', error);
        }
      } else if (userRole === 'schooladmin' && school_id) {
        try {
          const { data } = await supabase
            .from('schools')
            .select('name, sectors(name), regions(name)')
            .eq('id', school_id)
            .single();
            
          if (data) {
            adminEntity.name = data.name || adminEntity.name;
            adminEntity.schoolName = data.name;
            adminEntity.sectorName = data.sectors?.name;
            adminEntity.regionName = data.regions?.name;
          }
        } catch (error) {
          console.warn('Məktəb məlumatları əldə edilə bilmədi:', error);
        }
      }

      // Xəta baş verə bilər - Abort signal ilə yoxlayırıq
      if (fetchAbortController.current?.signal.aborted) {
        console.log('İstifadəçi məlumatları sorğusu ləğv edildi');
        return null;
      }

      // İstifadəçi məlumatlarını birləşdirik
      const fullUserData: FullUserData = {
        id: userId,
        email: currentSession.user.email || profile.email || '',
        full_name: profile.full_name || currentSession.user.email?.split('@')[0] || '',
        role: userRole,
        avatar: profile.avatar || '',
        region_id: region_id,
        sector_id: sector_id,
        school_id: school_id,
        phone: profile.phone || '',
        position: profile.position || '',
        language: profile.language || 'az',
        status: profile.status || 'active',
        last_login: profile.last_login || null,
        created_at: profile.created_at || new Date().toISOString(),
        updated_at: profile.updated_at || new Date().toISOString(),
        adminEntity: adminEntity,
        // Əlavə tətbiq xüsusiyyətləri üçün alias-lar
        name: profile.full_name || currentSession.user.email?.split('@')[0] || '',
        regionId: region_id,
        sectorId: sector_id,
        schoolId: school_id,
        lastLogin: profile.last_login || null,
        createdAt: profile.created_at || new Date().toISOString(),
        updatedAt: profile.updated_at || new Date().toISOString(),
      };

      // Sorğu artıq ləğv edilməyibsə, yeni məlumatları tətbiq edirik
      if (!fetchAbortController.current?.signal.aborted) {
        // Keş və referansları yeniləyirik
        lastFetchedUserId.current = userId;
        lastFetchTime.current = now;
        setCachedUser(fullUserData);
        
        // Render sayını optimallaşdırmaq üçün əvvəlcə istifadəçi məlumatlarını təyin edirik
        setUser(fullUserData);
        
        // Sonra autentifikasiya vəziyyətini yeniləyirik
        setAuthState({
          isAuthenticated: true,
          isLoading: false
        });
      }
      
      return fullUserData;
    } catch (error) {
      console.error('İstifadəçi məlumatları yükləmə xətası:', error);
      setError(error instanceof Error ? error.message : String(error));
      
      // Əgər istifadəçi məlumatları varsa, autentifikasiya vəziyyətini saxlayırıq
      if (user) {
        setAuthState({
          isAuthenticated: true,
          isLoading: false
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          isLoading: false
        });
      }
      
      return null;
    } finally {
      // Clean-up
      fetchingUserData.current = false;
      cancelPreviousFetch();
    }
  }, [cancelPreviousFetch, setCachedUser]);

  return {
    fetchUserData,
    cancelPreviousFetch,
  };
};
