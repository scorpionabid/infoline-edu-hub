
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Region } from '@/types/supabase';
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

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
  
  const fetchRegions = useCallback(async () => {
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
      
      // Keşləmə yoxlaması
      if (regionsCache && now - lastFetchTime < CACHE_DURATION) {
        console.log('Keşlənmiş region məlumatlarını istifadə edirəm...');
        setRegions(regionsCache);
        setLoading(false);
        fetchInProgress.current = false;
        return;
      }
      
      console.log('Regionlar məlumatlarını yükləyirəm...');
      console.log('Autentifikasiya vəziyyəti:', { isAuthenticated, userId: user?.id });
      
      // Birbaşa cədvəldən sorğu
      const { data, error: fetchError } = await supabase
        .from('regions')
        .select('*')
        .order('name', { ascending: true });
        
      if (fetchError) {
        console.error('Regionları yükləyərkən xəta baş verdi:', fetchError);
        throw fetchError;
      }
      
      console.log('Regionlar uğurla yükləndi:', data?.length || 0, 'region tapıldı');
      
      // Keşi yenilə
      regionsCache = data || [];
      lastFetchTime = now;
      
      setRegions(data || []);
      setLoading(false);
      fetchInProgress.current = false;
    } catch (err: any) {
      console.error('Regionları yükləyərkən xəta baş verdi:', err);
      setError(err?.message || t('errorLoadingRegions'));
      toast.error(t('errorLoadingRegions'), { description: err?.message });
      
      // Keş varsa, köhnə məlumatları göstər
      if (regionsCache) {
        console.log('Xəta səbəbindən köhnə keşi istifadə edirəm');
        setRegions(regionsCache);
      } else {
        setRegions([]);
      }
      
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'regions' }, () => {
        console.log('Regionlar cədvəlində dəyişiklik baş verdi, yenidən yükləyirəm...');
        fetchRegions();
      })
      .subscribe();
    
    // Component unmount olduqda təmizlə
    return () => {
      fetchInProgress.current = false;
      supabase.removeChannel(regionsSubscription);
    };
  }, [fetchRegions]);

  return { regions, loading, error, fetchRegions };
};

export default useRegions;
