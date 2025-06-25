import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { toast } from 'sonner';

// ORIGINAL interface (backward compatibility)
export interface DashboardData {
  totalForms: number;
  completedForms: number;
  pendingForms: number;
  completionRate: number;
}

// NEW enhanced interfaces (for school admin dashboard)
export interface CategoryProgress {
  id: string;
  name: string;
  description?: string;
  assignment: string;
  totalColumns: number;
  filledColumns: number;
  requiredColumns: number;
  filledRequiredColumns: number;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'pending' | 'approved';
  lastUpdated?: Date;
  deadline?: Date;
}

export interface ColumnStatus {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  type: string;
  isRequired: boolean;
  isFilled: boolean;
  value?: any;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  lastUpdated?: Date;
  rejectionReason?: string;
}

// Enhanced dashboard data (optional for school admin)
export interface EnhancedDashboardData extends DashboardData {
  totalCategories: number;
  completedCategories: number;
  totalColumns: number;
  filledColumns: number;
  overallProgress: number;
  categoryProgress: CategoryProgress[];
  columnStatuses: ColumnStatus[];
}

interface UseDashboardDataOptions {
  enhanced?: boolean; // Enable enhanced mode for school admin
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useDashboardData(options: UseDashboardDataOptions = {}) {
  const { enhanced = false, autoRefresh = false, refreshInterval = 30000 } = options;
  const user = useAuthStore(selectUser);
  const schoolId = user?.school_id || user?.schoolId;
  
  // Original data state (backward compatibility)
  const [data, setData] = useState<DashboardData>({
    totalForms: 0,
    completedForms: 0,
    pendingForms: 0,
    completionRate: 0
  });
  
  // Enhanced data state (for school admin)
  const [enhancedData, setEnhancedData] = useState<EnhancedDashboardData | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to store the latest fetchData function
  const fetchDataRef = useRef<(() => Promise<void>) | null>(null);

  // Enhanced data fetching for school admin
  const fetchEnhancedData = useCallback(async (basicData: DashboardData) => {
    if (!enhanced || !schoolId) return;
    
    try {
      console.log('Fetching enhanced dashboard data for school:', schoolId);
      
      // Fetch categories with columns (only 'all' assignment for school admin)
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select(`
          *,
          columns(*)
        `)
        .eq('assignment', 'all')
        .eq('status', 'active')
        .order('name');
        
      if (categoriesError) throw categoriesError;
      
      // Fetch data entries for the school
      const { data: dataEntries, error: entriesError } = await supabase
        .from('data_entries')
        .select(`
          id,
          school_id,
          category_id,
          column_id,
          value,
          status,
          created_at,
          updated_at,
          rejection_reason
        `)
        .eq('school_id', schoolId);
        
      if (entriesError) {
        console.error('Data entries fetch error:', entriesError);
        throw entriesError;
      }
      
      console.log('Fetched data entries:', dataEntries?.length, dataEntries?.slice(0, 2));
      
      // Calculate category progress
      const categoryProgress: CategoryProgress[] = (categories || []).map(category => {
        const categoryColumns = category.columns || [];
        const totalColumns = categoryColumns.length;
        const requiredColumns = categoryColumns.filter((col: any) => col.is_required).length;
        
        const categoryEntries = (dataEntries || []).filter(entry => 
          entry.category_id === category.id
        );
        
        const filledColumns = categoryColumns.filter((col: any) => 
          categoryEntries.some(entry => entry.column_id === col.id && 
            entry.value !== null && entry.value !== undefined && String(entry.value).trim() !== '')
        ).length;
        
        const filledRequiredColumns = categoryColumns.filter((col: any) => 
          col.is_required && categoryEntries.some(entry => 
            entry.column_id === col.id && 
            entry.value !== null && entry.value !== undefined && String(entry.value).trim() !== '')
        ).length;
        
        const progress = totalColumns > 0 ? Math.round((filledColumns / totalColumns) * 100) : 0;
        
        // Determine status
        let status: CategoryProgress['status'] = 'not-started';
        if (filledColumns === 0) {
          status = 'not-started';
        } else if (filledRequiredColumns === requiredColumns && filledColumns === totalColumns) {
          const allApproved = categoryEntries.every(entry => entry.status === 'approved');
          const hasPending = categoryEntries.some(entry => entry.status === 'pending');
          
          if (allApproved) {
            status = 'approved';
          } else if (hasPending) {
            status = 'pending';
          } else {
            status = 'completed';
          }
        } else {
          status = 'in-progress';
        }
        
        const lastUpdated = categoryEntries.length > 0 
          ? new Date(Math.max(...categoryEntries.map(entry => new Date(entry.updated_at).getTime())))
          : undefined;
        
        return {
          id: category.id,
          name: category.name,
          description: category.description,
          assignment: category.assignment,
          totalColumns,
          filledColumns,
          requiredColumns,
          filledRequiredColumns,
          progress,
          status,
          lastUpdated,
          deadline: category.deadline ? new Date(category.deadline) : undefined
        };
      });
      
      // Calculate column statuses
      const columnStatuses: ColumnStatus[] = [];
      (categories || []).forEach(category => {
        const categoryColumns = category.columns || [];
        
        categoryColumns.forEach((column: any) => {
          const entry = (dataEntries || []).find(e => e.column_id === column.id);
          const isFilled = entry && entry.value !== null && entry.value !== undefined && String(entry.value).trim() !== '';
          
          columnStatuses.push({
            id: column.id,
            name: column.name,
            categoryId: category.id,
            categoryName: category.name,
            type: column.type,
            isRequired: column.is_required || false,
            isFilled,
            value: entry?.value,
            status: entry?.status || 'draft',
            lastUpdated: entry ? new Date(entry.updated_at) : undefined,
            rejectionReason: entry?.rejection_reason
          });
        });
      });
      
      // Calculate enhanced stats
      const totalCategories = categories?.length || 0;
      const completedCategories = categoryProgress.filter(cat => cat.status === 'completed' || cat.status === 'approved').length;
      const totalColumns = columnStatuses.length;
      const filledColumns = columnStatuses.filter(col => col.isFilled).length;
      const overallProgress = totalColumns > 0 ? Math.round((filledColumns / totalColumns) * 100) : 0;
      
      console.log('Enhanced dashboard calculation details:', {
        categoriesLength: categories?.length,
        totalCategories,
        completedCategories,
        categoryProgressStatuses: categoryProgress.map(cat => ({ name: cat.name, status: cat.status })),
        totalColumns,
        filledColumns,
        overallProgress,
        dataEntriesCount: dataEntries?.length,
        columnStatusesSample: columnStatuses.slice(0, 3)
      });
      
      // Create enhanced data object
      const enhanced: EnhancedDashboardData = {
        ...basicData, // Use passed basic data instead of state
        totalCategories,
        completedCategories,
        totalColumns,
        filledColumns,
        overallProgress,
        categoryProgress,
        columnStatuses
      };
      
      setEnhancedData(enhanced);
      console.log('Enhanced dashboard data calculated:', {
        totalCategories,
        completedCategories,
        totalColumns,
        filledColumns,
        overallProgress
      });
      
    } catch (err: any) {
      console.error('Error fetching enhanced dashboard data:', err);
      setError(err.message);
      toast.error('Təkmilləşdirilmiş dashboard məlumatları yüklənərkən xəta baş verdi');
    }
  }, [enhanced, schoolId]); // Remove data dependency

  // Original fetch function (unchanged for backward compatibility)
  const fetchData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase.from('data_entries').select('status');
      
      // Apply role-based filtering
      if (user?.role === 'regionadmin' && user.region_id) {
        query = query.eq('schools.region_id', user.region_id);
      } else if (user?.role === 'sectoradmin' && user.sector_id) {
        query = query.eq('schools.sector_id', user.sector_id);
      } else if (user?.role === 'schooladmin' && user.school_id) {
        query = query.eq('school_id', user.school_id);
      }
      
      const { data: entries, error } = await query;
      
      if (error) throw error;
      
      const totalForms = entries?.length || 0;
      const completedForms = entries?.filter(entry => entry.status === 'approved').length || 0;
      const pendingForms = entries?.filter(entry => entry.status === 'pending').length || 0;
      const completionRate = totalForms > 0 ? (completedForms / totalForms) * 100 : 0;
      
      const dashboardData = {
        totalForms,
        completedForms,
        pendingForms,
        completionRate: Math.round(completionRate * 100) / 100
      };
      
      setData(dashboardData);
      
      // If enhanced mode is enabled, fetch enhanced data after basic data
      if (enhanced) {
        await fetchEnhancedData(dashboardData); // Pass basic data directly
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Xəta baş verdi');
    } finally {
      setLoading(false);
    }
  }, [user, enhanced, fetchEnhancedData]);
  
  // Update the ref whenever fetchData changes
  useEffect(() => {
    fetchDataRef.current = fetchData;
  }, [fetchData]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []); // Only run once on mount
  
  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(() => {
        if (fetchDataRef.current) {
          fetchDataRef.current();
        }
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]); // Remove fetchData dependency

  // Real-time subscription for enhanced mode
  useEffect(() => {
    if (!enhanced || !schoolId) return;

    let timeoutId: NodeJS.Timeout;
    
    const subscription = supabase
      .channel('dashboard_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'data_entries',
        filter: `school_id=eq.${schoolId}`
      }, () => {
        console.log('Data entry changed, refreshing dashboard...');
        // Debounce the refresh to avoid multiple calls
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (fetchDataRef.current) {
            fetchDataRef.current();
          }
        }, 1000); // 1 second debounce
      })
      .subscribe();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [enhanced, schoolId]); // Remove fetchData dependency

  // Manual refresh function
  const refreshData = useCallback(() => {
    if (fetchDataRef.current) {
      fetchDataRef.current();
    }
  }, []);

  // Helper functions for enhanced mode
  const getCategoryById = useCallback((categoryId: string) => {
    return enhancedData?.categoryProgress.find(cat => cat.id === categoryId);
  }, [enhancedData]);

  const getColumnsForCategory = useCallback((categoryId: string) => {
    return enhancedData?.columnStatuses.filter(col => col.categoryId === categoryId) || [];
  }, [enhancedData]);

  return {
    // Original interface (backward compatibility)
    data,
    loading,
    refreshData,
    
    // Enhanced interface (optional)
    ...(enhanced && {
      enhancedData,
      error,
      getCategoryById,
      getColumnsForCategory,
      
      // Utility flags
      isReady: !loading && !error,
      hasData: (enhancedData?.totalCategories || 0) > 0,
      isEmpty: (enhancedData?.totalCategories || 0) === 0 && !loading
    })
  };
}

export default useDashboardData;