
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  createdAt: string;
  isRead: boolean;
  type?: 'info' | 'success' | 'warning' | 'error' | 'deadline';
  link?: string;
  entityId?: string;
  entityType?: string;
  priority?: NotificationPriority;
  relatedEntityId?: string;
  relatedEntityType?: string;
  date?: string;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'deadline';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

export interface NotificationsCardProps {
  title: string;
  notifications: AppNotification[];
  maxItems?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const adaptDashboardNotificationToApp = (notification: any): AppNotification => {
  return {
    id: notification.id || crypto.randomUUID(),
    title: notification.title || 'Notification',
    message: notification.message || notification.content || '',
    timestamp: notification.date || notification.createdAt || notification.timestamp || new Date().toISOString(),
    createdAt: notification.created_at || notification.createdAt || notification.date || new Date().toISOString(),
    isRead: notification.isRead || false,
    type: notification.type || 'info',
    link: notification.link,
    entityId: notification.entityId || notification.related_entity_id,
    entityType: notification.entityType || notification.related_entity_type,
    priority: notification.priority || 'normal',
    relatedEntityId: notification.related_entity_id || notification.relatedEntityId,
    relatedEntityType: notification.related_entity_type || notification.relatedEntityType,
    date: notification.date || notification.created_at || new Date().toISOString()
  };
};
