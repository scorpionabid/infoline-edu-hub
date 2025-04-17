
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sector } from '@/types/supabase';
import { toast } from 'sonner';
import { useLanguageSafe } from '@/context/LanguageContext';

export const useSectors = (regionId?: string) => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { t } = useLanguageSafe();

  useEffect(() => {
    const fetchSectors = async () => {
      setLoading(true);
      try {
        let query = supabase.from('sectors').select('*');
        
        if (regionId) {
          query = query.eq('region_id', regionId);
        }
        
        const { data, error } = await query.order('name');
        
        if (error) throw error;
        
        setSectors(data || []);
      } catch (err: any) {
        console.error('Error fetching sectors:', err);
        setError(err);
        toast.error(t('errorOccurred'), {
          description: t('couldNotLoadSectors') || 'Could not load sectors'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSectors();
  }, [regionId, t]);

  return { sectors, loading, error };
};
