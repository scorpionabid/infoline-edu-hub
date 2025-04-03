
import { DashboardData } from '@/types/dashboard';
import { FormItem, FormStatus } from '@/types/form';
import { getMockNotifications } from '@/hooks/dashboard/mockDashboardData';

/**
 * Tüm dashboard'lar için temel verileri sağlar
 */
export const getBaseDashboardData = (): DashboardData => {
  return {
    notifications: getMockNotifications(),
    activityData: getRecentActivity(),
    pendingForms: getPendingForms()
  };
};

/**
 * Son aktiviteler için mock veri döndürür
 */
const getRecentActivity = () => {
  return [
    {
      id: '1',
      action: 'Yeni kateqoriya əlavə edildi',
      actor: 'Admin İstifadəçi',
      target: 'Şagird məlumatları',
      time: '10 dəq əvvəl'
    },
    {
      id: '2',
      action: 'Məktəb yeniləndi',
      actor: 'Region Admini',
      target: '158 saylı məktəb',
      time: '30 dəq əvvəl'
    },
    {
      id: '3',
      action: 'Məlumatlar təsdiqləndi',
      actor: 'Sektor Admini',
      target: '20 saylı məktəb',
      time: '1 saat əvvəl'
    },
    {
      id: '4',
      action: 'Yeni istifadəçi əlavə edildi',
      actor: 'Admin İstifadəçi',
      target: 'Məktəb Müdiri',
      time: '3 saat əvvəl'
    }
  ];
};

/**
 * Form statuslarına görə sayım geri qaytarır
 */
export const getFormStatusCounts = () => {
  return {
    pending: 12,
    approved: 45,
    rejected: 3,
    overdue: 2,
    dueSoon: 5
  };
};

/**
 * Gözləmədə olan formlar için mock veri 
 */
const getPendingForms = (): FormItem[] => {
  return [
    {
      id: 'form1',
      title: 'Şagird məlumatları',
      status: 'pending' as FormStatus,
      completionPercentage: 90,
      deadline: '2023-12-31'
    },
    {
      id: 'form2',
      title: 'Müəllim məlumatları',
      status: 'pending' as FormStatus,
      completionPercentage: 75,
      deadline: '2023-12-25'
    },
    {
      id: 'form3',
      title: 'İnfrastruktur məlumatları',
      status: 'overdue' as FormStatus,
      completionPercentage: 60,
      deadline: '2023-12-10'
    },
    {
      id: 'form4',
      title: 'Maliyyə məlumatları',
      status: 'dueSoon' as FormStatus,
      completionPercentage: 30,
      deadline: '2023-12-22'
    }
  ];
};

/**
 * Tamamlanmış formların listəsini geri qaytarır
 */
export const getCompletedForms = (): FormItem[] => {
  return [
    {
      id: 'form5',
      title: 'Tədris proqramı',
      status: 'approved' as FormStatus,
      completionPercentage: 100,
      deadline: '2023-11-30'
    },
    {
      id: 'form6',
      title: 'Şagird davamiyyəti',
      status: 'approved' as FormStatus,
      completionPercentage: 100,
      deadline: '2023-11-15'
    }
  ];
};
