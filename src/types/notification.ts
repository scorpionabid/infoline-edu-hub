
export type NotificationType = 'info' | 'warning' | 'success' | 'error' | 'system';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type NotificationEntityType = 'system' | 'category' | 'column' | 'school' | 'user' | 'region' | 'sector' | 'form' | 'report';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  userId: string;
  createdAt: string;
  isRead: boolean;
  time: string;
  relatedEntityId: string;
  relatedEntityType: NotificationEntityType;
  read_status?: boolean; // api uyğunluğu üçün
}
