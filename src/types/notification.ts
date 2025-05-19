
export interface AppNotification {
  id: string;
  title: string;
  message?: string;
  timestamp?: string;
  createdAt: string;
  isRead?: boolean;
  is_read?: boolean;
  type?: 'info' | 'success' | 'warning' | 'error' | 'deadline' | string;
  link?: string;
  entityId?: string;
  entityType?: string;
  priority?: NotificationPriority | string;
  relatedEntityId?: string;
  related_entity_id?: string;
  relatedEntityType?: string;
  related_entity_type?: string;
  date?: string;
  user_id?: string;
}

// For backward compatibility
export type Notification = AppNotification;

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

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  inApp: boolean;
  system: boolean;
  deadline: boolean;
  sms?: boolean;
  deadlineReminders?: boolean;
  statusUpdates?: boolean;
  weeklyReports?: boolean;
}

// Adapter for converting DB format to app format
export function adaptDashboardNotificationToApp(notification: any): AppNotification {
  return {
    id: notification.id || crypto.randomUUID(),
    title: notification.title || 'Notification',
    message: notification.message || notification.content || '',
    timestamp: notification.date || notification.createdAt || notification.created_at || new Date().toISOString(),
    createdAt: notification.created_at || notification.createdAt || notification.date || new Date().toISOString(),
    isRead: notification.isRead || notification.is_read || false,
    is_read: notification.isRead || notification.is_read || false,
    type: notification.type || 'info',
    link: notification.link,
    entityId: notification.entityId || notification.related_entity_id,
    entityType: notification.entityType || notification.related_entity_type,
    priority: notification.priority || 'normal',
    relatedEntityId: notification.related_entity_id || notification.relatedEntityId,
    relatedEntityType: notification.related_entity_type || notification.relatedEntityType,
    related_entity_id: notification.related_entity_id || notification.relatedEntityId,
    related_entity_type: notification.related_entity_type || notification.relatedEntityType,
    date: notification.date || notification.created_at || new Date().toISOString(),
    user_id: notification.user_id
  };
}

// Convert app notifications to db format
export function adaptNotificationForDatabase(notification: AppNotification): any {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type || 'info',
    is_read: notification.isRead || notification.is_read || false,
    created_at: notification.createdAt || notification.timestamp || new Date().toISOString(),
    priority: notification.priority || 'normal',
    related_entity_id: notification.relatedEntityId || notification.related_entity_id,
    related_entity_type: notification.relatedEntityType || notification.related_entity_type,
    user_id: notification.user_id
  };
}
