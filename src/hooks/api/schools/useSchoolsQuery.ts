
import { useState, useEffect } from 'react';
import { School } from '@/types/school';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { toast } from 'sonner';

interface UseSchoolsQueryProps {
  sectorId?: string;
  regionId?: string;
  status?: string;
  enabled?: boolean;
}

// Real Supabase integration for schools with enhanced sector filtering
export const useSchoolsQuery = (props: UseSchoolsQueryProps = {}) => {
  const { sectorId, regionId, status = 'active', enabled = true } = props;
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const user = useAuthStore(selectUser);

  // Calculate completion rate for a school based on real data_entries
  const calculateSchoolCompletion = async (schoolId: string): Promise<number> => {
    try {
      const { data: entries, error } = await supabase
        .from('data_entries')
        .select('id, status, column_id')
        .eq('school_id', schoolId);

      if (error) throw error;

      if (!entries || entries.length === 0) return 0;

      const approvedEntries = entries.filter(entry => entry.status === 'approved');
      return Math.round((approvedEntries.length / entries.length) * 100);
    } catch (error) {
      console.error('Error calculating completion for school:', schoolId, error);
      return 0;
    }
  };

  // Fetch schools based on user role and permissions with completion rates
  const fetchSchools = async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);
      
      let query = supabase
        .from('schools')
        .select('*')
        .eq('status', status)
        .order('name', { ascending: true });
      
      // Apply filtering based on props or user role
      if (sectorId) {
        console.log(`[useSchoolsQuery] Applying sector filter: sector_id = ${sectorId}`);
        query = query.eq('sector_id', sectorId);
      } else if (regionId) {
        console.log(`[useSchoolsQuery] Applying region filter: region_id = ${regionId}`);
        query = query.eq('region_id', regionId);
      } else if (user?.role === 'sectoradmin' && user.sector_id) {
        console.log(`[useSchoolsQuery] Applying user sector filter: sector_id = ${user.sector_id}`);
        query = query.eq('sector_id', user.sector_id);
      } else if (user?.role === 'regionadmin' && user.region_id) {
        console.log(`[useSchoolsQuery] Applying user region filter: region_id = ${user.region_id}`);
        query = query.eq('region_id', user.region_id);
      } else {
        console.log('[useSchoolsQuery] No filter applied - showing all schools');
      }
      
      console.log('[useSchoolsQuery] Executing query...');
      const { data, error: fetchError } = await query;
      console.log('[useSchoolsQuery] Query result:', { data, error: fetchError });
      
      if (fetchError) {
        throw new Error(fetchError.message);
      }
      
      // Transform schools data and calculate completion rates
      const schoolsData: School[] = await Promise.all(
        (data || []).map(async (school) => {
          const completion_rate = await calculateSchoolCompletion(school.id);
          
          return {
            id: school.id,
            name: school.name || '',
            region_id: school.region_id || '',
            sector_id: school.sector_id || '',
            status: (school.status as 'active' | 'inactive') || 'active',
            created_at: school.created_at || new Date().toISOString(),
            updated_at: school.updated_at || new Date().toISOString(),
            // Additional fields from database
            principal_name: school.principal_name,
            address: school.address,
            phone: school.phone,
            email: school.email,
            student_count: school.student_count,
            teacher_count: school.teacher_count,
            type: school.type,
            language: school.language,
            completion_rate,
            logo: school.logo,
            admin_email: school.admin_email,
            admin_id: school.admin_id
          };
        })
      );
      
      setSchools(schoolsData);
      setLoading(false);
      
      console.log(`[useSchoolsQuery] Loaded ${schoolsData.length} schools`);
      console.log('[useSchoolsQuery] Schools with completion rates:', {
        schoolsCount: schoolsData.length,
        avgCompletion: schoolsData.reduce((sum, s) => sum + s.completion_rate, 0) / schoolsData.length
      });
      
    } catch (err: any) {
      console.error('Error fetching schools:', err);
      setError(err);
      setSchools([]);
      setIsError(true);
      toast.error('Məktəblər yüklənilərkən xəta baş verdi', {
        description: err.message
      });
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  // Fetch schools on mount and when dependencies change
  useEffect(() => {
    if (enabled) {
      fetchSchools();
    }
  }, [enabled, sectorId, regionId, status, user?.id, user?.role, user?.sector_id, user?.region_id]);

  const refetch = async () => {
    return await fetchSchools();
  };

  return {
    schools,
    loading,
    isLoading,
    isError,
    error,
    refetch
  };
};

export default useSchoolsQuery;
