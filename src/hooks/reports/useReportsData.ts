import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { reportCache, CacheHelpers } from '@/services/reports/cacheService';

// Types for report data
export interface SchoolPerformanceData {
  school_id: string;
  school_name: string;
  principal_name?: string;
  region_id: string;
  region_name: string;
  sector_id: string;
  sector_name: string;
  student_count?: number;
  teacher_count?: number;
  completion_rate: number;
  total_entries: number;
  approved_entries: number;
  pending_entries: number;
  rejected_entries: number;
  approval_rate: number;
  last_submission?: string;
  categories_covered: number;
  phone?: string;
  email?: string;
  address?: string;
  status: string;
}

export interface RegionalComparisonData {
  region_id: string;
  region_name: string;
  total_schools: number;
  active_schools: number;
  total_sectors: number;
  total_students: number;
  total_teachers: number;
  avg_completion_rate: number;
  total_submissions: number;
  approved_submissions: number;
  pending_submissions: number;
  rejected_submissions: number;
  approval_rate: number;
  schools_with_submissions: number;
  submission_rate: number;
}

export interface CategoryCompletionData {
  category_id: string;
  category_name: string;
  category_description?: string;
  assignment: string;
  deadline?: string;
  total_columns: number;
  required_columns: number;
  schools_completed: number;
  schools_partial: number;
  schools_not_started: number;
  total_schools: number;
  completion_percentage: number;
  total_submissions: number;
  approved_submissions: number;
  pending_submissions: number;
  avg_completion_time_days?: number;
}

export interface SchoolDataByCategoryData {
  column_id: string;
  column_name: string;
  column_type: string;
  is_required: boolean;
  order_index: number;
  placeholder?: string;
  help_text?: string;
  options?: any;
  validation?: any;
  value?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
}

export interface DashboardStatistics {
  total_schools: number;
  active_schools: number;
  total_regions?: number;
  total_sectors?: number;
  total_students: number;
  total_teachers: number;
  avg_completion_rate?: number;
  completion_rate?: number; // For school admin
  total_submissions: number;
  approved_submissions: number;
  pending_submissions: number;
  rejected_submissions?: number;
  approval_rate?: number;
  schools_with_high_completion?: number;
  schools_needing_attention?: number;
  total_categories?: number;
  completed_categories?: number;
  recent_activities?: Array<{
    school_name?: string;
    action: string;
    category: string;
    status?: string;
    timestamp: string;
  }>;
  top_performing_schools?: Array<{
    school_name: string;
    completion_rate: number;
    total_submissions: number;
  }>;
}

export interface ReportsFilters {
  region_id?: string;
  sector_id?: string;
  category_id?: string;
  date_from?: string;
  date_to?: string;
}

export const useReportsData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to get school performance report with caching
  const getSchoolPerformanceReport = async (
    filters: ReportsFilters = {},
    useCache = true
  ): Promise<SchoolPerformanceData[]> => {
    try {
      setLoading(true);
      setError(null);

      // Try cache first if enabled
      if (useCache) {
        const cacheKey = { ...filters, type: 'school_performance' };
        const cached = reportCache.get<SchoolPerformanceData[]>('school_performance', cacheKey);
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

      const result = data || [];
      
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
  ): Promise<RegionalComparisonData[]> => {
    try {
      setLoading(true);
      setError(null);

      // Try cache first if enabled
      if (useCache) {
        const cacheKey = { ...filters, type: 'regional_comparison' };
        const cached = reportCache.get<RegionalComparisonData[]>('regional_comparison', cacheKey);
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
        throw new Error(error.message);
      }

      const result = data || [];
      
      // Cache the result for longer (10 minutes for regional data)
      if (useCache) {
        const cacheKey = { ...filters, type: 'regional_comparison' };
        reportCache.set('regional_comparison', cacheKey, result, 10 * 60 * 1000); // 10 minutes
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch regional comparison report';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Function to get category completion report
  const getCategoryCompletionReport = async (
    filters: ReportsFilters = {}
  ): Promise<CategoryCompletionData[]> => {
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

      return data || [];
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
  ): Promise<SchoolDataByCategoryData[]> => {
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

      return data || [];
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
  ): Promise<DashboardStatistics | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('get_dashboard_statistics', {
        p_region_id: filters.region_id || null,
        p_sector_id: filters.sector_id || null,
      });

      if (error) {
        console.error('Error fetching dashboard statistics:', error);
        throw new Error(error.message);
      }

      return data || null;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch dashboard statistics';
      setError(errorMessage);
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
        throw new Error(error.message);
      }

      toast.success('Database connection successful');
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Database connection test failed';
      setError(errorMessage);
      toast.error(errorMessage);
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
  const [data, setData] = useState<SchoolDataByCategoryData[]>([]);
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
  const [data, setData] = useState<DashboardStatistics | null>(null);
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

// Export types for use in components
export type {
  SchoolPerformanceData,
  RegionalComparisonData,
  CategoryCompletionData,
  SchoolDataByCategoryData,
  DashboardStatistics,
  ReportsFilters,
};
