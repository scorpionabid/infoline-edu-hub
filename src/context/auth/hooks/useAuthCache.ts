
import { useCallback } from 'react';
import { FullUserData } from '@/types/supabase';

const USER_CACHE_KEY = 'auth_user_cache';
const CACHE_EXPIRY_MS = 30 * 60 * 1000; // 30 dəqiqə

/**
 * Auth konteksti üçün keşləmə və loqlama funksiyaları
 */
export const useAuthCache = () => {
  /**
   * İstifadəçi məlumatlarını keşdən almaq
   */
  const getCachedUser = useCallback(() => {
    try {
      const cachedUserStr = localStorage.getItem(USER_CACHE_KEY);
      if (!cachedUserStr) return null;
      
      const cachedUser = JSON.parse(cachedUserStr);
      const now = Date.now();
      
      if (cachedUser.expiry && cachedUser.expiry > now) {
        return cachedUser.user as FullUserData;
      }
      
      // Vaxtı bitmiş keşi təmizləyirik
      localStorage.removeItem(USER_CACHE_KEY);
      return null;
    } catch (e) {
      console.warn('User cache parsing error:', e);
      return null;
    }
  }, []);
  
  /**
   * İstifadəçi məlumatlarını keşdə saxlamaq
   */
  const setCachedUser = useCallback((user: FullUserData | null) => {
    try {
      if (!user) {
        localStorage.removeItem(USER_CACHE_KEY);
        return;
      }
      
      const expiry = Date.now() + CACHE_EXPIRY_MS;
      localStorage.setItem(
        USER_CACHE_KEY,
        JSON.stringify({
          user,
          expiry
        })
      );
    } catch (e) {
      console.warn('User cache writing error:', e);
    }
  }, []);
  
  /**
   * Auth state dəyişiklikliyinin loqlanıb-loqlanmamasını yoxlayır
   */
  const shouldLogAuthStateChange = useCallback(() => {
    // Debugging məqsədiylə filtrləmə edə bilərik
    return true;
  }, []);
  
  return {
    getCachedUser,
    setCachedUser,
    shouldLogAuthStateChange
  };
};
