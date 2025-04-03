
import { ActivityItem } from '@/types/dashboard';
import { FormItem, FormStatus } from '@/types/form';
import { getMockCategories } from '@/data/mock/mockCategories';

/**
 * Əsas kateqoriyaların tamamlanma statistikasını əldə edir
 */
export const getCategoryCompletionData = () => {
  const categories = getMockCategories();
  
  return categories.map(category => ({
    name: category.name,
    completed: Math.floor(Math.random() * 100),
    total: 100,
    percentage: category.completionRate || 0
  }));
};

/**
 * Son aktivitələr üçün mock məlumatlar
 */
export const getMockActivityData = (): ActivityItem[] => {
  return [
    {
      id: 'activity-1',
      action: 'Yeni məktəb əlavə edildi',
      actor: 'Admin İstifadəçi',
      target: '158 saylı məktəb',
      time: '10 dəqiqə əvvəl'
    },
    {
      id: 'activity-2',
      action: 'Kateqoriya yeniləndi',
      actor: 'Region Admini',
      target: 'Şagird məlumatları',
      time: '30 dəqiqə əvvəl'
    },
    {
      id: 'activity-3',
      action: 'Məlumatlar təsdiqləndi',
      actor: 'Sektor Admini',
      target: '20 saylı məktəb',
      time: '1 saat əvvəl'
    }
  ];
};

/**
 * Son tamamlanan tapşırıqlar üçün mock məlumatlar
 */
export const getMockRecentForms = (): FormItem[] => {
  return [
    {
      id: 'form-1',
      title: 'Şagird məlumatları',
      status: 'approved' as FormStatus,
      completionPercentage: 100,
    },
    {
      id: 'form-2',
      title: 'Müəllim məlumatları',
      status: 'rejected' as FormStatus,
      completionPercentage: 80,
    },
    {
      id: 'form-3',
      title: 'İnfrastruktur məlumatları',
      status: 'pending' as FormStatus,
      completionPercentage: 70,
    }
  ];
};

/**
 * Pending forms üçün mock məlumatlar
 */
export const getMockPendingForms = (): FormItem[] => {
  return [
    {
      id: 'pending-1',
      title: 'Şagird məlumatları',
      status: 'pending' as FormStatus,
      completionPercentage: 90,
    },
    {
      id: 'pending-2',
      title: 'Maliyyə məlumatları',
      status: 'pending' as FormStatus,
      completionPercentage: 60,
    },
    {
      id: 'pending-3',
      title: 'Kitabxana məlumatları',
      status: 'pending' as FormStatus,
      completionPercentage: 50,
    }
  ];
};

/**
 * Yaxınlaşan son tarixlər üçün mock məlumatlar
 */
export const getMockUpcomingDeadlines = (): FormItem[] => {
  return [
    {
      id: 'deadline-1',
      title: 'Şagird məlumatları',
      status: 'dueSoon' as FormStatus,
      completionPercentage: 70,
      deadline: '2023-12-31'
    },
    {
      id: 'deadline-2',
      title: 'Müəllim məlumatları',
      status: 'dueSoon' as FormStatus,
      completionPercentage: 50,
      deadline: '2023-12-25'
    },
    {
      id: 'deadline-3',
      title: 'İnfrastruktur məlumatları',
      status: 'overdue' as FormStatus,
      completionPercentage: 20,
      deadline: '2023-12-10'
    }
  ];
};
