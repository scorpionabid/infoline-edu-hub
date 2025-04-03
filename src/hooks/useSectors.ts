
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Sector {
  id: string;
  name: string;
  description?: string;
  region_id: string;
  status: "active" | "inactive";
  admin_email?: string;
}

export const useSectors = (regionId?: string) => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSectors = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('sectors')
          .select('*')
          .eq('status', 'active');
          
        if (regionId) {
          query = query.eq('region_id', regionId);
        }
        
        const { data, error } = await query.order('name');

        if (error) throw error;

        const formattedSectors = data.map(sector => ({
          ...sector,
          status: sector.status as "active" | "inactive"
        }));
        
        setSectors(formattedSectors);
      } catch (err: any) {
        console.error('Error fetching sectors:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSectors();
  }, [regionId]);

  return { sectors, loading, error };
};
