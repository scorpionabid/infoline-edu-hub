
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';
import { Session } from '@supabase/supabase-js';

/**
 * İstifadəçi məlumatlarını əldə etmək üçün hook
 */
export const useAuthFetch = (
  setCachedUser: (userData: FullUserData | null) => void,
  lastFetchedUserId: React.MutableRefObject<string | null>,
  lastFetchTime: React.MutableRefObject<number>,
  fetchingUserData: React.MutableRefObject<boolean>,
  fetchAbortController: React.MutableRefObject<AbortController | null>,
  fetchTimeoutTimer: React.MutableRefObject<NodeJS.Timeout | null>
) => {
  /**
   * Əvvəlki sorğuları ləğv etmək
   */
  const cancelPreviousFetch = useCallback(() => {
    if (fetchAbortController.current) {
      fetchAbortController.current.abort();
      fetchAbortController.current = null;
    }
    
    if (fetchTimeoutTimer.current) {
      clearTimeout(fetchTimeoutTimer.current);
      fetchTimeoutTimer.current = null;
    }
    
    fetchingUserData.current = false;
  }, [fetchAbortController, fetchTimeoutTimer, fetchingUserData]);

  /**
   * İstifadəçi məlumatlarını əldə etmək
   */
  const fetchUserData = useCallback(async (
    session: Session | null, 
    forceRefresh: boolean,
    setUser: (user: FullUserData | null) => void,
    setAuthState: (state: any) => void,
    setError: (error: string | null) => void,
    currentUser: FullUserData | null
  ): Promise<FullUserData | null> => {
    try {
      // Session yoxdursa, istifadəçi yoxdur
      if (!session?.user?.id) {
        setUser(null);
        setAuthState({
          isAuthenticated: false,
          isLoading: false
        });
        return null;
      }
      
      const userId = session.user.id;
      const now = Date.now();
      
      // Əgər sorğu artıq göndərilibsə, yenisini göndərməyə ehtiyac yoxdur
      if (fetchingUserData.current) {
        console.log('Məlumatlar artıq yüklənir, yeni sorğu edilmir');
        return currentUser;
      }
      
      // Əgər eyni istifadəçi üçün məlumat son 5 saniyə ərzində əldə edilibsə və forceRefresh=false,
      // keşlənmiş məlumatlardan istifadə edirik
      if (!forceRefresh &&
          lastFetchedUserId.current === userId &&
          now - lastFetchTime.current < 5000 &&
          currentUser
      ) {
        console.log('Son 5 saniyədə əldə edilmiş istifadəçi məlumatları istifadə olunur');
        return currentUser;
      }
      
      // Əvvəlki sorğuları təmizləyirik
      cancelPreviousFetch();
      
      // Yeni sorğu göndəririk
      fetchingUserData.current = true;
      fetchAbortController.current = new AbortController();
      
      // Timeout təyin edirik - 10 saniyədən çox çəkərsə, sorğunu ləğv edirik
      fetchTimeoutTimer.current = setTimeout(() => {
        console.warn('İstifadəçi məlumatlarının əldə edilməsi üçün timeout - 10 saniyə keçdi');
        cancelPreviousFetch();
        
        // Əgər istifadəçi hələ də yoxdursa, xəta göstəririk
        if (!currentUser) {
          setError('İstifadəçi məlumatlarını yükləmək mümkün olmadı. Şəbəkə bağlantısını yoxlayın.');
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      }, 10000);
      
      console.log(`İstifadəçi məlumatları əldə edilir: ${userId}`);
      
      // İstifadəçi profili və rolunu paralel sorğularla əldə edirik
      const [userRolesResult, profileResult] = await Promise.all([
        supabase
          .from('user_roles')
          .select('role, region_id, sector_id, school_id')
          .eq('user_id', userId)
          .abortSignal(fetchAbortController.current?.signal)
          .maybeSingle(),
        
        supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .abortSignal(fetchAbortController.current?.signal)
          .maybeSingle()
      ]);
      
      // Sorğular tamamlandığından fetchingUserData-nı false edirik və timer-ı təmizləyirik
      fetchingUserData.current = false;
      
      if (fetchTimeoutTimer.current) {
        clearTimeout(fetchTimeoutTimer.current);
        fetchTimeoutTimer.current = null;
      }

      // İstifadəçi rolu
      let userRole = 'user';
      let region_id = null;
      let sector_id = null; 
      let school_id = null;
      
      // Rol məlumatlarını emal edirik
      if (!userRolesResult.error && userRolesResult.data) {
        userRole = userRolesResult.data.role;
        region_id = userRolesResult.data.region_id;
        sector_id = userRolesResult.data.sector_id;
        school_id = userRolesResult.data.school_id;
        console.log('Rol məlumatları əldə edildi:', userRole);
      } else if (userRolesResult.error) {
        console.warn('Rol məlumatlarını əldə edərkən xəta:', userRolesResult.error);
      } else {
        console.warn('İstifadəçi üçün rol məlumatı tapılmadı');
      }

      // Profil məlumatları
      let profile: any = null;
      
      // Profil məlumatlarını emal edirik
      if (!profileResult.error && profileResult.data) {
        profile = profileResult.data;
        console.log('Profil məlumatları əldə edildi');
      } else if (profileResult.error) {
        console.warn('Profil məlumatlarını əldə edərkən xəta:', profileResult.error);
      } else {
        console.warn('İstifadəçi üçün profil məlumatı tapılmadı');
        
        // Profil tapılmadı, yaratmağa cəhd et (asenkron)
        try {
          console.log('İstifadəçi üçün profil yaradılır:', userId);
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              full_name: session.user.email?.split('@')[0] || 'İstifadəçi',
              email: session.user.email,
              language: 'az',
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
          
          if (!createError && newProfile) {
            profile = newProfile;
            console.log('Profil uğurla yaradıldı');
          } else {
            console.error('Profil yaradıla bilmədi:', createError);
          }
        } catch (err) {
          console.error('Profil yaradıla bilmədi:', err);
        }
      }

      // Əgər hələ də profil məlumatı yoxdursa, ən azından minimal dəyərləri təyin edirik
      if (!profile) {
        profile = {
          id: userId,
          full_name: session.user.email?.split('@')[0] || 'İstifadəçi',
          email: session.user.email,
          language: 'az',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        console.log('Profil məlumatları üçün default dəyərlər istifadə edilir');
      }

      // İstifadəçi məlumatlarını birləşdir
      const userData: FullUserData = {
        id: userId,
        email: session.user.email || profile?.email || '',
        role: userRole,
        region_id: region_id,
        sector_id: sector_id,
        school_id: school_id,
        full_name: profile?.full_name || session.user.email?.split('@')[0] || '',
        avatar: profile?.avatar || '',
        phone: profile?.phone || '',
        position: profile?.position || '',
        language: profile?.language || 'az',
        status: profile?.status || 'active',
        last_login: profile?.last_login || null,
        created_at: profile?.created_at || new Date().toISOString(),
        updated_at: profile?.updated_at || new Date().toISOString()
      };

      console.log('İstifadəçi məlumatları formalaşdırıldı:', { 
        id: userData.id,
        email: userData.email,
        role: userData.role
      });
      
      // Məlumatları saxla və state-i yenilə
      setUser(userData);
      setCachedUser(userData);
      
      // Son sorğunun məlumatlarını saxla
      lastFetchedUserId.current = userId;
      lastFetchTime.current = Date.now();
      
      // Auth state-i yenilə
      setAuthState({
        isAuthenticated: true,
        isLoading: false
      });

      return userData;
    } catch (error: any) {
      // Əgər abort error deyilsə, xətanı emal et
      if (error.name !== 'AbortError') {
        console.error('İstifadəçi məlumatlarını əldə edərkən xəta:', error);
        setError(`İstifadəçi məlumatlarını əldə edərkən xəta: ${error.message}`);
      } else {
        console.log('İstifadəçi məlumatlarını əldə etmək üçün sorğu ləğv edildi');
      }
      
      // Sorğu statusunu sıfırla
      fetchingUserData.current = false;
      
      // State-i yenilə
      if (session?.user) {
        // Session var, amma məlumatları əldə etmək mümkün olmadı
        // Minimum məlumatlar ilə istifadəçini təyin et
        const minimalUser: FullUserData = {
          id: session.user.id,
          email: session.user.email || '',
          role: 'user',
          full_name: session.user.email?.split('@')[0] || 'İstifadəçi',
          language: 'az',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        setUser(minimalUser);
        setAuthState({
          isAuthenticated: true,
          isLoading: false
        });
        
        return minimalUser;
      } else {
        // Session yoxdur, istifadəçi də yoxdur
        setUser(null);
        setAuthState({
          isAuthenticated: false,
          isLoading: false
        });
        
        return null;
      }
    }
  }, [cancelPreviousFetch, fetchAbortController, fetchTimeoutTimer, fetchingUserData, lastFetchedUserId, lastFetchTime]);

  return {
    fetchUserData,
    cancelPreviousFetch
  };
};
