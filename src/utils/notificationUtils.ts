
import { AppNotification, DashboardNotification } from '@/types/notification';

/**
 * Adapts a dashboard notification to an AppNotification format
 * @param notification The dashboard notification to adapt
 * @returns The adapted AppNotification
 */
export const adaptDashboardNotificationToApp = (notification: any): AppNotification => {
  if (!notification) return {} as AppNotification;
  
  return {
    id: notification.id || '',
    title: notification.title || '',
    message: notification.message || '',
    type: notification.type || 'info',
    isRead: notification.isRead || false,
    date: notification.createdAt || notification.timestamp || notification.date || new Date().toISOString(),
    createdAt: notification.createdAt || notification.timestamp || new Date().toISOString(),
    relatedEntityId: notification.relatedEntityId || notification.entityId || '',
    relatedEntityType: notification.relatedEntityType || notification.entityType || '',
    priority: notification.priority || 'normal',
  };
};

/**
 * Adapts an AppNotification to a dashboard notification format
 * @param notification The app notification to adapt
 * @returns The adapted dashboard notification
 */
export const adaptAppNotificationToDashboard = (notification: AppNotification): DashboardNotification => {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    isRead: notification.isRead,
    timestamp: notification.createdAt || notification.date,
    entityId: notification.relatedEntityId,
    entityType: notification.relatedEntityType
  };
};

// Alias functions for backward compatibility
export const adaptDashboardToAppNotification = adaptDashboardNotificationToApp;
export const adaptAppToDashboardNotification = adaptAppNotificationToDashboard;
