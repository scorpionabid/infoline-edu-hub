
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { 
  SchoolPerformanceData, 
  RegionalComparisonData, 
  CategoryCompletionData, 
  SchoolDataByCategoryData, 
  DashboardStatistics,
  ReportsFilters 
} from '@/types/reports';

export const useReportsData = () => {
  const [schoolPerformanceData, setSchoolPerformanceData] = useState<SchoolPerformanceData[]>([]);
  const [regionalComparisonData, setRegionalComparisonData] = useState<RegionalComparisonData[]>([]);
  const [categoryCompletionData, setCategoryCompletionData] = useState<CategoryCompletionData[]>([]);
  const [schoolDataByCategory, setSchoolDataByCategory] = useState<SchoolDataByCategoryData[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = useAuthStore(selectUser);

  const fetchSchoolPerformanceData = async (filters: ReportsFilters = {}) => {
    try {
      let query = supabase
        .from('data_entries')
        .select(`
          school_id,
          schools!inner(name),
          // status
        `);

      // Apply role-based filtering
      if (user?.role === 'regionadmin' && user.region_id) {
        query = query.eq('schools.region_id', user.region_id);
      } else if (user?.role === 'sectoradmin' && user.sector_id) {
        query = query.eq('schools.sector_id', user.sector_id);
      } else if (user?.role === 'schooladmin' && user.school_id) {
        query = query.eq('school_id', user.school_id);
      }

      // Apply additional filters
      if (filters.region_id) {
        query = query.eq('schools.region_id', filters.region_id);
      }
      if (filters.sector_id) {
        query = query.eq('schools.sector_id', filters.sector_id);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Process the data
      const schoolStats: Record<string, any> = {};
      data?.forEach((entry: any) => {
        const schoolId = entry.school_id;
        if (!schoolStats[schoolId]) {
          schoolStats[schoolId] = {
            school_id: schoolId,
            school_name: entry.schools.name,
            total_entries: 0,
            approved_entries: 0,
            pending_entries: 0,
            rejected_entries: 0
          };
        }
        
        schoolStats[schoolId].total_entries++;
        if (entry.status === 'approved') schoolStats[schoolId].approved_entries++;
        else if (entry.status === 'pending') schoolStats[schoolId].pending_entries++;
        else if (entry.status === 'rejected') schoolStats[schoolId].rejected_entries++;
      });

      const processedData: SchoolPerformanceData[] = Object.values(schoolStats).map((school: any) => ({
        ...school,
        completion_rate: school.total_entries > 0 
          ? Math.round((school.approved_entries / school.total_entries) * 100) 
          : 0
      }));

      setSchoolPerformanceData(processedData);
    } catch (err) {
      console.error('Error fetching school performance data:', err);
      setError('School performance data could not be loaded');
    }
  };

  const fetchRegionalComparisonData = async (filters: ReportsFilters = {}) => {
    try {
      const query = supabase
        .from('schools')
        .select(`
          region_id,
          regions!inner(name),
          data_entries!inner(status)
        `);

      const { data, error } = await query;
      if (error) throw error;

      // Process the data
      const regionStats: Record<string, any> = {};
      data?.forEach((school: any) => {
        const regionId = school.region_id;
        if (!regionStats[regionId]) {
          regionStats[regionId] = {
            region_id: regionId,
            region_name: school.regions.name,
            total_schools: new Set(),
            total_entries: 0,
            approved_entries: 0
          };
        }
        
        regionStats[regionId].total_schools.add(school.id);
        school.data_entries?.forEach((entry: any) => {
          regionStats[regionId].total_entries++;
          if (entry.status === 'approved') {
            regionStats[regionId].approved_entries++;
          }
        });
      });

      const processedData: RegionalComparisonData[] = Object.values(regionStats).map((region: any) => ({
        region_id: region.region_id,
        region_name: region.region_name,
        total_schools: region.total_schools.size,
        total_entries: region.total_entries,
        approved_entries: region.approved_entries,
        avg_completion_rate: region.total_entries > 0 
          ? Math.round((region.approved_entries / region.total_entries) * 100) 
          : 0
      }));

      setRegionalComparisonData(processedData);
    } catch (err) {
      console.error('Error fetching regional comparison data:', err);
      setError('Regional comparison data could not be loaded');
    }
  };

  const fetchCategoryCompletionData = async (filters: ReportsFilters = {}) => {
    try {
      const query = supabase
        .from('data_entries')
        .select(`
          category_id,
          categories!inner(name),
          school_id,
          // status
        `);

      const { data, error } = await query;
      if (error) throw error;

      // Process the data
      const categoryStats: Record<string, any> = {};
      data?.forEach((entry: any) => {
        const categoryId = entry.category_id;
        if (!categoryStats[categoryId]) {
          categoryStats[categoryId] = {
            category_id: categoryId,
            category_name: entry.categories.name,
            schools: new Set(),
            completed_schools: new Set()
          };
        }
        
        categoryStats[categoryId].schools.add(entry.school_id);
        if (entry.status === 'approved') {
          categoryStats[categoryId].completed_schools.add(entry.school_id);
        }
      });

      const processedData: CategoryCompletionData[] = Object.values(categoryStats).map((category: any) => ({
        category_id: category.category_id,
        category_name: category.category_name,
        total_schools: category.schools.size,
        completed_schools: category.completed_schools.size,
        completion_percentage: category.schools.size > 0 
          ? Math.round((category.completed_schools.size / category.schools.size) * 100) 
          : 0
      }));

      setCategoryCompletionData(processedData);
    } catch (err) {
      console.error('Error fetching category completion data:', err);
      setError('Category completion data could not be loaded');
    }
  };

  const fetchSchoolDataByCategory = async (filters: ReportsFilters = {}) => {
    try {
      const query = supabase
        .from('data_entries')
        .select(`
          school_id,
          schools!inner(name),
          category_id,
          categories!inner(name),
          status,
          // updated_at
        `);

      const { data, error } = await query;
      if (error) throw error;

      const processedData: SchoolDataByCategoryData[] = data?.map((entry: any) => ({
        school_id: entry.school_id,
        school_name: entry.schools.name,
        category_id: entry.category_id,
        category_name: entry.categories.name,
        completion_status: entry.status,
        last_updated: entry.updated_at
      })) || [];

      setSchoolDataByCategory(processedData);
    } catch (err) {
      console.error('Error fetching school data by category:', err);
      setError('School data by category could not be loaded');
    }
  };

  const fetchDashboardStatistics = async () => {
    try {
      const [schoolsResult, categoriesResult, entriesResult] = await Promise.all([
        supabase.from('schools').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('data_entries').select('status')
      ]);

      const totalEntries = entriesResult.data?.length || 0;
      const approvedEntries = entriesResult.data?.filter(e => e.status === 'approved').length || 0;
      const pendingEntries = entriesResult.data?.filter(e => e.status === 'pending').length || 0;

      const stats: DashboardStatistics = {
        total_schools: schoolsResult.count || 0,
        total_categories: categoriesResult.count || 0,
        total_entries: totalEntries,
        overall_completion_rate: totalEntries > 0 ? Math.round((approvedEntries / totalEntries) * 100) : 0,
        pending_approvals: pendingEntries
      };

      setDashboardStats(stats);
    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
      setError('Dashboard statistics could not be loaded');
    }
  };

  const refetchData = async (filters: ReportsFilters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchSchoolPerformanceData(filters),
        fetchRegionalComparisonData(filters),
        fetchCategoryCompletionData(filters),
        fetchSchoolDataByCategory(filters),
        fetchDashboardStatistics()
      ]);
    } catch (err) {
      console.error('Error fetching reports data:', err);
      setError('Failed to load reports data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refetchData();
    }
  }, [user]);

  return {
    schoolPerformanceData,
    regionalComparisonData,
    categoryCompletionData,
    schoolDataByCategory,
    dashboardStats,
    loading,
    error,
    // refetchData
  };
};
