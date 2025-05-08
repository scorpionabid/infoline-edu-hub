
export interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  type: NotificationType;
  relatedEntityId?: string;
  relatedEntityType?: string;
}

export type NotificationType = 'info' | 'warning' | 'error' | 'success' | 'deadline' | 'approval';

export function adaptDashboardNotificationToApp(notification: any): Notification {
  return {
    id: notification.id,
    title: notification.title || '',
    message: notification.message || '',
    createdAt: notification.date || notification.created_at || new Date().toISOString(),
    read: notification.read || false,
    type: notification.type || 'info',
    relatedEntityId: notification.related_entity_id,
    relatedEntityType: notification.related_entity_type
  };
}

export function adaptAppNotificationToDashboard(notification: Notification): any {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    date: notification.createdAt,
    read: notification.read,
    type: notification.type,
    related_entity_id: notification.relatedEntityId,
    related_entity_type: notification.relatedEntityType
  };
}

export const adaptDashboardToAppNotification = adaptDashboardNotificationToApp;
export const adaptAppToDashboardNotification = adaptAppNotificationToDashboard;
