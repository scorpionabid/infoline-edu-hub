
import { NotificationType, NotificationEntityType } from '@/components/dashboard/NotificationType';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: 'normal' | 'high' | 'critical';
  createdAt: string;
  isRead: boolean;
  userId: string;
  relatedEntityId?: string;
  relatedEntityType?: NotificationEntityType;
  read_status?: boolean;
}

export const adaptNotification = (notification: any): Notification => {
  return {
    id: notification.id || '',
    title: notification.title || '',
    message: notification.message || '',
    type: notification.type as NotificationType || 'info',
    priority: notification.priority || 'normal',
    createdAt: notification.createdAt || notification.created_at || new Date().toISOString(),
    isRead: notification.isRead || notification.is_read || false,
    userId: notification.userId || notification.user_id || '',
    relatedEntityId: notification.relatedEntityId || notification.related_entity_id,
    relatedEntityType: notification.relatedEntityType || notification.related_entity_type,
    read_status: notification.read_status
  };
};
