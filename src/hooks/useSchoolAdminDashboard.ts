
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/notification';
import { FormItem } from '@/types/dashboard';
import { generateMockNotifications } from '@/utils/dashboardUtils';

export interface SchoolAdminDashboardData {
  forms: {
    pending: number;
    approved: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
  };
  completionRate: number;
  notifications: Notification[];
  pendingForms: FormItem[];
  categories: number;
}

export const useSchoolAdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<SchoolAdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!user || !user.schoolId) {
        throw new Error('İstifadəçi və ya məktəb məlumatları tapılmadı');
      }

      // Məktəb funksiyalarının mövcudluğunu yoxlayaq
      const functionExists = await checkFunctionExists();
      
      if (functionExists) {
        // Həqiqi məlumatları əldə etmək
        const stats = await fetchSchoolStats(user.schoolId);
        const pendingForms = await fetchPendingForms(user.schoolId);
        
        setData({
          forms: {
            pending: stats.pending_forms || 0,
            approved: stats.approved_forms || 0,
            rejected: stats.rejected_forms || 0,
            dueSoon: stats.due_soon_forms || 0,
            overdue: stats.overdue_forms || 0,
          },
          completionRate: stats.completion_rate || 0,
          categories: stats.categories_count || 0,
          notifications: generateMockNotifications(5),
          pendingForms
        });
      } else {
        // Mock data istifadə edək
        createMockDashboardData();
      }
    } catch (err) {
      console.error('Dashboard məlumatları yüklənmədi:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      // Error halında mock məlumatları istifadə edək
      createMockDashboardData();
    } finally {
      setIsLoading(false);
    }
  };

  // Function mövcudluğunu yoxlamaq
  const checkFunctionExists = async (): Promise<boolean> => {
    try {
      // SQL sorğusunu birbaşa istifadə edərək funksiyasının mövcudluğunu yoxlayaq
      const { data, error } = await supabase.rpc('check_function_exists', {
        function_name: 'get_school_admin_stats'
      });
      
      if (error) {
        console.error('Funksiya yoxlanması zamanı xəta:', error);
        return false;
      }
      
      return Boolean(data);
    } catch (err) {
      console.error('Funksiya yoxlanması xətası:', err);
      return false;
    }
  };

  // Məktəb statistikalarını əldə etmək
  const fetchSchoolStats = async (schoolId: string): Promise<any> => {
    try {
      let stats = {};
      
      // Pending forms sayını əldə edək
      const { count: pendingCount } = await supabase
        .from('data_entries')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId)
        .eq('status', 'pending');
      
      // Approved forms sayını əldə edək
      const { count: approvedCount } = await supabase
        .from('data_entries')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId)
        .eq('status', 'approved');
      
      // Rejected forms sayını əldə edək
      const { count: rejectedCount } = await supabase
        .from('data_entries')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId)
        .eq('status', 'rejected');
      
      // Kateqoriyaların sayını əldə edək
      const { data: categories } = await supabase
        .from('categories')
        .select('id')
        .eq('status', 'active');
      
      stats = {
        pending_forms: pendingCount || 0,
        approved_forms: approvedCount || 0,
        rejected_forms: rejectedCount || 0,
        due_soon_forms: 0, // Hesablamaq lazımdır
        overdue_forms: 0, // Hesablamaq lazımdır
        completion_rate: 0, // Hesablamaq lazımdır
        categories_count: categories?.length || 0
      };
      
      return stats;
    } catch (err) {
      console.error('Məktəb statistikalarını əldə edərkən xəta:', err);
      throw err;
    }
  };

  // Pending formları əldə etmək
  const fetchPendingForms = async (schoolId: string): Promise<FormItem[]> => {
    try {
      // Kateqoriyalar və onların data entries-lərini əldə edək
      const { data: categories, error } = await supabase
        .from('categories')
        .select('id, name, status, deadline, created_at, updated_at');
      
      if (error) throw error;
      
      if (!categories || categories.length === 0) {
        return [];
      }
      
      // Formları hazırlayaq
      const pendingForms: FormItem[] = categories.map((category: any) => ({
        id: category.id,
        title: category.name,
        status: 'pending',
        date: new Date(category.created_at).toISOString().split('T')[0]
      }));
      
      return pendingForms;
    } catch (err) {
      console.error('Pending formları əldə edərkən xəta:', err);
      return [];
    }
  };

  // Mock dashboard məlumatlarını yaratmaq
  const createMockDashboardData = () => {
    setData({
      forms: {
        pending: 5,
        approved: 12,
        rejected: 2,
        dueSoon: 3,
        overdue: 1,
      },
      completionRate: 72,
      categories: 8,
      notifications: generateMockNotifications(5),
      pendingForms: [
        { id: '1', title: 'Tələbə məlumatları', status: 'pending', date: '2023-04-05' },
        { id: '2', title: 'Müəllim statistikası', status: 'pending', date: '2023-04-03' },
        { id: '3', title: 'İnfrastruktur hesabatı', status: 'pending', date: '2023-04-01' },
        { id: '4', title: 'Maliyyə hesabatı', status: 'pending', date: '2023-03-28' },
        { id: '5', title: 'İmtahan nəticələri', status: 'pending', date: '2023-03-25' },
      ]
    });
  };

  // Component qurulduqda məlumatları yükləyək
  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const refetch = () => {
    fetchDashboardData();
  };

  return {
    data,
    isLoading,
    error,
    refetch
  };
};
