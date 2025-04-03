
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sector } from '@/hooks/useSectors'; 
import { toast } from 'sonner';

export const useSectorsData = () => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSectors = useCallback(async (regionId?: string) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('sectors')
        .select('*');
        
      if (regionId) {
        query = query.eq('region_id', regionId);
      }
      
      const { data, error } = await query.order('name');

      if (error) throw error;
      
      const formattedSectors: Sector[] = data.map(sector => ({
        id: sector.id,
        name: sector.name,
        description: sector.description || '',
        region_id: sector.region_id,
        status: sector.status === 'active' ? 'active' : 'inactive',
        admin_email: sector.admin_email || '',
        createdAt: sector.created_at || '',
        updatedAt: sector.updated_at || ''
      }));

      setSectors(formattedSectors);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Sektorları yükləyərkən xəta:', err);
      setError(err);
      setIsLoading(false);
      toast.error('Sektorları yükləyərkən xəta baş verdi');
    }
  }, []);

  const createSector = useCallback(async (sectorData: Omit<Sector, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newSector = {
        name: sectorData.name,
        description: sectorData.description || '',
        region_id: sectorData.region_id,
        admin_email: sectorData.admin_email || '',
        status: sectorData.status || 'active',
      };

      const { data, error } = await supabase
        .from('sectors')
        .insert([newSector])
        .select()
        .single();

      if (error) throw error;
      
      const formattedSector: Sector = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        region_id: data.region_id,
        status: data.status === 'active' ? 'active' : 'inactive',
        admin_email: data.admin_email || '',
        createdAt: data.created_at || '',
        updatedAt: data.updated_at || ''
      };

      setSectors(prev => [...prev, formattedSector]);
      toast.success('Sektor uğurla yaradıldı');
      return formattedSector;
    } catch (err: any) {
      console.error('Sektor yaradılarkən xəta:', err);
      toast.error('Sektor yaradılarkən xəta baş verdi');
      throw err;
    }
  }, []);

  const updateSector = useCallback(async (sectorData: Sector) => {
    try {
      const updatedSector = {
        name: sectorData.name,
        description: sectorData.description || '',
        region_id: sectorData.region_id,
        admin_email: sectorData.admin_email || '',
        status: sectorData.status || 'active',
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('sectors')
        .update(updatedSector)
        .eq('id', sectorData.id);

      if (error) throw error;

      setSectors(prev => prev.map(sector => 
        sector.id === sectorData.id ? {
          ...sectorData,
          updatedAt: new Date().toISOString(),
        } : sector
      ));
      
      toast.success('Sektor uğurla yeniləndi');
      return sectorData;
    } catch (err: any) {
      console.error('Sektor yenilənərkən xəta:', err);
      toast.error('Sektor yenilənərkən xəta baş verdi');
      throw err;
    }
  }, []);

  const deleteSector = useCallback(async (sectorId: string) => {
    try {
      // Əvvəlcə məktəbləri yoxla
      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('id')
        .eq('sector_id', sectorId);
      
      if (schoolsError) throw schoolsError;
      
      if (schools && schools.length > 0) {
        toast.error(`Bu sektora ${schools.length} məktəb aid olduğuna görə silmək mümkün deyil`);
        return false;
      }
      
      // Sektoru sil
      const { error } = await supabase
        .from('sectors')
        .delete()
        .eq('id', sectorId);

      if (error) throw error;

      setSectors(prev => prev.filter(sector => sector.id !== sectorId));
      toast.success('Sektor uğurla silindi');
      return true;
    } catch (err: any) {
      console.error('Sektor silinərkən xəta:', err);
      toast.error('Sektor silinərkən xəta baş verdi');
      throw err;
    }
  }, []);

  // Komponentin ilkin yüklənməsi zamanı
  useEffect(() => {
    fetchSectors();
  }, [fetchSectors]);

  return { 
    sectors, 
    isLoading, 
    error,
    fetchSectors,
    createSector,
    updateSector,
    deleteSector
  };
};
