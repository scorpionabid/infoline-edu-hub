
import { Notification } from '@/types/notification';

// Demo notifications
export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'newCategory',
    title: 'Yeni kateqoriya əlavə edildi',
    message: 'Şagird məlumatları kateqoriyası sistem inzibatçısı tərəfindən əlavə edildi.',
    createdAt: new Date().toISOString(),
    time: '15 dəq əvvəl',
    isRead: false,
    userId: 'user-1',
    priority: 'normal',
    read_status: false,
    relatedEntityId: 'category-1',
    relatedEntityType: 'category'
  },
  {
    id: '2',
    type: 'dueDateReminder',
    title: 'Son tarix yaxınlaşır',
    message: 'Müəllim məlumatları formasının doldurulması üçün 2 gün qalıb.',
    createdAt: new Date().toISOString(),
    time: '1 saat əvvəl',
    isRead: true,
    userId: 'user-1',
    priority: 'high',
    read_status: true,
    relatedEntityId: 'category-2',
    relatedEntityType: 'category'
  },
  {
    id: '3',
    type: 'approved',
    title: 'Məlumatlar təsdiqləndi',
    message: 'Göndərdiyiniz məlumatlar təsdiq edildi.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    time: '1 gün əvvəl',
    isRead: false,
    userId: 'user-1',
    priority: 'normal',
    read_status: false,
    relatedEntityId: 'entry-1', 
    relatedEntityType: 'entry'
  },
  {
    id: '4',
    type: 'rejected',
    title: 'Məlumatlar rədd edildi',
    message: 'Göndərdiyiniz məlumatlar düzəlişlə qaytarıldı.',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    time: '2 gün əvvəl',
    isRead: true,
    userId: 'user-1', 
    priority: 'high',
    read_status: true,
    relatedEntityId: 'entry-2',
    relatedEntityType: 'entry'
  }
];

// Helper function to return demo notifications
export const getMockNotifications = (): Notification[] => {
  return mockNotifications;
};
