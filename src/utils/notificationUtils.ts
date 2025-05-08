
import { DashboardNotification } from '@/types/dashboard';
import { AppNotification } from '@/types/notification';

export const adaptDashboardNotificationToApp = (notification: any): AppNotification => {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message || '',
    timestamp: notification.date || new Date().toISOString(),
    isRead: notification.isRead || false,
    type: notification.type || 'info',
    entityType: notification.entityType || 'notification',
    entityId: notification.entityId || null,
    userId: notification.userId || '',
  };
};

export const adaptAppNotificationToDashboard = (notification: AppNotification): DashboardNotification => {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message || '',
    date: notification.timestamp || new Date().toISOString(),
    isRead: notification.isRead || false,
    type: notification.type || 'info',
  };
};

// Alias functions for backward compatibility
export const adaptDashboardToAppNotification = adaptDashboardNotificationToApp;
export const adaptAppToDashboardNotification = adaptAppNotificationToDashboard;
