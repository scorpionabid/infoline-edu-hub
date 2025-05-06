
export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  date: string;
  isRead: boolean;
  read?: boolean;
  createdAt?: string;
}

// Applikasiya içində istifadə ediləcək tip
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  date: string;
  isRead: boolean;
}

// Adapter funksiyası - dashboard notification'ları app notification formatına çevirmək üçün
export function adaptDashboardNotificationToApp(notification: any): AppNotification {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    date: notification.date || notification.createdAt || new Date().toISOString(),
    isRead: notification.isRead || notification.read || false
  };
}
