
export type NotificationType = 'info' | 'warning' | 'success' | 'error' | 'system' | 'category' | 'deadline' | 'approval';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical' | 'urgent';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  userId: string;
  priority: NotificationPriority;
  time?: string;
  date?: string; // Əlavə edildi dashboard tipləri ilə uyğunluq üçün
}
