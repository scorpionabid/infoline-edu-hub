
import { AppNotification } from '@/types/notification';
import { DashboardNotification } from '@/types/dashboard';

/**
 * Converts a dashboard notification to app notification format
 */
export const adaptDashboardNotificationToApp = (notification: DashboardNotification): AppNotification => {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    date: notification.date,
    isRead: notification.isRead,
    priority: notification.type === 'error' ? 'high' : 'normal',
    relatedEntityId: notification.id,
    relatedEntityType: 'notification'
  };
};

/**
 * Converts an app notification to dashboard notification format
 */
export const adaptAppNotificationToDashboard = (notification: AppNotification): DashboardNotification => {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    date: notification.date || new Date().toISOString(),
    isRead: notification.isRead
  };
};

// Aliases for compatibility
export const adaptDashboardToAppNotification = adaptDashboardNotificationToApp;
export const adaptAppToDashboardNotification = adaptAppNotificationToDashboard;
