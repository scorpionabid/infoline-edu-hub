
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sector } from '@/types/sector';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export const useSectorsData = () => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchSectors = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('sectors').select('*');

      // Rol əsaslı filtrasiya
      switch (user?.role) {
        case 'superadmin':
          // SuperAdmin bütün sektorları görə bilər
          break;
        case 'regionadmin':
          query = query.eq('region_id', user.regionId);
          break;
        case 'sectoradmin':
          query = query.eq('id', user.sectorId);
          break;
        default:
          // Digər rollar üçün standart qaydalar
          if (user?.sectorId) {
            query = query.eq('id', user.sectorId);
          } else if (user?.regionId) {
            query = query.eq('region_id', user.regionId);
          }
          break;
      }

      const { data, error } = await query.order('name');

      if (error) throw error;

      setSectors(data || []);
      setLoading(false);
    } catch (err: any) {
      console.error('Sektorları yükləyərkən xəta:', err);
      setError(err);
      setLoading(false);
      toast.error('Sektorları yükləyərkən xəta baş verdi');
    }
  }, [user]);

  const createSector = useCallback(async (sectorData: Omit<Sector, 'id'>) => {
    try {
      // Sektorun region_id sahəsinin olduğunu yoxla
      if (!sectorData.region_id) {
        throw new Error('Region ID təyin edilməyib');
      }
      
      const { data, error } = await supabase
        .from('sectors')
        .insert(sectorData)
        .select()
        .single();

      if (error) throw error;

      setSectors(prev => [...prev, data]);
      toast.success('Sektor uğurla yaradıldı');
      return data;
    } catch (err: any) {
      console.error('Sektor yaradılarkən xəta:', err);
      toast.error('Sektor yaradılarkən xəta baş verdi');
      throw err;
    }
  }, []);

  const updateSector = useCallback(async (sectorId: string, sectorData: Partial<Sector>) => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .update(sectorData)
        .eq('id', sectorId)
        .select()
        .single();

      if (error) throw error;

      setSectors(prev => prev.map(sector => 
        sector.id === sectorId ? data : sector
      ));
      
      toast.success('Sektor uğurla yeniləndi');
      return data;
    } catch (err: any) {
      console.error('Sektor yenilənərkən xəta:', err);
      toast.error('Sektor yenilənərkən xəta baş verdi');
      throw err;
    }
  }, []);

  const deleteSector = useCallback(async (sectorId: string) => {
    try {
      // Əvvəlcə sektora bağlı məktəbləri yoxla
      const { count: schoolCount } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true })
        .eq('sector_id', sectorId);
      
      // Admin sayını yoxla
      const { count: adminCount } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('sector_id', sectorId);
      
      if (schoolCount && schoolCount > 0) {
        toast.error(`Bu sektorda ${schoolCount} məktəb var. Əvvəlcə məktəbləri silin.`);
        return false;
      }
      
      // Sektora bağlı adminlər varsa xəbərdarlıq, lakin yenə də silməyə imkan ver
      if (adminCount && adminCount > 0) {
        toast.warning(`Bu sektorla əlaqəli ${adminCount} admin var.`);
      }
      
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
  
  // Sektorların detallı məlumatlarını əldə et
  const getEnhancedSectors = useCallback(async () => {
    try {
      const enhancedSectors = await Promise.all(
        sectors.map(async (sector) => {
          const [
            { count: schoolCount },
            { count: adminCount },
            { data: regionData }
          ] = await Promise.all([
            supabase.from('schools').select('*', { count: 'exact', head: true }).eq('sector_id', sector.id),
            supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('sector_id', sector.id),
            supabase.from('regions').select('name').eq('id', sector.region_id).single()
          ]);
          
          // Ümumi tamamlanma dərəcəsini hesabla
          const { data: schools } = await supabase
            .from('schools')
            .select('completion_rate')
            .eq('sector_id', sector.id);
          
          let completionRate = 0;
          if (schools && schools.length > 0) {
            const totalRate = schools.reduce((sum, school) => sum + (school.completion_rate || 0), 0);
            completionRate = Math.round(totalRate / schools.length);
          }
          
          return {
            ...sector,
            schoolCount: schoolCount || 0,
            adminCount: adminCount || 0,
            regionName: regionData?.name || '',
            completionRate
          };
        })
      );
      
      return enhancedSectors;
    } catch (err) {
      console.error('Genişləndirilmiş sektor məlumatlarını əldə edərkən xəta:', err);
      return sectors.map(sector => ({
        ...sector,
        schoolCount: 0,
        adminCount: 0,
        regionName: '',
        completionRate: 0
      }));
    }
  }, [sectors]);

  useEffect(() => {
    fetchSectors();
  }, [fetchSectors]);

  return {
    sectors,
    loading,
    error,
    fetchSectors,
    createSector,
    updateSector,
    deleteSector,
    getEnhancedSectors
  };
};
