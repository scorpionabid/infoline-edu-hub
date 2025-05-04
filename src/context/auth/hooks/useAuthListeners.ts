
import { useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { FullUserData } from '@/types/supabase';

/**
 * Supabase auth state dinləyiciləri və session kontrolü üçün hook
 */
export const useAuthListeners = (
  authListenerInitialized: React.MutableRefObject<boolean>,
  debounceTimer: React.MutableRefObject<NodeJS.Timeout | null>,
  authSubscription: React.MutableRefObject<{
    subscription: { unsubscribe: () => void };
  } | null>,
  fetchUserData: (session: Session | null, forceRefresh: boolean) => Promise<FullUserData | null>,
  getCachedUser: () => FullUserData | null,
  setUser: (user: FullUserData | null) => void,
  setSession: (session: Session | null) => void,
  setAuthState: (state: any) => void,
  setCachedUser: (userData: FullUserData | null) => void, 
  cancelPreviousFetch: () => void,
  shouldLogAuthStateChange: () => boolean,
  user: FullUserData | null
) => {
  /**
   * Auth state dinləyicisini quraşdırmaq
   */
  const setupAuthListener = useCallback(() => {
    // Əvvəlki dinləyicini təmizləyək
    if (authSubscription.current) {
      authSubscription.current.subscription.unsubscribe();
    }
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // İlkin vəziyyəti təyin edirik
    setAuthState({ isAuthenticated: false, isLoading: true });
    
    // Keşdən istifadəçi məlumatlarını yükləyirik
    const cachedUser = getCachedUser();
    if (cachedUser) {
      console.log('Keşdən istifadəçi məlumatı istifadə olunur');
      setUser(cachedUser);
      setAuthState(prev => ({ ...prev, isAuthenticated: true }));
    }

    // Auth state dinləyicisini quraşdırırıq
    const { data } = supabase.auth.onAuthStateChange((event, currentSession) => {
      // Loqları azaltmaq üçün
      if (shouldLogAuthStateChange()) {
        console.log('Auth state dəyişikliyi:', event);
      }
      
      // Session təyin edirik
      setSession(currentSession);
      
      // Debounce təmizləyirik
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      
      // Event emal etmə
      if (event === 'SIGNED_IN') {
        // SIGNED_IN: Yeni giriş edildi
        if (!user || user.id !== currentSession?.user?.id) {
          debounceTimer.current = setTimeout(() => {
            fetchUserData(currentSession, true);
          }, 300); // debounce delay
        }
      } else if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        // TOKEN_REFRESHED, USER_UPDATED: Mövcud sessiya yeniləndi
        if (user && user.id === currentSession?.user?.id) {
          // Eyni istifadəçi, məlumatları arxa planda yeniləyirik
          debounceTimer.current = setTimeout(() => {
            fetchUserData(currentSession, false);
          }, 300); // debounce delay
        } else if (currentSession?.user) {
          // Fərqli istifadəçi, məlumatları dərhal yeniləyirik
          debounceTimer.current = setTimeout(() => {
            fetchUserData(currentSession, true);
          }, 300); // debounce delay
        }
      } else if (event === 'SIGNED_OUT') {
        // SIGNED_OUT: Çıxış edildi
        cancelPreviousFetch();
        setUser(null);
        setAuthState({
          isAuthenticated: false,
          isLoading: false
        });
        setCachedUser(null);
      }
    });
    
    // Dinləyicinin referansını saxlayırıq
    authSubscription.current = data;
  }, [
    authSubscription, 
    debounceTimer, 
    fetchUserData, 
    getCachedUser, 
    setUser, 
    setSession, 
    setAuthState, 
    setCachedUser, 
    cancelPreviousFetch,
    shouldLogAuthStateChange,
    user
  ]);
  
  /**
   * Cari sessiyani yoxlayan funksiya
   */
  const checkCurrentSession = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('İlkin sessiya yoxlaması:', session ? 'Sessiya mövcuddur' : 'Sessiya yoxdur');
      
      // Sessiya təyin edirik
      setSession(session);
      
      if (session?.user) {
        const cachedUser = getCachedUser();
        if (!cachedUser || cachedUser.id !== session.user.id) {
          // Keşdə istifadəçi yoxdursa, məlumatları yükləyirik
          await fetchUserData(session, true);
        } else {
          // Keşdən əldə edilmiş istifadəçi varsa, onu istifadə edirik
          setUser(cachedUser);
          setAuthState({
            isAuthenticated: true,
            isLoading: false
          });
          
          // Arxa planda məlumatları yeniləyirik, amma render dövrünü azaltmaq üçün
          // bunu daha uzun gecikmə ilə edirik
          setTimeout(() => {
            fetchUserData(session, false);
          }, 2000);
        }
      } else {
        setAuthState({
          isAuthenticated: false,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('İlkin sessiya yoxlama xətası:', error);
      setAuthState({
        isAuthenticated: false,
        isLoading: false
      });
    }
  }, [fetchUserData, getCachedUser, setUser, setSession, setAuthState]);

  // Auth dinləyicilərini və sessiya yoxlaması effect-i
  useEffect(() => {
    // Əgər dinləyici artıq quraşdırılıbsa, yenidən quraşdırmırıq
    if (authListenerInitialized.current) {
      return;
    }
    
    console.log('Auth state dinləyicisi quraşdırılır');
    authListenerInitialized.current = true;
    
    // Dinləyiciləri quraşdır və sessiyani yoxla
    setupAuthListener();
    checkCurrentSession();
    
    // Təmizləmə funksiyası
    return () => {
      if (authSubscription.current) {
        authSubscription.current.subscription.unsubscribe();
        authSubscription.current = null;
      }
      
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
      
      cancelPreviousFetch();
    };
  }, [
    authListenerInitialized,
    setupAuthListener,
    checkCurrentSession,
    authSubscription,
    debounceTimer,
    cancelPreviousFetch
  ]);
};
