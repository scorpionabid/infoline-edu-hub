
// Müxtəlif bildiriş tipləri arasında uyğunluğu təmin edir

export type NotificationType = {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system' | 'category' | 'deadline' | 'approval';
  isRead: boolean;
  read?: boolean; // backwards compatibility
  date?: string;
  createdAt: string;
  priority?: 'high' | 'normal' | 'low';
  time?: string; // Backwards compatibility üçün
  relatedId?: string;
  relatedType?: string;
};

// Dashboard tipləri ilə Notification tipləri arasında uyğunluğu təmin edək
export interface UINotification extends NotificationType {}

// Dashboard bildirişlərini tətbiq bildirişlərinə çevirmək üçün adapter
export const adaptDashboardNotificationToApp = (notification: UINotification): NotificationType => {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type || 'info',
    isRead: notification.isRead || notification.read || false,
    date: notification.date || new Date().toISOString().split('T')[0],
    createdAt: notification.createdAt || new Date().toISOString(),
    priority: notification.priority || 'normal',
  };
};

// Geriyə uyğunluq üçün Notification tipini də təyin edirik
export type Notification = NotificationType;
