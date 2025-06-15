
export interface AppNotification {
  id: string;
  title: string;
  message?: string;
  description?: string;
  type?: string;
  isRead?: boolean;
  createdAt: string;
  created_at?: string;
  date?: string;
  priority?: NotificationPriority | string;
  link?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  is_read?: boolean;
  reference_id?: string;
  reference_type?: string;
}

export interface DashboardNotification extends AppNotification {
  related_entity_id?: string;
  related_entity_type?: string;
}

export interface Notification extends AppNotification {}

export interface NotificationData {
  id: string;
  title: string;
  description?: string;
  type: NotificationType;
  priority: NotificationPriority;
  is_read: boolean;
  created_at: string;
  reference_id?: string;
  reference_type?: string;
}

export interface NotificationFilters {
  type?: NotificationType[];
  priority?: NotificationPriority[];
  isRead?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
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
    created_at: notification.created_at || notification.createdAt || new Date().toISOString(),
    date: notification.date || notification.created_at || notification.createdAt || new Date().toISOString(),
    priority: notification.priority || 'normal',
    link: notification.link,
    relatedEntityId: notification.related_entity_id || notification.relatedEntityId,
    relatedEntityType: notification.related_entity_type || notification.relatedEntityType
  };
}
