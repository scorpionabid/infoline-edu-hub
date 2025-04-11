
import { Notification } from '@/types/notification';

export const formatNotifications = (notifications: any[]): Notification[] => {
  return notifications.map(notification => ({
    id: notification.id,
    title: notification.title,
    message: notification.message || '',
    type: notification.type,
    isRead: notification.is_read,
    createdAt: notification.created_at,
    userId: notification.user_id,
    priority: notification.priority || 'normal',
    time: formatTime(notification.created_at)
  }));
};

export const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'İndicə';
  if (diffMins < 60) return `${diffMins} dəqiqə əvvəl`;
  if (diffHours < 24) return `${diffHours} saat əvvəl`;
  if (diffDays < 7) return `${diffDays} gün əvvəl`;
  
  return date.toLocaleDateString();
};
