
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type?: 'info' | 'success' | 'warning' | 'error';
  link?: string;
  entityId?: string;
  entityType?: string;
}

export const adaptDashboardNotificationToApp = (notification: any): AppNotification => {
  return {
    id: notification.id || crypto.randomUUID(),
    title: notification.title || 'Notification',
    message: notification.message || notification.content || '',
    timestamp: notification.date || notification.createdAt || notification.timestamp || new Date().toISOString(),
    isRead: notification.isRead || false,
    type: notification.type || 'info',
    link: notification.link,
    entityId: notification.entityId || notification.related_entity_id,
    entityType: notification.entityType || notification.related_entity_type
  };
};
