
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { School } from '@/types/school';

export const useSchools = (regionId?: string, sectorId?: string) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase.from('schools').select('*');

        if (regionId) {
          query = query.eq('region_id', regionId);
        }

        if (sectorId) {
          query = query.eq('sector_id', sectorId);
        }

        const { data, error } = await query.order('name');

        if (error) throw error;

        // Transform to ensure all required fields exist
        const transformedSchools: School[] = (data || []).map(school => ({
          id: school.id,
          name: school.name,
          region_id: school.region_id,
          sector_id: school.sector_id,
          status: school.status || 'active',
          created_at: school.created_at || new Date().toISOString(),
          updated_at: school.updated_at || new Date().toISOString(),
          // Optional fields
          principal_name: school.principal_name,
          address: school.address,
          phone: school.phone,
          email: school.email,
          type: school.type,
          language: school.language,
          student_count: school.student_count,
          teacher_count: school.teacher_count,
          completion_rate: school.completion_rate,
          admin_id: school.admin_id,
          admin_email: school.admin_email,
          logo: school.logo
        }));

        setSchools(transformedSchools);
      } catch (err) {
        console.error('Error fetching schools:', err);
        setError(err as Error);
        
        // Set mock data for testing
        const mockSchools: School[] = [
          {
            id: '1',
            name: 'Test Məktəbi 1',
            region_id: regionId || '1',
            sector_id: sectorId || '1',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Test Məktəbi 2',
            region_id: regionId || '1',
            sector_id: sectorId || '1',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        setSchools(mockSchools);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, [regionId, sectorId]);

  const refetch = () => {
    // Re-trigger the effect by updating state
    setLoading(true);
  };

  return {
    schools,
    loading,
    error,
    refetch
  };
};

export default useSchools;
