
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedSchoolData } from '@/types/reports';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';

export const useEnhancedSchoolColumnReport = () => {
  const [data, setData] = useState<EnhancedSchoolData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = useAuthStore(selectUser);

  const fetchReport = useCallback(async (filters: {
    regionId?: string;
    sectorId?: string;
    categoryId?: string;
    status?: string[];
  } = {}) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('schools')
        .select(`
          id,
          name,
          principal_name,
          region_id,
          sector_id,
          status,
          regions!inner(id, name),
          sectors!inner(id, name)
        `);

      // Apply role-based filtering
      if (user?.role === 'regionadmin' && user.region_id) {
        query = query.eq('region_id', user.region_id);
      } else if (user?.role === 'sectoradmin' && user.sector_id) {
        query = query.eq('sector_id', user.sector_id);
      } else if (user?.role === 'schooladmin' && user.school_id) {
        query = query.eq('id', user.school_id);
      }

      // Apply additional filters
      if (filters.regionId) {
        query = query.eq('region_id', filters.regionId);
      }
      if (filters.sectorId) {
        query = query.eq('sector_id', filters.sectorId);
      }
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }

      const { data: schoolsData, error } = await query;
      if (error) throw error;

      // Process the data and calculate completion stats
      const enhancedData: EnhancedSchoolData[] = schoolsData?.map((school: any) => {
        // Calculate completion rate for each school
        const completionRate = Math.floor(Math.random() * 100); // This should be calculated from real data

        return {
          id: school.id,
          name: school.name,
          principal_name: school.principal_name,
          region_id: school.region_id,
          region_name: school.regions?.name || '',
          sector_id: school.sector_id,
          sector_name: school.sectors?.name || '',
          status: school.status,
          completion_rate: completionRate,
          columns: {},
          completion_stats: {
            total_required: 10,
            filled_count: Math.floor(completionRate / 10),
            approved_count: Math.floor(completionRate / 10),
            completion_rate: completionRate
          }
        };
      }) || [];

      setData(enhancedData);
    } catch (err: any) {
      console.error('Error fetching enhanced school report:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    data,
    loading,
    error,
    fetchReport
  };
};
