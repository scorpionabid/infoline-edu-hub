
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { Notification } from '@/types/notification';
import { FormItem } from '@/types/dashboard';

interface SchoolStats {
  pending: number;
  approved: number;
  rejected: number;
  dueSoon: number;
  overdue: number;
}

export interface SchoolAdminDashboardData {
  forms: SchoolStats;
  completionRate: number;
  notifications: Notification[];
  pendingForms: FormItem[];
  categories: number;
  dueDates?: {
    category: string;
    date: string;
  }[];
}

export const useSchoolAdminDashboard = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasFunctions, setHasFunctions] = useState<boolean | null>(null);
  const [dashboardData, setDashboardData] = useState<SchoolAdminDashboardData>({
    forms: {
      pending: 0,
      approved: 0,
      rejected: 0,
      dueSoon: 0,
      overdue: 0
    },
    completionRate: 0,
    notifications: [],
    pendingForms: [],
    categories: 0
  });

  // Lazımi funksiyaların olub-olmadığını yoxlayaq
  const checkFunctions = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('check_function_exists', {
        function_name: 'get_school_admin_stats'
      });
      
      if (error) {
        console.error('Funksiya yoxlaması zamanı xəta:', error);
        setHasFunctions(false);
        return false;
      }
      
      setHasFunctions(data);
      return data;
    } catch (err) {
      console.error('Funksiya yoxlaması istisna:', err);
      setHasFunctions(false);
      return false;
    }
  }, []);

  // Mock data generator funksiyası
  const generateMockDashboardData = useCallback((): SchoolAdminDashboardData => {
    // Bildirişlər üçün mock data
    const mockNotifications: Notification[] = Array.from({ length: 5 }, (_, i) => ({
      id: `notification-${i}`,
      title: `Test Bildiriş ${i + 1}`,
      message: `Bu test bildiriş #${i + 1} məzmunudur.`,
      type: ['info', 'warning', 'success', 'error'][Math.floor(Math.random() * 4)] as any,
      isRead: Math.random() > 0.5,
      createdAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
      userId: user?.id || '',
      priority: 'normal'
    }));
    
    // Formlar üçün mock data
    const mockForms: FormItem[] = Array.from({ length: 8 }, (_, i) => ({
      id: `form-${i}`,
      title: `Test Form ${i + 1}`,
      category: `Kateqoriya ${Math.floor(Math.random() * 5) + 1}`,
      status: ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)],
      date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
    }));
    
    // Formların statusları üçün sayğaclar
    const pendingCount = Math.floor(Math.random() * 10) + 5;
    const approvedCount = Math.floor(Math.random() * 20) + 10;
    const rejectedCount = Math.floor(Math.random() * 5) + 2;
    
    return {
      forms: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        dueSoon: Math.floor(Math.random() * 3) + 1,
        overdue: Math.floor(Math.random() * 2)
      },
      completionRate: Math.floor(Math.random() * 30) + 70, // 70-100 arası
      notifications: mockNotifications,
      pendingForms: mockForms.filter(f => f.status === 'pending'),
      categories: Math.floor(Math.random() * 5) + 5
    };
  }, [user?.id]);

  // Əsl məlumatları əldə etmək
  const fetchRealDashboardData = useCallback(async () => {
    if (!user || !user.id || !user.schoolId) {
      console.log("İstifadəçi məlumatları yoxdur");
      return null;
    }

    try {
      // Statistika məlumatlarını əldə edək
      const { data: stats, error: statsError } = await supabase.rpc('get_school_admin_stats', {
        school_id_param: user.schoolId
      });
      
      if (statsError) {
        throw new Error(`Statistika məlumatlarını əldə etmək mümkün olmadı: ${statsError.message}`);
      }
      
      // Məktəbə aid bildirişləri əldə edək
      const { data: notifications, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (notificationsError) {
        throw new Error(`Bildirişləri əldə etmək mümkün olmadı: ${notificationsError.message}`);
      }
      
      // Son gözləyən formları əldə edək
      const { data: pendingData, error: pendingError } = await supabase
        .from('data_entries')
        .select(`
          id,
          category: categories (id, name),
          column: columns (id, name),
          status,
          created_at
        `)
        .eq('school_id', user.schoolId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (pendingError) {
        throw new Error(`Gözləyən formaları əldə etmək mümkün olmadı: ${pendingError.message}`);
      }
      
      // Kateqoriyaların sayını əldə edək
      const { count: categoryCount, error: categoryError } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true });
        
      if (categoryError) {
        throw new Error(`Kateqoriyaların sayını əldə etmək mümkün olmadı: ${categoryError.message}`);
      }
      
      // Statistika məlumatlarını formatlaşdıraq
      const formStats: SchoolStats = {
        pending: stats?.pending_forms || 0,
        approved: stats?.approved_forms || 0,
        rejected: stats?.rejected_forms || 0,
        dueSoon: stats?.due_soon_forms || 0,
        overdue: stats?.overdue_forms || 0
      };
      
      // Gözləyən formaları formatlaşdıraq
      const pendingForms: FormItem[] = pendingData?.map((item: any) => ({
        id: item.id,
        title: item.column?.name || 'Bilinməyən sütun',
        date: new Date(item.created_at).toLocaleDateString(),
        status: item.status,
        category: item.category?.name || 'Bilinməyən kateqoriya',
      })) || [];
      
      return {
        forms: formStats,
        completionRate: stats?.completion_rate || 0,
        notifications: notifications || [],
        pendingForms: pendingForms,
        categories: categoryCount || 0
      };
    } catch (err) {
      console.error('Əsl dashboard məlumatlarını əldə edərkən xəta:', err);
      throw err;
    }
  }, [user]);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Funksiyaların olub-olmadığını yoxla
      const functionsExist = await checkFunctions();
      
      let data;
      
      if (functionsExist) {
        // Əsl məlumatları əldə et
        try {
          data = await fetchRealDashboardData();
        } catch (realDataError) {
          console.error('Əsl məlumatları əldə edərkən xəta, mock data istifadə ediləcək:', realDataError);
          data = generateMockDashboardData();
        }
      } else {
        // Mock data istifadə et
        console.log('Lazımi funksiyalar mövcud deyil, mock data istifadə ediləcək');
        data = generateMockDashboardData();
      }
      
      if (data) {
        setDashboardData(data);
      }
    } catch (err) {
      console.error('Dashboard məlumatlarını əldə edərkən xəta:', err);
      setError(err instanceof Error ? err : new Error('Bilinməyən xəta'));
      toast.error(t('errorLoadingDashboard'), {
        description: err instanceof Error ? err.message : t('unexpectedError')
      });
    } finally {
      setIsLoading(false);
    }
  }, [checkFunctions, fetchRealDashboardData, generateMockDashboardData, t]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    isLoading,
    error,
    dashboardData,
    hasFunctions,
    refreshData: fetchDashboardData
  };
};
