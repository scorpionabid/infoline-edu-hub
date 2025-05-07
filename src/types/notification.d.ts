
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
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

export function adaptAppNotificationToDashboard(notification: AppNotification): DashboardNotification {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    date: notification.date,
    isRead: notification.isRead,
    type: notification.type,
    priority: notification.priority
  };
}
