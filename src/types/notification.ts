
export type NotificationType = 'system' | 'category' | 'deadline' | 'approval' | 'form' | 'user' | 'data';
export type NotificationPriority = 'normal' | 'high' | 'urgent' | 'low';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  date: string;
  time: string;
  isRead: boolean;
  userId: string;
  priority: NotificationPriority;
  relatedEntityId?: string;
  relatedEntityType?: string;
}
