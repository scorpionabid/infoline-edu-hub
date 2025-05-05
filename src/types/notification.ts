
// Müxtəlif bildiriş tipləri arasında uyğunluğu təmin edir
import { UINotification } from './dashboard';

export interface NotificationType {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  date: string;
  createdAt: string;
  relatedId?: string;
  relatedType?: string;
}

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
  };
};

// Geriyə uyğunluq üçün Notification tipini də təyin edirik
export type Notification = NotificationType;

export default NotificationType;
