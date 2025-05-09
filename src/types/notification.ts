
export type NotificationType = 'info' | 'warning' | 'error' | 'success' | 'system' | 'approval' | 'deadline';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  date?: string;
  priority?: NotificationPriority;
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
  title?: string;
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
    priority: notification.priority as NotificationPriority | undefined,
  };
};

// Helper function to adapt app notifications to dashboard notifications
export const adaptAppNotificationToDashboard = (appNotification: AppNotification): DashboardNotification => {
  // Convert AppNotification types to DashboardNotification types
  let dashboardType: 'error' | 'info' | 'warning' | 'success' = 'info';
  
  switch(appNotification.type) {
    case 'error':
      dashboardType = 'error';
      break;
    case 'warning':
      dashboardType = 'warning';
      break;
    case 'success':
      dashboardType = 'success';
      break;
    case 'deadline':
    case 'approval':
    case 'system':
    case 'info':
    default:
      dashboardType = 'info';
      break;
  }

  return {
    id: appNotification.id,
    title: appNotification.title,
    message: appNotification.message,
    type: dashboardType,
    date: appNotification.createdAt,
    createdAt: appNotification.createdAt,
    isRead: appNotification.isRead,
  };
};
