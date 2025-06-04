
export interface AppNotification {
  id: string;
  title: string;
  message?: string;
  type: string;
  priority?: string;
  is_read: boolean;
  isRead?: boolean; // Alias for compatibility
  user_id: string;
  related_entity_type?: string;
  related_entity_id?: string;
  created_at: string;
  createdAt?: string; // Alias for compatibility
  timestamp?: string; // Additional alias for compatibility
}

export interface Notification extends AppNotification {}

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'deadline' | 'system' | 'approval';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

export interface NotificationFilters {
  type?: string;
  priority?: string;
  is_read?: boolean;
  date_range?: {
    start: string;
    end: string;
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
  by_type?: Record<string, number>;
  by_priority?: Record<string, number>;
}

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
  system: boolean;
  inApp?: boolean;
  push?: boolean;
  sms?: boolean;
  deadlineReminders?: boolean;
  statusUpdates?: boolean;
  weeklyReports?: boolean;
  deadline?: boolean; // Added missing deadline property
}

// Adapter functions
export function adaptDashboardNotificationToApp(notification: any): AppNotification {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type || 'info',
    is_read: notification.is_read || notification.isRead || false,
    isRead: notification.is_read || notification.isRead || false,
    user_id: notification.user_id,
    created_at: notification.created_at || notification.createdAt || new Date().toISOString(),
    createdAt: notification.created_at || notification.createdAt || new Date().toISOString(),
    timestamp: notification.created_at || notification.createdAt || new Date().toISOString(),
    priority: notification.priority || 'normal',
    related_entity_id: notification.related_entity_id || notification.relatedEntityId,
    related_entity_type: notification.related_entity_type || notification.relatedEntityType
  };
}

export function adaptNotificationForDatabase(notification: AppNotification): any {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    is_read: notification.is_read || notification.isRead || false,
    user_id: notification.user_id,
    created_at: notification.created_at || notification.createdAt,
    priority: notification.priority,
    related_entity_id: notification.related_entity_id,
    related_entity_type: notification.related_entity_type
  };
}
