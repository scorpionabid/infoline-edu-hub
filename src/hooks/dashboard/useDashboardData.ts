
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
          .maybeSingle();
          
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
        console.log('📊 [useDashboardData] Sektoradmin üçün məlumatlar yüklənir...');
        
        try {
          // 1. Sektor məlumatlarını cədvəldən əldə edirik
          const { data: sector, error: sectorFetchError } = await supabase
            .from('sectors')
            .select('*')
            .eq('id', user?.sector_id || '')
            .maybeSingle();
            
          if (sectorFetchError) throw sectorFetchError;
          console.log('📊 [useDashboardData] Sektor məlumatları:', sector);
          
          // 2. Məktəb məlumatlarını əldə edirik
          const { data: schools, error: schoolsError } = await supabase
            .from('schools')
            .select('id, name, status, completion_rate')
            .eq('sector_id', user?.sector_id || '');
            
          if (schoolsError) throw schoolsError;
          console.log(`📊 [useDashboardData] Sektorda ${schools?.length || 0} məktəb tapıldı`);
          
          // 3. Form statuslarını əldə edirik
          // data_entries cədvəlində sector_id yoxdur, ona görə JOIN istifadə edirik
          let formEntries: any[] = [];
          
          if (schools && schools.length > 0) {
            // Əvvəlcə sektorun məktəblərini tapırıq, sonra həmin məktəblərin entries-lərini
            const schoolIds = schools.map(school => school.id);
            
            const { data: entries, error: formError } = await supabase
              .from('data_entries')
              .select('school_id, status')
              .in('school_id', schoolIds);
              
            if (formError) throw formError;
            formEntries = entries || [];
            console.log(`📊 [useDashboardData] ${formEntries.length} data entries tapıldı`);  
          } else {
            console.log('⚠️ [useDashboardData] Sektor üçün məktəb tapılmadı');
          }
          
          // Status saylarını hesablayırıq
          const counts = {
            total: formEntries?.length || 0,
            pending: formEntries?.filter(e => e.status === 'pending').length || 0,
            approved: formEntries?.filter(e => e.status === 'approved').length || 0,
            rejected: formEntries?.filter(e => e.status === 'rejected').length || 0,
            completed: formEntries?.filter(e => e.status === 'approved').length || 0
          };
          
          const completionRate = counts.total > 0 
            ? Math.round((counts.approved / counts.total) * 100)
            : 0;

          // Form statistikalarını təyin edirik
          const formStats = {
            total: counts.total,
            completed: counts.approved,
            pending: counts.pending,
            rejected: counts.rejected,
            approved: counts.approved,
            completionRate: completionRate
          };
          
          // Nəticə obyektini yaradırıq
          dashboardData = {
            totalSchools: schools?.length || 0,
            pendingApprovals: counts.pending,
            completionRate: completionRate,
            stats: {
              schools: schools || [],
              summary: {
                total: counts.total,
                completed: counts.approved,
                pending: counts.pending,
                rejected: counts.rejected,
                approved: counts.approved,
                completionRate: completionRate,
                approvalRate: completionRate,
                draft: 0, // Əlavə statistik məlumatlar
                dueSoon: 0, // Əlavə statistik məlumatlar
                overdue: 0 // Əlavə statistik məlumatlar
              }
            },
            formStats: formStats,
            sectorInfo: sector
          };
          
        } catch (error) {
          console.error('📊 [useDashboardData] Sektoradmin məlumatları yüklənərkən xəta:', error);
          throw error;
        }
      } else if (userRole === 'schooladmin') {
        // Məktəb admin üçün data - school_stats olmadığı üçün alternativ sorğu
        console.log('📊 [useDashboardData] Məktəbadmin üçün məlumatlar yüklənir...', user?.school_id);
        
        try {
          // 1. Məktəbin əsas məlumatlarını əldə edirik
          const { data: school, error: schoolFetchError } = await supabase
            .from('schools')
            .select('*')
            .eq('id', user?.school_id || '')
            .maybeSingle();
            
          if (schoolFetchError) throw schoolFetchError;
          console.log('📊 [useDashboardData] Məktəb məlumatları:', school);
          
          // 2. Kateqoriyaları əldə edirik
          const { data: categories, error: categoriesError } = await supabase
            .from('categories')
            .select('id, name, status, created_at');
            
          if (categoriesError) throw categoriesError;
          console.log(`📊 [useDashboardData] ${categories?.length || 0} kateqoriya tapıldı`);
          
          // 3. Məlumat giriş statistikalarını əldə edirik
          const { data: dataEntries, error: entriesError } = await supabase
            .from('data_entries')
            .select('*')
            .eq('school_id', user?.school_id || '');
            
          if (entriesError) throw entriesError;
          console.log(`📊 [useDashboardData] ${dataEntries?.length || 0} məlumat girişi tapıldı`);

          // Status saylarını hesablayırıq
          const statusCounts = {
            total: dataEntries?.length || 0,
            completed: dataEntries?.filter(e => e.status === 'completed').length || 0,
            pending: dataEntries?.filter(e => e.status === 'pending').length || 0,
            rejected: dataEntries?.filter(e => e.status === 'rejected').length || 0,
            approved: dataEntries?.filter(e => e.status === 'approved').length || 0,
          };
          
          // Tamamlanma nisbəti
          const completionRate = statusCounts.total > 0
            ? Math.round((statusCounts.completed / statusCounts.total) * 100)
            : 0;
          
          dashboardData = {
            totalCategories: categories?.length || 0,
            completedCategories: categories?.filter(c => c.status === 'completed')?.length || 0,
            pendingCategories: categories?.filter(c => c.status === 'pending')?.length || 0,
            completionRate: completionRate,
            stats: {
              categories: categories || []
            },
            formStats: {
              total: statusCounts.total,
              completed: statusCounts.completed,
              pending: statusCounts.pending,
              rejected: statusCounts.rejected,
              approved: statusCounts.approved,
              completionRate: completionRate
            }
          };
        } catch (error) {
          console.error('📊 [useDashboardData] Məktəbadmin məlumatları yüklənərkən xəta:', error);
          throw error;
        }
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
