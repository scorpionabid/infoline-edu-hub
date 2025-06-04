
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sector } from '@/types/sector';
import { toast } from 'sonner';

export interface UseSectorsResult {
  sectors: Sector[];
  loading: boolean;
  error: Error | null;
  fetchSectors: (filterRegionId?: string) => Promise<void>;
  createSector: (sector: Omit<Sector, 'id'>) => Promise<void>;
  updateSector: (sectorId: string, updates: Partial<Sector>) => Promise<void>;
  deleteSector: (sectorId: string) => Promise<void>;
  refetch: () => void;
}

export const useSectors = (regionId?: string) => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSectors = async (filterRegionId?: string) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('sectors')
        .select('*')
        .order('name');
      
      if (filterRegionId || regionId) {
        query = query.eq('region_id', filterRegionId || regionId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setSectors(data || []);
    } catch (error) {
      console.error('Error fetching sectors:', error);
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSectors(regionId);
  }, [regionId]);

  const createSector = async (sector: Omit<Sector, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .insert([sector])
        .select()
        .single();

      if (error) throw error;

      setSectors(prev => [...prev, data]);
      toast.success('Sektor uğurla əlavə edildi');
    } catch (error) {
      console.error('Error creating sector:', error);
      toast.error('Sektor əlavə edilərkən xəta baş verdi');
      throw error;
    }
  };

  const updateSector = async (sectorId: string, updates: Partial<Sector>) => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .update(updates)
        .eq('id', sectorId)
        .select()
        .single();

      if (error) throw error;

      setSectors(prev =>
        prev.map(sector => (sector.id === sectorId ? { ...sector, ...data } : sector))
      );
      toast.success('Sektor uğurla yeniləndi');
    } catch (error) {
      console.error('Error updating sector:', error);
      toast.error('Sektor yenilənərkən xəta baş verdi');
      throw error;
    }
  };

  const deleteSector = async (sectorId: string) => {
    try {
      const { error } = await supabase
        .from('sectors')
        .delete()
        .eq('id', sectorId);

      if (error) throw error;

      setSectors(prev => prev.filter(sector => sector.id !== sectorId));
      toast.success('Sektor uğurla silindi');
    } catch (error) {
      console.error('Error deleting sector:', error);
      toast.error('Sektor silinərkən xəta baş verdi');
      throw error;
    }
  };

  return {
    sectors,
    loading,
    error,
    fetchSectors,
    createSector,
    updateSector,
    deleteSector,
    refetch: () => fetchSectors(regionId)
  };
};
