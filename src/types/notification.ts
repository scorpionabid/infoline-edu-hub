
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
    createdAt: data.created_at,
    time: new Date(data.created_at).toLocaleTimeString(),
    isRead: data.is_read,
    userId: data.user_id,
    priority: data.priority,
    read_status: data.is_read,
    relatedEntityId: data.related_entity_id || '',
    relatedEntityType: data.related_entity_type as NotificationEntityType
  };
};
