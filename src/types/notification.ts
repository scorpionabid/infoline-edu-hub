
export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'deadline' | 'approval' | 'category' | 'system';
  date: string;
  isRead: boolean;
  read?: boolean;
  createdAt?: string;
  timestamp?: string;
  priority?: 'normal' | 'high' | 'critical';
}

// Applikasiya içində istifadə ediləcək tip
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'deadline' | 'approval' | 'category' | 'system';
  date: string;
  isRead: boolean;
  priority?: 'normal' | 'high' | 'critical';
}

// NotificationType
export interface NotificationType {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'deadline' | 'approval' | 'category' | 'system';
  isRead: boolean;
  read?: boolean;
  createdAt?: string;
  timestamp?: string;
  date?: string;
  priority?: 'normal' | 'high' | 'critical';
}

// Adapter funksiyası - dashboard notification'ları app notification formatına çevirmək üçün
export function adaptDashboardNotificationToApp(notification: any): AppNotification {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    date: notification.date || notification.createdAt || notification.timestamp || new Date().toISOString(),
    isRead: notification.isRead || notification.read || false,
    priority: notification.priority || 'normal'
  };
}
