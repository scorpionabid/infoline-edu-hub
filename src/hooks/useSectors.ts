
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sector } from '@/types/supabase';
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

// Keşləmə üçün
const CACHE_DURATION = 5 * 60 * 1000; // 5 dəqiqə
const sectorsCache: Record<string, { data: Sector[], timestamp: number }> = {};

export const useSectors = (regionId?: string) => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  const fetchInProgress = useRef(false);

  const fetchSectors = useCallback(async () => {
    // Əgər sorğu artıq icra olunursa, yeni sorğu yaratma
    if (fetchInProgress.current) {
      console.log('Sektorlar üçün sorğu artıq icra olunur, yeni sorğu yaratmıram...');
      return;
    }
    
    if (!isAuthenticated) {
      console.log('İstifadəçi giriş etməyib, sektorları yükləyə bilmərəm...');
      setLoading(false);
      return;
    }

    try {
      fetchInProgress.current = true;
      setLoading(true);
      setError(null);
      
      const cacheKey = regionId || 'all';
      const now = Date.now();
      
      // Keşləmə yoxlaması
      if (sectorsCache[cacheKey] && now - sectorsCache[cacheKey].timestamp < CACHE_DURATION) {
        console.log(`Keşlənmiş sektor məlumatlarını istifadə edirəm (${cacheKey})...`);
        setSectors(sectorsCache[cacheKey].data);
        setLoading(false);
        fetchInProgress.current = false;
        return;
      }
      
      console.log(`Sektorlar məlumatlarını yükləyirəm (RegionId: ${regionId || 'all'})...`);
      console.log('Autentifikasiya vəziyyəti:', { isAuthenticated, userId: user?.id });
      
      // Birbaşa cədvəldən sorğu
      let query = supabase
        .from('sectors')
        .select('*')
        .order('name', { ascending: true });
        
      // Əgər regionId varsa, filtrləmə əlavə et
      if (regionId) {
        query = query.eq('region_id', regionId);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) {
        console.error('Sektorları yükləyərkən xəta baş verdi:', fetchError);
        throw fetchError;
      }
      
      console.log('Sektorlar uğurla yükləndi:', data?.length || 0, 'sektor tapıldı');
      
      // Keşi yenilə
      sectorsCache[cacheKey] = {
        data: data || [],
        timestamp: now
      };
      
      setSectors(data || []);
      setLoading(false);
      fetchInProgress.current = false;
    } catch (err: any) {
      console.error('Sektorları yükləyərkən xəta baş verdi:', err);
      setError(err?.message || t('errorLoadingSectors'));
      toast.error(t('errorLoadingSectors'), { description: err?.message });
      
      // Keş varsa, köhnə məlumatları göstər
      const cacheKey = regionId || 'all';
      if (sectorsCache[cacheKey]) {
        console.log(`Xəta səbəbindən köhnə keşi istifadə edirəm (${cacheKey})`);
        setSectors(sectorsCache[cacheKey].data);
      } else {
        setSectors([]);
      }
      
      setLoading(false);
      fetchInProgress.current = false;
    }
  }, [isAuthenticated, regionId, user?.id, t]);

  useEffect(() => {
    // Component mount olduqda bir dəfə çağır
    fetchSectors();
    
    // Supabase real-time subscription yaradaq
    const sectorsSubscription = supabase
      .channel('sectors-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sectors' }, () => {
        console.log('Sektorlar cədvəlində dəyişiklik baş verdi, yenidən yükləyirəm...');
        fetchSectors();
      })
      .subscribe();
    
    // Component unmount olduqda təmizlə
    return () => {
      fetchInProgress.current = false;
      supabase.removeChannel(sectorsSubscription);
    };
  }, [fetchSectors]);

  return { sectors, loading, error, fetchSectors };
};

export default useSectors;
