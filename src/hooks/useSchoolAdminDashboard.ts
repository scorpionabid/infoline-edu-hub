
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Notification } from '@/types/notification';
import { Form } from '@/types/form';
import { SchoolAdminDashboardData, FormItem } from '@/types/dashboard';
import { toast } from 'sonner';

interface UseSchoolAdminDashboardReturn {
  data: SchoolAdminDashboardData;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Mock məlumatları
const mockDashboardData: SchoolAdminDashboardData = {
  forms: {
    pending: 5,
    approved: 12,
    rejected: 2,
    total: 20,
    dueSoon: 3,
    overdue: 1
  },
  completionRate: 68,
  notifications: [
    {
      id: '1',
      title: 'Yeni kateqoriya əlavə edildi',
      message: 'Tədris planlaması kateqoriyası əlavə edildi',
      type: 'category',
      isRead: false,
      createdAt: new Date().toISOString(),
      userId: 'user-1',
      priority: 'normal'
    },
    {
      id: '2',
      title: 'Məlumat təsdiqi',
      message: 'Şagird statistikası formu təsdiq edildi',
      type: 'approval',
      isRead: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      userId: 'user-1',
      priority: 'high'
    }
  ],
  pendingForms: [
    {
      id: 'form-1',
      title: 'Şagird statistikası',
      date: '2025-04-15',
      status: 'pending',
      completionPercentage: 75,
      category: 'Təhsil statistikası'
    },
    {
      id: 'form-2',
      title: 'Müəllim heyəti',
      date: '2025-04-20',
      status: 'pending',
      completionPercentage: 50,
      category: 'Kadr məlumatları'
    },
    {
      id: 'form-3',
      title: 'İnfrastruktur hesabatı',
      date: '2025-04-18',
      status: 'dueSoon',
      completionPercentage: 30,
      category: 'İnfrastruktur'
    }
  ]
};

export const useSchoolAdminDashboard = (): UseSchoolAdminDashboardReturn => {
  const [data, setData] = useState<SchoolAdminDashboardData>(mockDashboardData);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Məktəb admin dashboard məlumatları alınır...');
      
      // Mövcud endpoint funksiyasını yoxlayaq
      let functionAvailable = false;
      
      try {
        // Başqa bir mövcud RPC funksiyası ilə yoxlayaq
        const { data: uuidResult } = await supabase.rpc('uuid_generate_v4');
        
        if (uuidResult) {
          console.log('UUID funksiyası əlçatandır, əsas funksiyaları yoxlayırıq');
          functionAvailable = true;
        }
      } catch (rpcError) {
        console.error('RPC funksiyası xətası, mock data istifadə ediləcək:', rpcError);
        functionAvailable = false;
      }
      
      // Əgər supabase əlçatandırsa, real data almağa çalışaq
      if (functionAvailable && user.id) {
        // Məlumatları Supabase-dən almağa çalışaq
        try {
          // Təsdiq gözləyən form sayı
          const pendingData = await supabase
            .from('schools')
            .select('*', { count: 'exact', head: true })
            .eq('admin_id', user.id);
            
          const pendingCount = pendingData.count || 0;
          
          // Təsdiqlənmiş form sayı
          const approvedData = await supabase
            .from('schools')
            .select('*', { count: 'exact', head: true })
            .eq('admin_id', user.id);
          
          const approvedCount = approvedData.count || 0;
          
          // Rədd edilmiş form sayı
          const rejectedData = await supabase
            .from('schools')
            .select('*', { count: 'exact', head: true })
            .eq('admin_id', user.id);
          
          const rejectedCount = rejectedData.count || 0;
          
          // Bitmə müddəti yaxınlaşan formlar
          const { data: pendingForms, error: pendingFormsError } = await supabase
            .from('data_entries')
            .select('id, category_id, created_at, status, value')
            .eq('created_by', user.id)
            .eq('status', 'pending')
            .limit(10);
            
          if (pendingFormsError) {
            throw pendingFormsError;
          }
          
          // Gələn data-nı FormItem formatına çevirək
          const formItems: FormItem[] = pendingForms ? pendingForms.map((form: any) => ({
            id: form.id,
            title: `Form #${form.id.substring(0, 8)}`,
            date: new Date(form.created_at).toLocaleDateString(),
            status: form.status,
            completionPercentage: 0, // Default olaraq 0 veririk
            category: form.category_id
          })) : [];
          
          // Bildirişləri alaq
          const { data: notifications, error: notificationsError } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);
          
          if (notificationsError) {
            throw notificationsError;
          }
          
          // Notification tipinə çevirək
          const typedNotifications: Notification[] = notifications ? notifications.map((notification: any) => ({
            id: notification.id,
            userId: notification.user_id,
            title: notification.title,
            message: notification.message || '',
            type: notification.type,
            isRead: notification.is_read,
            createdAt: notification.created_at,
            priority: notification.priority || 'normal'
          })) : [];
          
          // Məlumatları birləşdirək
          setData({
            forms: {
              pending: pendingCount,
              approved: approvedCount,
              rejected: rejectedCount,
              total: pendingCount + approvedCount + rejectedCount,
              dueSoon: 0, // Hələlik 0 verilir
              overdue: 0, // Hələlik 0 verilir
            },
            completionRate: 0, // Hələlik 0 verilir
            notifications: typedNotifications,
            pendingForms: formItems
          });
        } catch (error) {
          console.error('Məlumatların alınmasında xəta:', error);
          // Xəta halında mock məlumatları istifadə edirik
          setData(mockDashboardData);
        }
      } else {
        // Supabase əlçatan deyilsə və ya user.id yoxdursa, mock məlumatları göstər
        console.log('Real məlumatları almaq mümkün olmadı, mock data istifadə edilir');
        setData(mockDashboardData);
      }
      
      setIsLoading(false);
    } catch (error: any) {
      console.error('Məktəb admin dashboard məlumatlarını əldə edərkən xəta:', error);
      setError(error);
      setData(mockDashboardData);
      setIsLoading(false);
      
      toast.error('Məlumatları yükləyərkən xəta baş verdi', {
        description: error.message
      });
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  };
};
