
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { fetchSchoolAdminDashboard } from '@/services/schoolAdminService';
import { SchoolAdminDashboardData } from '@/types/dashboard';
import { useToast } from '@/hooks/use-toast';
import { Notification } from '@/types/notification';

/**
 * Məktəb admin dashboard hook-u
 * @returns SchoolAdminDashboardData və yüklənmə vəziyyəti
 */
export default function useSchoolAdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Default mock data - bu dayanıqlı mockup data sağlayır
  const defaultData: SchoolAdminDashboardData = {
    forms: {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: 0,
      dueSoon: 0,
      overdue: 0
    },
    completionRate: 0,
    notifications: [],
    pendingForms: []
  };
  
  // Mock data - əgər API istəyi uğursuz olsa backup kimi istifadə ediləcək
  const [mockData, setMockData] = useState<SchoolAdminDashboardData>({
    forms: {
      pending: 5,
      approved: 12,
      rejected: 2,
      total: 19,
      dueSoon: 3,
      overdue: 1
    },
    completionRate: 68,
    notifications: [
      {
        id: '1',
        title: 'Yeni kateqoriya əlavə edildi',
        message: 'Tədris statistikası kateqoriyası sistemə əlavə edildi',
        type: 'category',
        isRead: false,
        createdAt: new Date().toISOString(),
        userId: 'user-1',
        priority: 'normal',
        date: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Son tarix bildirişi',
        message: 'Müəllim heyəti məlumatlarının doldurulma vaxtı sabah bitir',
        type: 'deadline',
        isRead: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        userId: 'user-1',
        priority: 'high',
        date: new Date(Date.now() - 86400000).toISOString()
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
  });

  // Məktəb admin məlumatları
  const schoolId = user?.schoolId;

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['schoolAdminDashboard', schoolId],
    queryFn: async () => {
      if (!schoolId) {
        console.warn('Məktəb ID tapılmadı, mock data istifadə olunur');
        return mockData;
      }
      
      try {
        const result = await fetchSchoolAdminDashboard(schoolId);
        
        // API-dən gələn məlumatların doğruluğunu yoxlayırıq
        // forms sahəsi undefined olsa default dəyərdən istifadə edəcəyik
        if (!result) {
          console.warn('Serverdən məlumat alına bilmədi, mockData istifadə olunur');
          return mockData;
        }
        
        // forms sahəsinin mövcudluğunu və doğru formatda olduğunu yoxlayırıq
        // əgər məlumat yoxdursa və ya yanlışdırsa, mockData-dan istifadə edirik
        if (!result.forms) {
          console.warn('Serverdən alınan dashboard məlumatlarında forms sahəsi yoxdur, mock data istifadə olunur');
          result.forms = mockData.forms;
        }
        
        // Digər məcburi sahələrin yoxlanması
        if (result.completionRate === undefined) {
          result.completionRate = mockData.completionRate;
        }
        
        if (!result.notifications || !Array.isArray(result.notifications)) {
          result.notifications = mockData.notifications;
        }
        
        if (!result.pendingForms || !Array.isArray(result.pendingForms)) {
          result.pendingForms = mockData.pendingForms;
        }
        
        return result;
      } catch (error) {
        console.error('Dashboard məlumatları alınarkən xəta:', error);
        console.warn('Xəta səbəbindən mockData istifadə olunur');
        return mockData; 
      }
    },
    enabled: !!user, // İstifadəçi mövcuddursa sorğu işə salınır
    initialData: defaultData, // Dayanıqlı bir ilkin dəyər təyin edirik
    meta: {
      onError: (error: Error) => {
        toast({
          title: 'Xəta',
          description: `Dashboard məlumatları alınarkən xəta: ${error.message}`,
          variant: 'destructive'
        });
      }
    }
  });

  // Formları redaktə etmək üçün funksiyaların əlavə edilməsi
  const handleFormClick = (formId: string) => {
    console.log(`Form ID ilə data entry səhifəsinə keçid: ${formId}`);
    // İstifadəçini data entry səhifəsinə yönləndir
    // navigate(`/data-entry/${formId}`);
  };

  const navigateToDataEntry = () => {
    console.log('Data entry səhifəsinə yönləndirilir');
    // navigate('/data-entry');
  };

  // Əmin olaq ki, data undefined olmayacaq
  const safeData = data || defaultData;

  return {
    dashboard: safeData,
    isLoading,
    error,
    refetch,
    handleFormClick,
    navigateToDataEntry
  };
}
