import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { CategoryProgress, ColumnStatus } from '@/types/dashboard';
import { toast } from 'sonner';

export interface SchoolDashboardData {
  categories: CategoryProgress[];
  columnStatuses: ColumnStatus[];
  totalCategories: number;
  completedCategories: number;
  totalColumns: number;
  filledColumns: number;
  overallProgress: number;
  pendingForms: number;
  approvedForms: number;
  rejectedForms: number;
  recentActivity: any[];
}

export interface UseSchoolDashboardDataOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useSchoolDashboardData = (options: UseSchoolDashboardDataOptions = {}) => {
  const { autoRefresh = true, refreshInterval = 30000 } = options;
  
  const [data, setData] = useState<SchoolDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const user = useAuthStore(selectUser);
  const schoolId = user?.school_id;

  const fetchSchoolDashboardData = useCallback(async () => {
    if (!schoolId) {
      console.warn('SchoolId tapılmadı, məlumatlar yüklənə bilmədi');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('📊 Məktəb dashboard məlumatları yüklənir...', { schoolId });

      // 1. Məktəb üçün əlçatan kateqoriyaları əldə edirik
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select(`
          id,
          name,
          status,
          assignment,
          deadline,
          columns (
            id,
            name,
            type,
            is_required,
            status
          )
        `)
        .eq('status', 'active')
        .order('name');

      if (categoriesError) throw categoriesError;

      // 2. Məktəb üçün data entries əldə edirik
      const { data: dataEntries, error: entriesError } = await supabase
        .from('data_entries')
        .select('*')
        .eq('school_id', schoolId);

      if (entriesError) throw entriesError;

      // 3. Məlumatları emal edirik
      const categories: CategoryProgress[] = [];
      const columnStatuses: ColumnStatus[] = [];
      
      let totalColumns = 0;
      let filledColumns = 0;

      (categoriesData || []).forEach((category: any) => {
        const categoryColumns = category.columns || [];
        const categoryEntries = (dataEntries || []).filter(
          (entry: any) => entry.category_id === category.id
        );

        // Kateqoriya üçün progress hesablayırıq
        const categoryColumnCount = categoryColumns.length;
        const categoryFilledCount = categoryColumns.filter((col: any) => 
          categoryEntries.some((entry: any) => 
            entry.column_id === col.id && entry.value && entry.value.trim() !== ''
          )
        ).length;

        const categoryProgress = categoryColumnCount > 0 
          ? Math.round((categoryFilledCount / categoryColumnCount) * 100)
          : 0;

        categories.push({
          id: category.id,
          name: category.name,
          progress: categoryProgress,
          status: categoryProgress === 100 ? 'completed' : 
                 categoryProgress > 0 ? 'partial' : 'empty',
          completionRate: categoryProgress
        });

        // Hər sütun üçün status müəyyən edirik
        categoryColumns.forEach((column: any) => {
          const columnEntry = categoryEntries.find(
            (entry: any) => entry.column_id === column.id
          );
          
          let status = 'empty';
          if (columnEntry && columnEntry.value && columnEntry.value.trim() !== '') {
            status = columnEntry.status === 'approved' ? 'completed' :
                    columnEntry.status === 'rejected' ? 'rejected' : 'pending';
          }

          columnStatuses.push({
            id: column.id,
            name: column.name,
            status: status,
            categoryId: category.id,
            categoryName: category.name
          });

          totalColumns++;
          if (status !== 'empty') {
            filledColumns++;
          }
        });
      });

      // 4. Statistikaları hesablayırıq
      const totalCategories = categories.length;
      const completedCategories = categories.filter(c => c.status === 'completed').length;
      const overallProgress = totalColumns > 0 
        ? Math.round((filledColumns / totalColumns) * 100)
        : 0;

      // 5. Form statistikaları
      const pendingForms = (dataEntries || []).filter(e => e.status === 'pending').length;
      const approvedForms = (dataEntries || []).filter(e => e.status === 'approved').length;
      const rejectedForms = (dataEntries || []).filter(e => e.status === 'rejected').length;

      // 6. Son aktivlik məlumatları (opsional)
      const recentActivity = (dataEntries || [])
        .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 5);

      const dashboardData: SchoolDashboardData = {
        categories,
        columnStatuses,
        totalCategories,
        completedCategories,
        totalColumns,
        filledColumns,
        overallProgress,
        pendingForms,
        approvedForms,
        rejectedForms,
        recentActivity
      };

      setData(dashboardData);
      console.log('✅ Məktəb dashboard məlumatları uğurla yükləndi:', dashboardData);

    } catch (err: any) {
      console.error('❌ Məktəb dashboard məlumatları yüklənərkən xəta:', err);
      setError(err);
      toast.error('Dashboard məlumatları yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  // İlk yükləmə
  useEffect(() => {
    fetchSchoolDashboardData();
  }, [fetchSchoolDashboardData]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchSchoolDashboardData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchSchoolDashboardData]);

  return {
    data,
    loading,
    error,
    refetch: fetchSchoolDashboardData,
    isReady: !loading && !error,
    hasData: !!data && data.totalCategories > 0,
    isEmpty: !data || data.totalCategories === 0
  };
};
