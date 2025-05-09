
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'deadline' | 'approval' | 'category' | 'system';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  priority?: NotificationPriority;
  relatedEntityId?: string;
  relatedEntityType?: string;
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  type: 'error' | 'info' | 'warning' | 'success';
  date: string;
  createdAt: string;
  isRead: boolean;
  timestamp: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  user_id: string;
  created_at: string;
  is_read: boolean;
  priority?: string;
  related_entity_type?: string;
  related_entity_id?: string;
}

export interface NotificationFilter {
  type?: NotificationType;
  isRead?: boolean;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export const adaptDbNotificationToApp = (dbNotification: Notification): AppNotification => ({
  id: dbNotification.id,
  title: dbNotification.title,
  message: dbNotification.message,
  type: dbNotification.type,
  isRead: dbNotification.is_read,
  createdAt: dbNotification.created_at,
  priority: dbNotification.priority as NotificationPriority,
  relatedEntityId: dbNotification.related_entity_id,
  relatedEntityType: dbNotification.related_entity_type
});
