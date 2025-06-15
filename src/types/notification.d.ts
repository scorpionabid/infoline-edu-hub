
export interface AppNotification {
  id: string;
  title: string;
  message?: string;
  type?: string;
  isRead?: boolean;
  createdAt: string;
  date?: string;
  priority?: NotificationPriority | string;
  link?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  is_read?: boolean;
}

export interface DashboardNotification extends AppNotification {
  related_entity_id?: string;
  related_entity_type?: string;
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

export interface NotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  notification_frequency: 'immediate' | 'daily' | 'weekly' | 'never';
  email?: boolean;
  inApp?: boolean;
  sms?: boolean;
  deadlineReminders?: boolean;
  system?: boolean;
}

export function adaptDashboardNotificationToApp(notification: any): AppNotification {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type || 'info',
    isRead: notification.is_read || notification.isRead || false,
    createdAt: notification.created_at || notification.createdAt || new Date().toISOString(),
    date: notification.date || notification.created_at || notification.createdAt || new Date().toISOString(),
    priority: notification.priority || 'normal',
    link: notification.link,
    relatedEntityId: notification.related_entity_id || notification.relatedEntityId,
    relatedEntityType: notification.related_entity_type || notification.relatedEntityType
  };
}
