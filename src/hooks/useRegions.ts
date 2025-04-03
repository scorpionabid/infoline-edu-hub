
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Region } from '@/types/region';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export const useRegionsData = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchRegions = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('regions').select('*');

      // Rol əsaslı filtrasiya
      switch (user?.role) {
        case 'superadmin':
          // SuperAdmin bütün regionları görə bilər
          break;
        case 'regionadmin':
          query = query.eq('id', user.regionId);
          break;
        default:
          // Digər rollar üçün standart qaydalar
          if (user?.regionId) {
            query = query.eq('id', user.regionId);
          }
          break;
      }

      const { data, error } = await query.order('name');

      if (error) throw error;

      setRegions(data || []);
      setLoading(false);
    } catch (err: any) {
      console.error('Regionları yükləyərkən xəta:', err);
      setError(err);
      setLoading(false);
      toast.error('Regionları yükləyərkən xəta baş verdi');
    }
  }, [user]);

  const createRegion = useCallback(async (regionData: Omit<Region, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .insert(regionData)
        .select()
        .single();

      if (error) throw error;

      setRegions(prev => [...prev, data]);
      toast.success('Region uğurla yaradıldı');
      return data;
    } catch (err: any) {
      console.error('Region yaradılarkən xəta:', err);
      toast.error('Region yaradılarkən xəta baş verdi');
      throw err;
    }
  }, []);

  const updateRegion = useCallback(async (regionId: string, regionData: Partial<Region>) => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .update(regionData)
        .eq('id', regionId)
        .select()
        .single();

      if (error) throw error;

      setRegions(prev => prev.map(region => 
        region.id === regionId ? data : region
      ));
      
      toast.success('Region uğurla yeniləndi');
      return data;
    } catch (err: any) {
      console.error('Region yenilənərkən xəta:', err);
      toast.error('Region yenilənərkən xəta baş verdi');
      throw err;
    }
  }, []);

  const deleteRegion = useCallback(async (regionId: string) => {
    try {
      // Əvvəlcə region ilə əlaqəli sektorları və məktəbləri yoxla
      const { count: sectorCount } = await supabase
        .from('sectors')
        .select('*', { count: 'exact', head: true })
        .eq('region_id', regionId);
      
      const { count: schoolCount } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true })
        .eq('region_id', regionId);
      
      // Admin sayını yoxla
      const { count: adminCount } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('region_id', regionId);
      
      if (sectorCount && sectorCount > 0) {
        toast.error(`Bu regionda ${sectorCount} sektor var. Əvvəlcə sektorları silin.`);
        return false;
      }
      
      if (schoolCount && schoolCount > 0) {
        toast.error(`Bu regionda ${schoolCount} məktəb var. Əvvəlcə məktəbləri silin.`);
        return false;
      }
      
      // Regiona bağlı adminlər varsa xəbərdarlıq, lakin yenə də silməyə imkan ver
      if (adminCount && adminCount > 0) {
        toast.warning(`Bu regionla əlaqəli ${adminCount} admin var.`);
      }
      
      const { error } = await supabase
        .from('regions')
        .delete()
        .eq('id', regionId);

      if (error) throw error;

      setRegions(prev => prev.filter(region => region.id !== regionId));
      toast.success('Region uğurla silindi');
      return true;
    } catch (err: any) {
      console.error('Region silinərkən xəta:', err);
      toast.error('Region silinərkən xəta baş verdi');
      throw err;
    }
  }, []);
  
  // Region detallı məlumatlarını əldə et
  const getEnhancedRegions = useCallback(async () => {
    try {
      const enhancedRegions = await Promise.all(
        regions.map(async (region) => {
          const [
            { count: sectorCount },
            { count: schoolCount },
            { count: adminCount }
          ] = await Promise.all([
            supabase.from('sectors').select('*', { count: 'exact', head: true }).eq('region_id', region.id),
            supabase.from('schools').select('*', { count: 'exact', head: true }).eq('region_id', region.id),
            supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('region_id', region.id)
          ]);
          
          // Ümumi tamamlanma dərəcəsini hesabla
          const { data: schools } = await supabase
            .from('schools')
            .select('completion_rate')
            .eq('region_id', region.id);
          
          let completionRate = 0;
          if (schools && schools.length > 0) {
            const totalRate = schools.reduce((sum, school) => sum + (school.completion_rate || 0), 0);
            completionRate = Math.round(totalRate / schools.length);
          }
          
          return {
            ...region,
            sectorCount: sectorCount || 0,
            schoolCount: schoolCount || 0,
            adminCount: adminCount || 0,
            completionRate
          };
        })
      );
      
      return enhancedRegions;
    } catch (err) {
      console.error('Genişləndirilmiş region məlumatlarını əldə edərkən xəta:', err);
      return regions.map(region => ({
        ...region,
        sectorCount: 0,
        schoolCount: 0,
        adminCount: 0,
        completionRate: 0
      }));
    }
  }, [regions]);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  return {
    regions,
    loading,
    error,
    fetchRegions,
    createRegion,
    updateRegion,
    deleteRegion,
    getEnhancedRegions
  };
};

// Əlavə etdiyimiz alias export, komponentlərdə useRegions() kimi çağırılmasına imkan verir
export const useRegions = useRegionsData;

