
// Bu fayl əvvəldən mövcud olmaya bilər, tam olaraq yaradaq
import { Notification, UINotification } from './dashboard';

// Dashboard bildirişlərini tətbiq bildirişlərinə çevirmək üçün adapter
export const adaptDashboardNotificationToApp = (notification: Notification): UINotification => {
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

export default NotificationType;
