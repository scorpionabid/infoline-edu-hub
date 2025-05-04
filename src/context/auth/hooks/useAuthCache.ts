
import { useCallback } from 'react';
import { FullUserData } from '@/types/supabase';

// Keşləmə və digər sabitlər
const USER_CACHE_KEY = 'infolineUserCache';
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 dəqiqə (millisaniyə ilə)
const AUTH_STATE_CHANGE_LOG_KEY = 'lastAuthStateChangeLog';
const AUTH_STATE_CHANGE_INTERVAL = 5000; // 5 saniyə

/**
 * İstifadəçi məlumatlarının keşlənməsi və loqlanması üçün hook
 */
export const useAuthCache = () => {
  /**
   * Keşdən istifadəçi məlumatlarını əldə edən funksiya
   */
  const getCachedUser = useCallback(() => {
    try {
      const cachedData = localStorage.getItem(USER_CACHE_KEY);
      if (!cachedData) return null;
      
      const { data, expiry } = JSON.parse(cachedData);
      const now = Date.now();
      
      if (expiry > now) {
        return data;
      }
      
      localStorage.removeItem(USER_CACHE_KEY);
      return null;
    } catch (err) {
      console.warn('Cache oxuma xətası:', err);
      localStorage.removeItem(USER_CACHE_KEY);
      return null;
    }
  }, []);

  /**
   * İstifadəçi məlumatlarını keşə yazan funksiya
   */
  const setCachedUser = useCallback((userData: FullUserData | null) => {
    try {
      if (!userData) {
        localStorage.removeItem(USER_CACHE_KEY);
        return;
      }
      
      const expiry = Date.now() + CACHE_EXPIRY;
      localStorage.setItem(
        USER_CACHE_KEY,
        JSON.stringify({
          data: userData,
          expiry
        })
      );
    } catch (err) {
      console.warn('Cache yazma xətası:', err);
    }
  }, []);

  /**
   * Auth state dəyişiklikləri loqlanmalıdırmı?
   */
  const shouldLogAuthStateChange = useCallback(() => {
    const now = Date.now();
    const lastLog = localStorage.getItem(AUTH_STATE_CHANGE_LOG_KEY);
    
    if (!lastLog) {
      localStorage.setItem(AUTH_STATE_CHANGE_LOG_KEY, now.toString());
      return true;
    }
    
    const lastLogTime = parseInt(lastLog, 10);
    if (now - lastLogTime > AUTH_STATE_CHANGE_INTERVAL) {
      localStorage.setItem(AUTH_STATE_CHANGE_LOG_KEY, now.toString());
      return true;
    }
    
    return false;
  }, []);

  return {
    getCachedUser,
    setCachedUser,
    shouldLogAuthStateChange,
  };
};
