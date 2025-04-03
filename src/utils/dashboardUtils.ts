
import { 
  ActivityItem,
  DashboardData,
  SuperAdminDashboardData,
  RegionAdminDashboardData,
  SectorAdminDashboardData,
  SchoolAdminDashboardData
} from '@/types/dashboard';
import { Notification, adaptNotification } from '@/types/notification';
import { FormItem } from '@/types/form';

// Notification formatını uyğunlaşdırma funksiyası
export const adaptNotifications = (notifications: any[]): Notification[] => {
  if (!notifications || !Array.isArray(notifications)) {
    console.warn('Notifications is not an array:', notifications);
    return [];
  }
  
  return notifications.map(notification => adaptNotification(notification));
};

// FormItem-ləri Form formatına çevirmək üçün helper funksiya
export const adaptFormItems = (formItems: any[]): FormItem[] => {
  if (!formItems || !Array.isArray(formItems)) {
    console.warn('FormItems is not an array:', formItems);
    return [];
  }
  
  return formItems.map(item => ({
    id: item.id || '',
    title: item.title || '',
    categoryId: item.categoryId || '',
    status: item.status || 'draft',
    completionPercentage: item.completionPercentage || 0,
    deadline: item.deadline || '',
    filledCount: item.filledCount || 0,
    totalCount: item.totalCount || 0
  }));
};

// ActivityItem-ləri adapta etmək üçün helper funksiya
export const adaptActivityItems = (activities: any[]): ActivityItem[] => {
  if (!activities || !Array.isArray(activities)) {
    console.warn('Activities is not an array:', activities);
    return [];
  }
  
  return activities.map(item => ({
    id: item.id || '',
    type: item.type || '',
    title: item.title || '',
    description: item.description || '',
    timestamp: item.timestamp || '',
    userId: item.userId || '',
    action: item.action || '',
    actor: item.actor || '',
    target: item.target || '',
    time: item.time || ''
  }));
};

// Kateqoriya tamamlanma məlumatı üçün mock data generator
export const getMockCategoryCompletion = () => [
  { name: 'Ümumi Məlumatlar', completed: 85 },
  { name: 'Şagird Məlumatları', completed: 65 },
  { name: 'Müəllim Məlumatları', completed: 70 },
  { name: 'İnfrastruktur', completed: 40 },
  { name: 'Tədris Planı', completed: 55 }
];
