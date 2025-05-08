
import { DashboardNotification } from '@/types/dashboard';
import { AppNotification } from '@/types/notification';

export function adaptDashboardNotificationToApp(notification: DashboardNotification): AppNotification {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type as 'info' | 'success' | 'warning' | 'error',
    isRead: notification.isRead,
    timestamp: notification.timestamp || notification.createdAt,
    createdAt: notification.createdAt,
    priority: notification.priority as 'low' | 'normal' | 'high' | undefined,
  };
}

// Add aliases for backward compatibility
export const adaptDashboardToAppNotification = adaptDashboardNotificationToApp;

export function adaptAppNotificationToDashboard(notification: AppNotification): DashboardNotification {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    isRead: notification.isRead,
    timestamp: notification.timestamp,
    createdAt: notification.createdAt,
    priority: notification.priority,
  };
}

// Add alias for backward compatibility
export const adaptAppToDashboardNotification = adaptAppNotificationToDashboard;
