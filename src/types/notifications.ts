
export type NotificationType = 'info' | 'warning' | 'success' | 'error';
export type NotificationPriority = 'normal' | 'high';

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
}
