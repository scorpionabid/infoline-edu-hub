
import { NotificationType, NotificationEntityType } from '@/components/dashboard/NotificationType';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  time: string; // formatted time
  isRead: boolean;
  userId: string;
  priority: string;
  read_status: boolean;
  relatedEntityId: string;
  relatedEntityType: NotificationEntityType;
}

export const adaptNotification = (data: any): Notification => {
  return {
    id: data.id,
    type: data.type as NotificationType,
    title: data.title,
    message: data.message,
    createdAt: data.created_at || data.createdAt,
    time: data.time || new Date(data.created_at || data.createdAt).toLocaleTimeString(),
    isRead: data.is_read || data.isRead || false,
    userId: data.user_id || data.userId,
    priority: data.priority || 'normal',
    read_status: data.is_read || data.read_status || false,
    relatedEntityId: data.related_entity_id || data.relatedEntityId || '',
    relatedEntityType: (data.related_entity_type || data.relatedEntityType) as NotificationEntityType
  };
};
