
export type NotificationPriority = 'normal' | 'high' | 'critical';

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: NotificationPriority;
  relatedEntityId?: string;
  relatedEntityType?: string;
  createdAt?: string;
}

export type NotificationType = 
  | 'new_category'
  | 'deadline'
  | 'approval'
  | 'rejection'
  | 'system'
  | 'update';

export interface DbNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message?: string;
  related_entity_id?: string;
  related_entity_type?: string;
  is_read: boolean;
  priority: NotificationPriority;
  created_at: string;
}

// Verilənlər bazasından gələn bildirişləri tətbiq formatına çevirir
export function adaptDbNotificationToApp(dbNotification: DbNotification): Notification {
  return {
    id: dbNotification.id,
    title: dbNotification.title,
    message: dbNotification.message || '',
    timestamp: dbNotification.created_at,
    isRead: dbNotification.is_read,
    priority: dbNotification.priority,
    relatedEntityId: dbNotification.related_entity_id,
    relatedEntityType: dbNotification.related_entity_type,
    createdAt: dbNotification.created_at,
  };
}
