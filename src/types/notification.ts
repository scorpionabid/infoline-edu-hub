
export type NotificationType = 'info' | 'warning' | 'success' | 'error' | 'system' | 'category' | 'deadline' | 'approval';
export type NotificationPriority = 'normal' | 'high' | 'low';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  userId: string;
  priority: NotificationPriority;
  time: string;
  date: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}
