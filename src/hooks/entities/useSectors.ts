
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Sector {
  id: string;
  name: string;
  region_id: string;
  admin_id?: string;
  admin_email?: string;
  status: 'active' | 'inactive';
  description?: string;
  completion_rate?: number;
  created_at: string;
  updated_at: string;
}

export const useSectors = (regionId?: string) => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase.from('sectors').select('*');
        
        if (regionId) {
          query = query.eq('region_id', regionId);
        }

        const { data, error: fetchError } = await query.order('name');

        if (fetchError) throw fetchError;

        // Type assertion with proper status casting
        const typedSectors = (data || []).map(sector => ({
          ...sector,
          status: (sector.status === 'active' || sector.status === 'inactive') 
            ? sector.status 
            : 'active' as 'active' | 'inactive'
        })) as Sector[];

        setSectors(typedSectors);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch sectors');
        console.error('Error fetching sectors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSectors();
  }, [regionId]);

  const createSector = async (sectorData: Omit<Sector, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .insert([{
          ...sectorData,
          status: sectorData.status || 'active'
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newSector = {
          ...data,
          status: (data.status === 'active' || data.status === 'inactive') 
            ? data.status 
            : 'active' as 'active' | 'inactive'
        } as Sector;

        setSectors(prev => [newSector, ...prev]);
        return newSector;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create sector');
      throw err;
    }
  };

  const updateSector = async (id: string, updates: Partial<Sector>) => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const updatedSector = {
          ...data,
          status: (data.status === 'active' || data.status === 'inactive') 
            ? data.status 
            : 'active' as 'active' | 'inactive'
        } as Sector;

        setSectors(prev => prev.map(sector => 
          sector.id === id ? updatedSector : sector
        ));
        return updatedSector;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update sector');
      throw err;
    }
  };

  const deleteSector = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sectors')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSectors(prev => prev.filter(sector => sector.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete sector');
      throw err;
    }
  };

  return {
    sectors,
    loading,
    error,
    createSector,
    updateSector,
    deleteSector,
    refreshSectors: () => {
      setLoading(true);
    }
  };
};
