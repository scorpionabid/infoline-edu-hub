import { useState, useEffect } from 'react';
import { supabase, supabaseFetch } from '@/integrations/supabase/client';
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
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchRegions = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const now = Date.now();
        
        // Keşləmə yoxlaması
        if (regionsCache && now - lastFetchTime < CACHE_DURATION) {
          console.log('Using cached regions data');
          setRegions(regionsCache);
          setLoading(false);
          return;
        }
        
        // Əvvəlcə RPC funksiyası ilə cəhd et
        const regionsData = await supabaseFetch<Region[]>(async () => {
          try {
            const { data, error } = await supabase
              .from('regions')
              .select('*')
              .order('name', { ascending: true });
              
            if (error) throw error;
            return data || [];
          } catch (err) {
            console.error('Error fetching regions from table:', err);
            
            // Əgər birbaşa sorğu uğursuz olsa, Edge Function-a cəhd et
            console.log('Trying to fetch regions via Edge Function...');
            const { data, error } = await supabase.functions.invoke('get-regions', {});
            if (error) throw error;
            return data || [];
          }
        });
        
        // Keşi yenilə
        regionsCache = regionsData;
        lastFetchTime = now;
        
        setRegions(regionsData);
      } catch (error: any) {
        console.error('Failed to fetch regions:', error);
        setError(error.message || 'Regionları yükləmək mümkün olmadı');
        // Keş varsa, köhnə məlumatları göstər
        if (regionsCache) {
          console.log('Using stale regions cache due to error');
          setRegions(regionsCache);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRegions();
  }, [isAuthenticated]);

  return { regions, loading, error };
};

export default useRegions;
