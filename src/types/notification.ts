
export type NotificationType = 'info' | 'warning' | 'success' | 'error' | 'system' | 'category' | 'deadline' | 'approval';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  userId: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  time?: string; // Əlavə vaxt sahəsi
}
