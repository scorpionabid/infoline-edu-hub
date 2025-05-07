import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';
import { Session } from '@supabase/supabase-js';

// Cache müddəti (ms)
const CACHE_EXPIRY = 60 * 60 * 1000; // 1 saat

// Əksik olan push və deadline xassələrini notificationSettings-ə əlavə edək
const defaultNotificationSettings = {
  email: true,
  push: true,
  deadline: true,
  system: true
};

/**
 * İstifadəçi məlumatlarını Supabase-dən əldə edən hook
 */
export const useAuthFetch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Keşlənmiş istifadəçi məlumatları
  const cachedUser = useRef<FullUserData | null>(null);
  const lastFetchTime = useRef<number>(0);
  
  // Aktiv sorğunu saxlamaq üçün ref
  const activeFetch = useRef<Promise<any> | null>(null);
  
  /**
   * Əvvəlki sorğunu ləğv etmək
   */
  const cancelPreviousFetch = useCallback(() => {
    if (activeFetch.current) {
      activeFetch.current = null;
    }
  }, []);
  
  /**
   * Keşlənmiş istifadəçi məlumatlarını təmizləmək
   */
  const setCachedUser = useCallback((userData: FullUserData | null) => {
    cachedUser.current = userData;
    lastFetchTime.current = userData ? Date.now() : 0;
  }, []);

  /**
   * İstifadəçi məlumatlarını Supabase-dən əldə etmək
   */
  const fetchUserData = useCallback(async (session: Session | null, forceRefresh: boolean = false): Promise<FullUserData | null> => {
    if (!session?.user?.id) {
      console.warn('fetchUserData: Session məlumatları tapılmadı');
      return null;
    }
    
    // Keş yoxlaması
    if (cachedUser.current && !forceRefresh && (Date.now() - lastFetchTime.current < CACHE_EXPIRY)) {
      console.log('fetchUserData: Keşlənmiş məlumatlar istifadə olunur');
      return cachedUser.current;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Supabase-dən istifadəçi məlumatlarını əldə et
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (error) {
        throw error;
      }
      
      if (!data) {
        console.warn('fetchUserData: İstifadəçi profili tapılmadı');
        return null;
      }
      
      // Rol məlumatlarını əldə et
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
        
      if (roleError) {
        console.error('fetchUserData: İstifadəçi rolu əldə edilərkən xəta:', roleError);
        throw roleError;
      }
      
      // İstifadəçi məlumatlarını birləşdir
      const fullUserData = {
        id: session.user.id,
        email: session.user.email || '',
        ...data,
        ...roleData,
        role: roleData?.role || 'user'
      };
      
      // Tip konversiyası
      const convertedUserData = convertUserData(fullUserData);
      
      // Keşləmə
      setCachedUser(convertedUserData);
      lastFetchTime.current = Date.now();
      
      return convertedUserData;
    } catch (err: any) {
      console.error('fetchUserData: İstifadəçi məlumatları əldə edilərkən xəta:', err);
      setError(err.message || 'İstifadəçi məlumatları əldə edilərkən xəta baş verdi');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setCachedUser]);
  
  // Tip konversiyası üçün yardımçı funksiya
  const convertUserData = (userData: any): FullUserData => {
    // NotificationSettings tipini düzəlt
    if (userData) {
      return {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        phone: userData.phone,
        role: userData.role,
        region_id: userData.region_id,
        sector_id: userData.sector_id,
        school_id: userData.school_id,
        status: userData.status,
        last_login: userData.last_login,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        language: userData.language,
        avatar: userData.avatar,
        position: userData.position,
        entityName: userData.entityName,
        name: userData.name,
        twoFactorEnabled: userData.twoFactorEnabled,
        notificationSettings: userData.notificationSettings 
          ? { ...defaultNotificationSettings, ...userData.notificationSettings }
          : defaultNotificationSettings
      };
    }
    
    return userData;
  };

  return {
    loading,
    error,
    fetchUserData,
    cancelPreviousFetch,
    setCachedUser
  };
};
