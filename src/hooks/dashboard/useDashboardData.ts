
import { useState, useEffect } from 'react';
import { 
  EnhancedDashboardData, 
  CategoryProgress, 
  ColumnStatus 
} from '@/types/dashboard';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore, selectUser, selectUserRole } from '@/hooks/auth/useAuthStore';

interface UseDashboardDataOptions {
  enhanced?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useDashboardData = (options: UseDashboardDataOptions = {}) => {
  const [data, setData] = useState<any>(null);
  const [enhancedData, setEnhancedData] = useState<EnhancedDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasError, setHasError] = useState(false);
  
  const user = useAuthStore(selectUser);
  const userRole = useAuthStore(selectUserRole);

  const refreshData = async () => {
    setLoading(true);
    setHasError(false);
    setError(null);
    
    try {
      console.log('📊 [useDashboardData] Yüklənir... Rol:', userRole);
      
      let dashboardData: any = null;
      
      if (userRole === 'regionadmin' || userRole === 'superadmin') {
        // Region admin və ya superadmin üçün data
        const { data: regionStats, error: regionError } = await supabase
          .from('region_stats')
          .select('*')
          .eq('region_id', user?.region_id || '')
          .single();
          
        if (regionError) throw regionError;
        
        const { data: sectorStats, error: sectorError } = await supabase
          .from('sectors')
          .select('id, name, status, school_count, completion_rate');
          
        if (sectorError) throw sectorError;
        
        dashboardData = {
          totalSectors: sectorStats?.length || 0,
          totalSchools: regionStats?.total_schools || 0,
          pendingApprovals: regionStats?.pending_approvals || 0,
          completionRate: regionStats?.completion_rate || 0,
          stats: {
            sectors: sectorStats || []
          },
          formStats: {
            total: regionStats?.total_forms || 0,
            completed: regionStats?.completed_forms || 0,
            pending: regionStats?.pending_forms || 0,
            rejected: regionStats?.rejected_forms || 0,
            approved: regionStats?.approved_forms || 0,
            completionRate: regionStats?.completion_rate || 0
          }
        };
      } else if (userRole === 'sectoradmin') {
        // Sektor admin üçün data
        const { data: sectorStats, error: sectorError } = await supabase
          .from('sector_stats')
          .select('*')
          .eq('sector_id', user?.sector_id || '')
          .single();
          
        if (sectorError) throw sectorError;
        
        const { data: schools, error: schoolsError } = await supabase
          .from('schools')
          .select('id, name, status, completion_rate')
          .eq('sector_id', user?.sector_id || '');
          
        if (schoolsError) throw schoolsError;
          
        dashboardData = {
          totalSchools: schools?.length || 0,
          pendingApprovals: sectorStats?.pending_approvals || 0,
          completionRate: sectorStats?.completion_rate || 0,
          stats: {
            schools: schools || []
          },
          formStats: {
            total: sectorStats?.total_forms || 0,
            completed: sectorStats?.completed_forms || 0,
            pending: sectorStats?.pending_forms || 0,
            rejected: sectorStats?.rejected_forms || 0,
            approved: sectorStats?.approved_forms || 0,
            completionRate: sectorStats?.completion_rate || 0
          }
        };
      } else if (userRole === 'schooladmin') {
        // Məktəb admin üçün data
        const { data: schoolStats, error: schoolError } = await supabase
          .from('school_stats')
          .select('*')
          .eq('school_id', user?.school_id || '')
          .single();
          
        if (schoolError) throw schoolError;
        
        const { data: categories, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name, completion_rate, status');
          
        if (categoriesError) throw categoriesError;
        
        dashboardData = {
          totalCategories: categories?.length || 0,
          completedCategories: categories?.filter(c => c.status === 'completed')?.length || 0,
          pendingCategories: categories?.filter(c => c.status === 'pending')?.length || 0,
          completionRate: schoolStats?.completion_rate || 0,
          stats: {
            categories: categories || []
          },
          formStats: {
            total: schoolStats?.total_forms || 0,
            completed: schoolStats?.completed_forms || 0,
            pending: schoolStats?.pending_forms || 0,
            rejected: schoolStats?.rejected_forms || 0,
            approved: schoolStats?.approved_forms || 0,
            completionRate: schoolStats?.completion_rate || 0
          }
        };
      }
      
      console.log('📊 [useDashboardData] Yüklənmə uğurlu:', { dashboardData });
      
      // Check if we have data or use default/mock data if needed
      if (!dashboardData) {
        console.warn('📊 [useDashboardData] Real data yoxdur, default istifadə edilir');
        // Default data as fallback
        dashboardData = {
          totalCategories: 0,
          completedCategories: 0,
          totalColumns: 0,
          filledColumns: 0,
          overallProgress: 0,
          categoryProgress: [],
          columnStatuses: [],
          totalForms: 0,
          completedForms: 0,
          pendingForms: 0,
          completionRate: 0,
          stats: {}
        };
      }

      setData(dashboardData);
      setEnhancedData(dashboardData as EnhancedDashboardData);
      
      console.warn('=========== İSTİFADƏÇİ ROL DİAQNOSTİKASI ===========');
      console.warn(' USER ROLE:', userRole, '\n', 'USER ID:', user?.id, '\n', 'USER:', user, '\n', 'DASHBOARD DATA:', dashboardData, '\n', '================================================');
      
    } catch (err: any) {
      console.error('📊 [useDashboardData] Xəta baş verdi:', err);
      setError(err);
      setHasError(true);
      
      // Set default empty data
      const emptyData = {
        totalCategories: 0,
        completedCategories: 0,
        pendingCategories: 0,
        completionRate: 0,
        stats: {}
      };
      
      setData(emptyData);
      setEnhancedData(emptyData as EnhancedDashboardData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [userRole, user?.id]);

  return {
    data,
    enhancedData,
    loading,
    error,
    hasError,
    refreshData,
    isReady: !loading,
    hasData: !!data,
    isEmpty: !data || Object.keys(data).length === 0
  };
};

// Export the types that are needed
export type { EnhancedDashboardData, CategoryProgress, ColumnStatus };
