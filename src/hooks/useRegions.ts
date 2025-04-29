import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Region } from '@/types/supabase';
import { useAuth } from '@/context/auth';

// Keşləmə üçün
const CACHE_DURATION = 5 * 60 * 1000; // 5 dəqiqə
let regionsCache: Region[] | null = null;
let lastFetchTime = 0;

export const useRegions = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  const fetchInProgress = useRef(false);
  
  const fetchRegions = useCallback(async () => {
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
      
      const now = Date.now();
      
      // Keşləmə yoxlaması
      if (regionsCache && now - lastFetchTime < CACHE_DURATION) {
        console.log('Using cached regions data');
        setRegions(regionsCache);
        setLoading(false);
        fetchInProgress.current = false;
        return;
      }
      
      console.log('Fetching regions data...');
      console.log('Auth state:', { isAuthenticated, userId: user?.id });
      
      // Birbaşa cədvəldən sorğu
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .order('name', { ascending: true });
        
      if (error) {
        console.error('Error fetching regions from table:', error);
        throw error;
      }
      
      console.log('Regions data fetched directly from table:', data);
      
      // Keşi yenilə
      regionsCache = data || [];
      lastFetchTime = now;
      
      setRegions(data || []);
      setLoading(false);
      fetchInProgress.current = false;
    } catch (error: any) {
      console.error('Failed to fetch regions:', error);
      setError(error.message || 'Regionları yükləmək mümkün olmadı');
      
      // Keş varsa, köhnə məlumatları göstər
      if (regionsCache) {
        console.log('Using stale regions cache due to error');
        setRegions(regionsCache);
      } else {
        setRegions([]);
      }
      
      setLoading(false);
      fetchInProgress.current = false;
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    // Component mount olduqda bir dəfə çağır
    fetchRegions();
    
    // Component unmount olduqda təmizlə
    return () => {
      fetchInProgress.current = false;
    };
  }, [fetchRegions]);

  return { regions, loading, error, fetchRegions };
};

export default useRegions;
