
export type NotificationType = 'info' | 'warning' | 'error' | 'success' | 'system' | 'approval' | 'deadline';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  date?: string;
  priority?: 'low' | 'normal' | 'high';
  relatedEntityId?: string;
  relatedEntityType?: string;
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead?: boolean;
  createdAt?: string;
  date?: string;
  priority?: string;
}

export interface NotificationsCardProps {
  title: string;
  notifications: AppNotification[];
  onMarkAsRead?: (id: string) => void;
}

// Helper function to adapt dashboard notifications to app notifications
export const adaptDashboardNotificationToApp = (notification: DashboardNotification): AppNotification => {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type as NotificationType,
    isRead: notification.isRead ?? false,
    createdAt: notification.createdAt || notification.date || new Date().toISOString(),
    date: notification.date,
    priority: notification.priority as 'low' | 'normal' | 'high' | undefined,
  };
};
