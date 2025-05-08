
// Bildiriş tipləri

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
  priority?: 'low' | 'medium' | 'high';
  relatedEntityId?: string;
  relatedEntityType?: string;
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
  priority?: 'low' | 'medium' | 'high';
}

// AppNotification-ı DashboardNotification-a çevirmək üçün adaptasiya funksiyası
export const adaptAppNotificationToDashboard = (
  notification: AppNotification
): DashboardNotification => {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    date: notification.createdAt,
    isRead: notification.isRead,
    type: notification.type,
    priority: notification.priority
  };
};
