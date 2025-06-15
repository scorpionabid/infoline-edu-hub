
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { reportCache, CacheHelpers } from '@/services/reports/cacheService';
import { 
  DetailedSchoolPerformanceData,
  DetailedRegionalComparisonData,
  DetailedCategoryCompletionData,
  DetailedSchoolDataByCategoryData,
  DetailedDashboardStatistics,
  ReportsFilters
} from '@/types/report';

// Safe type casting helper
const safeCastArray = <T>(data: any): T[] => {
  if (Array.isArray(data)) {
    return data as T[];
  }
  return [];
};

const safeCastObject = <T>(data: any): T | null => {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return data as T;
  }
  return null;
};

export const useReportsData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to get school performance report with caching
  const getSchoolPerformanceReport = async (
    filters: ReportsFilters = {},
    useCache = true
  ): Promise<DetailedSchoolPerformanceData[]> => {
    try {
      setLoading(true);
      setError(null);

      // Try cache first if enabled
      if (useCache) {
        const cacheKey = { ...filters, type: 'school_performance' };
        const cached = reportCache.get<DetailedSchoolPerformanceData[]>('school_performance', cacheKey);
        if (cached) {
          setLoading(false);
          return cached;
        }
      }

      const { data, error } = await supabase.rpc('get_school_performance_report', {
        p_region_id: filters.region_id || null,
        p_sector_id: filters.sector_id || null,
        p_date_from: filters.date_from || null,
        p_date_to: filters.date_to || null,
        p_category_id: filters.category_id || null,
      });

      if (error) {
        console.error('Error fetching school performance report:', error);
        throw new Error(error.message);
      }

      const result = safeCastArray<DetailedSchoolPerformanceData>(data);
      
      // Cache the result
      if (useCache) {
        const cacheKey = { ...filters, type: 'school_performance' };
        reportCache.set('school_performance', cacheKey, result, 5 * 60 * 1000); // 5 minutes
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch school performance report';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Function to get regional comparison report with caching
  const getRegionalComparisonReport = async (
    filters: { date_from?: string; date_to?: string } = {},
    useCache = true
  ): Promise<DetailedRegionalComparisonData[]> => {
    try {
      setLoading(true);
      setError(null);

      // Try cache first if enabled
      if (useCache) {
        const cacheKey = { ...filters, type: 'regional_comparison' };
        const cached = reportCache.get<DetailedRegionalComparisonData[]>('regional_comparison', cacheKey);
        if (cached) {
          setLoading(false);
          return cached;
        }
      }

      const { data, error } = await supabase.rpc('get_regional_comparison_report', {
        p_date_from: filters.date_from || null,
        p_date_to: filters.date_to || null,
      });

      if (error) {
        console.error('Error fetching regional comparison report:', error);
        // Check if function doesn't exist
        if (error.code === 'PGRST202') {
          console.warn('Regional comparison function not found, returning empty data');
          return [];
        }
        throw new Error(error.message);
      }

      const result = safeCastArray<DetailedRegionalComparisonData>(data);
      
      // Cache the result for longer (10 minutes for regional data)
      if (useCache) {
        const cacheKey = { ...filters, type: 'regional_comparison' };
        reportCache.set('regional_comparison', cacheKey, result, 10 * 60 * 1000); // 10 minutes
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch regional comparison report';
      setError(errorMessage);
      console.warn('Regional comparison report error:', errorMessage);
      // Suppress toast for missing functions
      if (!err.message?.includes('PGRST202') && !err.message?.includes('function')) {
        toast.error(errorMessage);
      }
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Function to get category completion report
  const getCategoryCompletionReport = async (
    filters: ReportsFilters = {}
  ): Promise<DetailedCategoryCompletionData[]> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('get_category_completion_report', {
        p_region_id: filters.region_id || null,
        p_sector_id: filters.sector_id || null,
        p_category_id: filters.category_id || null,
      });

      if (error) {
        console.error('Error fetching category completion report:', error);
        throw new Error(error.message);
      }

      return safeCastArray<DetailedCategoryCompletionData>(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch category completion report';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Function to get school data by category
  const getSchoolDataByCategory = async (
    school_id: string,
    category_id: string
  ): Promise<DetailedSchoolDataByCategoryData[]> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('get_school_data_by_category', {
        p_school_id: school_id,
        p_category_id: category_id,
      });

      if (error) {
        console.error('Error fetching school data by category:', error);
        throw new Error(error.message);
      }

      return safeCastArray<DetailedSchoolDataByCategoryData>(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch school data by category';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Function to get dashboard statistics
  const getDashboardStatistics = async (
    filters: { region_id?: string; sector_id?: string } = {}
  ): Promise<DetailedDashboardStatistics | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('get_dashboard_statistics', {
        p_region_id: filters.region_id || null,
        p_sector_id: filters.sector_id || null,
      });

      if (error) {
        console.error('Error fetching dashboard statistics:', error);
        // Check if function doesn't exist
        if (error.code === 'PGRST202') {
          console.warn('Dashboard statistics function not found, returning mock data');
          // Return basic mock data structure
          return {
            total_schools: 0,
            active_schools: 0,
            total_students: 0,
            total_teachers: 0,
            total_submissions: 0,
            approved_submissions: 0,
            pending_submissions: 0,
          };
        }
        throw new Error(error.message);
      }

      return safeCastObject<DetailedDashboardStatistics>(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch dashboard statistics';
      setError(errorMessage);
      console.warn('Dashboard statistics error:', errorMessage);
      // Suppress toast for missing functions and return mock data
      if (err.message?.includes('PGRST202') || err.message?.includes('function')) {
        return {
          total_schools: 0,
          active_schools: 0,
          total_students: 0,
          total_teachers: 0,
          total_submissions: 0,
          approved_submissions: 0,
          pending_submissions: 0,
        };
      }
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Generic function to test database connection
  const testDatabaseConnection = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Simple test query to check if functions are working
      const { data, error } = await supabase.rpc('get_dashboard_statistics', {
        p_region_id: null,
        p_sector_id: null,
      });

      if (error) {
        console.error('Database connection test failed:', error);
        if (error.code === 'PGRST202') {
          console.warn('Database functions not installed');
          toast.error('Database functions not installed. Please install database functions in Supabase.');
          return false;
        }
        throw new Error(error.message);
      }

      toast.success('Database connection successful');
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Database connection test failed';
      setError(errorMessage);
      console.warn('Database test error:', errorMessage);
      // Only show toast for non-function errors
      if (!err.message?.includes('PGRST202') && !err.message?.includes('function')) {
        toast.error(errorMessage);
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    // Data fetching functions
    getSchoolPerformanceReport,
    getRegionalComparisonReport,
    getCategoryCompletionReport,
    getSchoolDataByCategory,
    getDashboardStatistics,
    
    // Utility functions
    testDatabaseConnection,
    
    // Cache functions
    clearCache: () => reportCache.clear(),
    invalidateCache: (prefix?: string) => {
      if (prefix) {
        reportCache.invalidate(prefix);
      } else {
        reportCache.clear();
      }
    },
    getCacheStats: () => reportCache.getStats(),
    
    // State
    loading,
    error,
    
    // Clear error function
    clearError: () => setError(null),
  };
};

// Hook specifically for school column table data
export const useSchoolColumnData = (school_id?: string, category_id?: string) => {
  const [data, setData] = useState<DetailedSchoolDataByCategoryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getSchoolDataByCategory } = useReportsData();

  const fetchData = async () => {
    if (!school_id || !category_id) {
      setData([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await getSchoolDataByCategory(school_id, category_id);
      setData(result);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch school column data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [school_id, category_id]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

// Hook specifically for dashboard statistics
export const useDashboardData = (region_id?: string, sector_id?: string) => {
  const [data, setData] = useState<DetailedDashboardStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getDashboardStatistics } = useReportsData();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getDashboardStatistics({ region_id, sector_id });
      setData(result);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch dashboard data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [region_id, sector_id]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};
