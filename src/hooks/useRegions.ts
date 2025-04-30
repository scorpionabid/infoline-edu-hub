import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, supabaseWithRetry } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { Region } from './useRegionsStore';

// Keşləmə üçün
const CACHE_DURATION = 5 * 60 * 1000; // 5 dəqiqə
let regionsCache: Region[] | null = null;
let lastFetchTime = 0;

export const useRegions = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  const fetchInProgress = useRef(false);
  const retryCount = useRef(0);
  const maxRetries = 3;
  
  const fetchRegions = useCallback(async (forceRefresh = false) => {
    // Əgər sorğu artıq icra olunursa, yeni sorğu yaratma
    if (fetchInProgress.current) {
      console.log('Regionlar üçün sorğu artıq icra olunur, yeni sorğu yaratmıram...');
      return;
    }
    
    if (!isAuthenticated) {
      console.log('İstifadəçi giriş etməyib, regionları yükləyə bilmərəm...');
      setLoading(false);
      return;
    }

    try {
      fetchInProgress.current = true;
      setLoading(true);
      setError(null);
      
      const now = Date.now();
      
      // Keşləmə yoxlaması - əgər məcburi yeniləmə tələb olunmursa
      if (!forceRefresh && regionsCache && now - lastFetchTime < CACHE_DURATION) {
        console.log('Keşlənmiş region məlumatlarını istifadə edirəm...');
        setRegions(regionsCache);
        setLoading(false);
        fetchInProgress.current = false;
        return regionsCache;
      }
      
      console.log('Regionlar məlumatlarını yükləyirəm...');
      console.log('Autentifikasiya vəziyyəti:', { isAuthenticated, userId: user?.id });
      
      // Offline-first wrapper istifadə et
      const { data, error: fetchError } = await supabaseWithRetry
        .from('regions')
        .select('*')
        .order('name', { ascending: true });
        
      if (fetchError) {
        console.error('Regionları yükləyərkən xəta baş verdi:', fetchError);
        throw fetchError;
      }
      
      console.log('Regionlar uğurla yükləndi:', data?.length || 0, 'region tapıldı', data);
      
      if (!data || data.length === 0) {
        console.warn('Diqqət: Regionlar cədvəlindən boş massiv qaytarıldı! Supabase RLS siyasətlərini yoxlayın.');
      }
      
      // Keşi yenilə
      regionsCache = data || [];
      lastFetchTime = now;
      
      // Uğurlu sorğudan sonra retry sayğacını sıfırla
      retryCount.current = 0;
      
      setRegions(data || []);
      setLoading(false);
      fetchInProgress.current = false;
      return data || [];
    } catch (err: any) {
      console.error('Regionları yükləyərkən xəta baş verdi:', err);
      
      // Şəbəkə xətasını xüsusi idarə et
      if (err.message === 'Failed to fetch' || 
          err.message?.includes('NET::ERR_INTERNET_DISCONNECTED') ||
          err.message?.includes('NetworkError')) {
        
        toast.error(t('networkError') || 'Network Error', { 
          description: t('checkYourInternetConnection') || 'Please check your internet connection'
        });
        
        // Avtomatik yenidən cəhd et
        if (retryCount.current < maxRetries) {
          retryCount.current++;
          console.log(`Şəbəkə xətası, ${retryCount.current}/${maxRetries} dəfə yenidən cəhd edirəm...`);
          
          // Növbəti cəhd üçün timeout
          setTimeout(() => {
            fetchInProgress.current = false;
            fetchRegions();
          }, 2000 * retryCount.current); // Hər cəhddə gözləmə müddətini artır
        }
      } else {
        setError(err?.message || t('errorLoadingRegions') || 'Error loading regions');
        toast.error(t('errorLoadingRegions') || 'Error loading regions', { 
          description: err?.message || t('unexpectedError') || 'An unexpected error occurred'
        });
      }
      
      // Keş varsa, köhnə məlumatları göstər
      if (regionsCache) {
        console.log('Xəta səbəbindən köhnə keşi istifadə edirəm');
        setRegions(regionsCache);
        return regionsCache;
      } else {
        setRegions([]);
        return [];
      }
    } finally {
      setLoading(false);
      fetchInProgress.current = false;
    }
  }, [isAuthenticated, user?.id, t]);

  useEffect(() => {
    // Component mount olduqda bir dəfə çağır
    fetchRegions();
    
    // Supabase real-time subscription yaradaq
    const regionsSubscription = supabase
      .channel('regions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'regions' }, (payload) => {
        console.log('Regionlar cədvəlində dəyişiklik baş verdi, yenidən yükləyirəm...', payload);
        fetchRegions();
      })
      .subscribe((status) => {
        console.log('Regions subscription status:', status);
        
        // Xəta halında yenidən qoşulmağa cəhd et
        if (status === 'CHANNEL_ERROR') {
          console.log('Realtime subscription xətası, yenidən qoşulmağa cəhd edirəm...');
          
          // 5 saniyə sonra yenidən qoşulmağa cəhd et
          setTimeout(() => {
            try {
              regionsSubscription.unsubscribe();
              
              // Yeni subscription yaradaq
              supabase
                .channel('regions-changes-retry')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'regions' }, (payload) => {
                  fetchRegions();
                })
                .subscribe();
            } catch (e) {
              console.error('Realtime subscription yenidən qoşulma xətası:', e);
            }
          }, 5000);
        }
      });
    
    // Component unmount olduqda təmizlə
    return () => {
      fetchInProgress.current = false;
      supabase.removeChannel(regionsSubscription);
    };
  }, [fetchRegions]);

  // Məlumatları manuel olaraq yeniləmək üçün refresh metodu
  const refresh = useCallback(() => {
    console.log('Regionlar məlumatlarını manuel olaraq yeniləyirəm...');
    regionsCache = null; // Keşi sıfırlayırıq
    lastFetchTime = 0;
    retryCount.current = 0; // Retry sayğacını sıfırla
    return fetchRegions(true); // Məcburi yeniləmə
  }, [fetchRegions]);

  return { regions, loading, error, fetchRegions, refresh };
};

export default useRegions;
