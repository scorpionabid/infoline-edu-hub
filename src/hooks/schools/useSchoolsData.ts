
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth';
import { usePermissions } from '@/services/permissions/usePermissions';
import { School } from '@/types/supabase';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { fetchSchools } from '@/services/data/schoolService';

export interface UseSchoolsDataReturn {
  schools: School[];
  loading: boolean;
  error: Error | null;
  fetchSchoolsData: (region_id?: string, sector_id?: string, status?: string) => Promise<void>;
  setSchools: React.Dispatch<React.SetStateAction<School[]>>;
}

/**
 * Məktəb məlumatlarını idarə edən hook
 */
export const useSchoolsData = (): UseSchoolsDataReturn => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { t } = useLanguage();
  const { user } = useAuth();
  const { userRole, sectorId, regionId } = usePermissions();

  const fetchSchoolsData = useCallback(async (
    region_id?: string, 
    sector_id?: string, 
    status?: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      // İstifadəçi roluna görə məhdudiyyətlər təyin edilir
      let finalRegionId = region_id;
      let finalSectorId = sector_id;
      
      if (userRole === 'regionadmin' && regionId) {
        // RegionAdmin öz regionunu görə bilər
        finalRegionId = regionId;
      } else if (userRole === 'sectoradmin' && sectorId) {
        // SectorAdmin öz sektorunu görə bilər
        finalSectorId = sectorId;
      }
      
      const data = await fetchSchools(finalRegionId, finalSectorId, status);
      setSchools(data);
    } catch (err: any) {
      console.error('Məktəb məlumatları əldə edilərkən xəta:', err);
      setError(err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotLoadSchools')
      });
    } finally {
      setLoading(false);
    }
  }, [userRole, sectorId, regionId, t]);

  // İlk yükləmə üçün
  useEffect(() => {
    fetchSchoolsData();
  }, [fetchSchoolsData]);

  return {
    schools,
    loading,
    error,
    fetchSchoolsData,
    setSchools
  };
};
