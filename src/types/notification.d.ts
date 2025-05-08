
export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationPriority = 'low' | 'normal' | 'high';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  date?: string;
  isRead: boolean;
  priority?: NotificationPriority;
  relatedEntityId?: string;
  relatedEntityType?: string;
}
