import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sector } from '@/types/supabase';
import { useAuth } from '@/context/auth';

// Keşləmə üçün
const CACHE_DURATION = 5 * 60 * 1000; // 5 dəqiqə
const sectorsCache: Record<string, { data: Sector[], timestamp: number }> = {};

export const useSectors = (regionId?: string) => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  const fetchInProgress = useRef(false);

  const fetchSectors = useCallback(async () => {
    // Əgər sorğu artıq icra olunursa, yeni sorğu yaratma
    if (fetchInProgress.current) {
      console.log('Fetch already in progress, skipping...');
      return;
    }
    
    if (!isAuthenticated) {
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
        console.log(`Using cached sectors data for ${cacheKey}`);
        setSectors(sectorsCache[cacheKey].data);
        setLoading(false);
        fetchInProgress.current = false;
        return;
      }
      
      console.log(`Fetching sectors data for regionId: ${regionId || 'all'}...`);
      console.log('Auth state:', { isAuthenticated, userId: user?.id });
      
      // Birbaşa cədvəldən sorğu
      let query = supabase
        .from('sectors')
        .select('*')
        .order('name', { ascending: true });
        
      // Əgər regionId varsa, filtrləmə əlavə et
      if (regionId) {
        query = query.eq('region_id', regionId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching sectors from table:', error);
        throw error;
      }
      
      console.log('Sectors data fetched directly from table:', data);
      
      // Keşi yenilə
      sectorsCache[cacheKey] = {
        data: data || [],
        timestamp: now
      };
      
      setSectors(data || []);
      setLoading(false);
      fetchInProgress.current = false;
    } catch (error: any) {
      console.error('Failed to fetch sectors:', error);
      setError(error.message || 'Sektorları yükləmək mümkün olmadı');
      
      // Keş varsa, köhnə məlumatları göstər
      const cacheKey = regionId || 'all';
      if (sectorsCache[cacheKey]) {
        console.log(`Using stale sectors cache for ${cacheKey} due to error`);
        setSectors(sectorsCache[cacheKey].data);
      } else {
        setSectors([]);
      }
      
      setLoading(false);
      fetchInProgress.current = false;
    }
  }, [isAuthenticated, regionId, user?.id]);

  useEffect(() => {
    // Component mount olduqda bir dəfə çağır
    fetchSectors();
    
    // Component unmount olduqda təmizlə
    return () => {
      fetchInProgress.current = false;
    };
  }, [fetchSectors]);

  return { sectors, loading, error, fetchSectors };
};
