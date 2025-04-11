
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { School } from '@/data/schoolsData';
import { School as SupabaseSchool } from '@/types/supabase';
import { convertToSchoolType } from './schools/schoolTypeConverters';
import { useAuth } from '@/context/AuthContext';

interface UseSupabaseSchoolsReturn {
  schools: School[];
  loading: boolean;
  error: string | null;
  refreshSchools: () => Promise<void>;
}

export const useSupabaseSchools = (): UseSupabaseSchoolsReturn => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchSchools = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase.from('schools').select('*');
      
      // İstifadəçi roluna əsasən filtirləmək
      if (user) {
        if (user.role === 'regionadmin' && user.regionId) {
          query = query.eq('region_id', user.regionId);
        } else if (user.role === 'sectoradmin' && user.sectorId) {
          query = query.eq('sector_id', user.sectorId);
        } else if (user.role === 'schooladmin' && user.schoolId) {
          query = query.eq('id', user.schoolId);
        }
      }
      
      const { data, error: supabaseError } = await query;
      
      if (supabaseError) {
        throw supabaseError;
      }
      
      // Məktəbləri School tipinə çevirmək
      const convertedSchools = data.map((school: SupabaseSchool) => convertToSchoolType(school));
      
      setSchools(convertedSchools);
      setLoading(false);
    } catch (error) {
      console.error('Məktəbləri əldə edərkən xəta:', error);
      setError(error instanceof Error ? error.message : 'Bilinməyən xəta');
      setLoading(false);
    }
  }, [user]);

  // Məktəbləri yeniləmək funksiyası
  const refreshSchools = useCallback(async () => {
    await fetchSchools();
  }, [fetchSchools]);

  // Component mount olduqda və istifadəçi dəyişdikdə məktəbləri əldə et
  useEffect(() => {
    fetchSchools();
    
    // Yeniləmə hadisəsini dinlə
    const handleRefresh = () => {
      fetchSchools();
    };
    
    document.addEventListener('refresh-schools', handleRefresh);
    
    return () => {
      document.removeEventListener('refresh-schools', handleRefresh);
    };
  }, [fetchSchools]);

  return { schools, loading, error, refreshSchools };
};
