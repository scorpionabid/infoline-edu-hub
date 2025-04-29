import { useState, useEffect } from 'react';
import { supabase, supabaseFetch } from '@/integrations/supabase/client';
import { Sector } from '@/types/supabase';
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';
import { useLanguageSafe } from '@/context/LanguageContext';

// Keşləmə üçün
const CACHE_DURATION = 5 * 60 * 1000; // 5 dəqiqə
const sectorsCache: Record<string, { data: Sector[], timestamp: number }> = {};

export interface Sector {
  id: string;
  name: string;
  code: string;
  region_id: string;
  created_at?: string;
  updated_at?: string;
}

export const useSectors = (regionId?: string) => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const { t } = useLanguageSafe();

  useEffect(() => {
    const fetchSectors = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const cacheKey = regionId || 'all';
        const now = Date.now();
        
        // Keşləmə yoxlaması
        if (sectorsCache[cacheKey] && now - sectorsCache[cacheKey].timestamp < CACHE_DURATION) {
          console.log(`Using cached sectors data for ${cacheKey}`);
          setSectors(sectorsCache[cacheKey].data);
          setLoading(false);
          return;
        }
        
        // Əvvəlcə RPC funksiyası ilə cəhd et
        const sectorsData = await supabaseFetch<Sector[]>(async () => {
          try {
            let query = supabase.from('sectors').select('*');
            
            if (regionId) {
              query = query.eq('region_id', regionId);
            }
            
            const { data, error } = await query.order('name', { ascending: true });
              
            if (error) throw error;
            return data || [];
          } catch (err) {
            console.error('Error fetching sectors from table:', err);
            
            // Əgər birbaşa sorğu uğursuz olsa, Edge Function-a cəhd et
            console.log('Trying to fetch sectors via Edge Function...');
            const { data, error } = await supabase.functions.invoke('get-sectors', {
              body: { regionId }
            });
            if (error) throw error;
            return data || [];
          }
        });
        
        // Keşi yenilə
        sectorsCache[cacheKey] = {
          data: sectorsData,
          timestamp: now
        };
        
        setSectors(sectorsData);
      } catch (error: any) {
        console.error('Failed to fetch sectors:', error);
        setError(error.message || 'Sektorları yükləmək mümkün olmadı');
        toast.error(t('errorOccurred'), {
          description: t('couldNotLoadSectors') || 'Could not load sectors'
        });
        
        // Keş varsa, köhnə məlumatları göstər
        const cacheKey = regionId || 'all';
        if (sectorsCache[cacheKey]) {
          console.log(`Using stale sectors cache for ${cacheKey} due to error`);
          setSectors(sectorsCache[cacheKey].data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSectors();
  }, [regionId, isAuthenticated, t]);

  return { sectors, loading, error };
};

export default useSectors;
