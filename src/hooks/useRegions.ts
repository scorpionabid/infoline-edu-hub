
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Region } from '@/types/supabase';
import { toast } from 'sonner';
import { useLanguageSafe } from '@/context/LanguageContext';

export const useRegions = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { t } = useLanguageSafe();

  useEffect(() => {
    const fetchRegions = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('regions')
          .select('*')
          .order('name');
        
        if (error) throw error;
        
        setRegions(data || []);
      } catch (err: any) {
        console.error('Error fetching regions:', err);
        setError(err);
        toast.error(t('errorOccurred'), {
          description: t('couldNotLoadRegions') || 'Could not load regions'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRegions();
  }, [t]);

  return { regions, loading, error };
};
