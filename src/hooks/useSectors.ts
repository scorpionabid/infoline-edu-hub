import { useState, useEffect } from 'react';
import { supabase, supabaseFetch } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';
import { useLanguageSafe } from '@/context/LanguageContext';

export interface Sector {
  id: string;
  name: string;
  code: string;
  region_id: string;
  created_at?: string;
  updated_at?: string;
}

export const useSectors = (regionId?: string | null) => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { session } = useAuth();
  const { t } = useLanguageSafe();

  useEffect(() => {
    const fetchSectors = async () => {
      if (!session) {
        console.warn('Session yoxdur, sektorlar yüklənə bilməz');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await supabaseFetch(async () => {
          let query = supabase.from('sectors').select('*');

          if (regionId) {
            query = query.eq('region_id', regionId);
          }

          const { data, error } = await query.order('name');

          if (error) throw error;
          return data;
        });

        console.log(`${result?.length || 0} sektor yükləndi${regionId ? ' (region: ' + regionId + ')' : ''}`);
        setSectors(result || []);
      } catch (err: any) {
        console.error('Sektorları yükləyərkən xəta:', err);
        setError(new Error(err.message || 'Sektorları yükləmək mümkün olmadı'));
        toast.error(t('errorOccurred'), {
          description: t('couldNotLoadSectors') || 'Could not load sectors'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSectors();
  }, [regionId, session, t]);

  return { sectors, loading, error };
};

export default useSectors;
