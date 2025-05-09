
import { AppNotification } from '@/types/notification';

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
    date: notification.createdAt || notification.timestamp || new Date().toISOString(),
    createdAt: notification.createdAt || notification.timestamp || new Date().toISOString(),
    relatedEntityId: notification.relatedEntityId || notification.entityId || '',
    relatedEntityType: notification.relatedEntityType || notification.entityType || '',
    priority: notification.priority || 'normal',
  };
};
