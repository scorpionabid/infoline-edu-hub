
export type NotificationType = 'system' | 'category' | 'deadline' | 'approval' | 'form' | 'warning' | 'error' | 'success' | 'info';
export type NotificationPriority = 'low' | 'normal' | 'high';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  userId: string;
  priority: NotificationPriority;
  relatedId?: string;
  relatedType?: string;
  date?: string;
  time?: string;
}
