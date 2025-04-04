
import { ActivityItem } from '@/types/dashboard';
import { FormItem, FormStatus } from '@/types/form';
import { Notification } from '@/types/notification';

// Notifications üçün adapter
export const adaptNotifications = (notifications: any[]): Notification[] => {
  return notifications.map(notification => ({
    id: notification.id || '',
    type: notification.type || 'info',
    title: notification.title || '',
    message: notification.message || '',
    priority: notification.priority || 'normal',
    userId: notification.userId || notification.user_id || '',
    createdAt: notification.createdAt || notification.created_at || new Date().toISOString(),
    isRead: notification.isRead || notification.is_read || false,
    time: notification.time || formatTimeFromNow(notification.created_at || notification.createdAt),
    relatedEntityId: notification.relatedEntityId || notification.related_entity_id || '',
    relatedEntityType: notification.relatedEntityType || notification.related_entity_type || 'system',
  }));
};

// Form statuslarını düzəltmək üçün adapter
export const adaptFormStatus = (status: string): FormStatus => {
  switch (status.toLowerCase()) {
    case 'approved':
    case 'təsdiqlənib': 
      return 'approved';
    case 'rejected': 
    case 'rədd edilib':
      return 'rejected';
    case 'pending': 
    case 'gözləmədə':
      return 'pending';
    case 'overdue':
    case 'gecikmiş':
      return 'overdue';
    case 'due_soon':
    case 'müddəti yaxınlaşır':
      return 'due_soon';
    default:
      return 'pending';
  }
};

// Form items üçün adapter
export const adaptFormItems = (items: any[]): FormItem[] => {
  return items.map(item => ({
    id: item.id || '',
    title: item.title || '',
    status: adaptFormStatus(item.status || 'pending'),
    completionPercentage: item.completionPercentage || item.completion_percentage || 0,
    deadline: item.deadline || null,
    categoryId: item.categoryId || item.category_id || '',
    filledCount: item.filledCount || item.filled_count || 0,
    totalCount: item.totalCount || item.total_count || 0,
  }));
};

// Activity items üçün adapter
export const adaptActivityItems = (items: any[]): ActivityItem[] => {
  return items.map(item => ({
    id: item.id || '',
    type: item.type || 'action',
    title: item.title || '',
    description: item.description || '',
    timestamp: item.timestamp || new Date().toISOString(),
    userId: item.userId || item.user_id || '',
    action: item.action || '',
    actor: item.actor || '',
    target: item.target || '',
    time: item.time || formatTimeFromNow(item.timestamp || item.created_at),
  }));
};

// Tarix formatını şəkilləndirmə funksiyası (sadə versiya)
export const formatTimeFromNow = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.round(diffMs / 60000); // millisecond -> minute
  
  if (diffMins < 1) {
    return 'indicə';
  } else if (diffMins < 60) {
    return `${diffMins} dəqiqə əvvəl`;
  } else if (diffMins < 24 * 60) {
    const diffHours = Math.round(diffMins / 60);
    return `${diffHours} saat əvvəl`;
  } else {
    const diffDays = Math.round(diffMins / (60 * 24));
    return `${diffDays} gün əvvəl`;
  }
};

// Kateqoriya tamamlanması üçün mock data
export const getMockCategoryCompletion = () => [
  { name: 'Məktəb Məlumatları', completed: 85 },
  { name: 'Şagird Statistikası', completed: 65 },
  { name: 'Müəllimlər', completed: 90 },
  { name: 'İnfrastruktur', completed: 45 },
  { name: 'Maliyyə', completed: 20 },
];
