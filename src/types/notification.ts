
// Notification interfeysi və açıq adapterlər
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'deadline' | 'approval' | 'category' | 'system';
  isRead: boolean;
  read?: boolean;
  createdAt?: string;
  timestamp?: string;
  date?: string;
  priority?: 'normal' | 'high' | 'critical';
  relatedEntityId?: string;
  relatedEntityType?: string;
}

// Applikasiya içində istifadə ediləcək tip
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'deadline' | 'approval' | 'category' | 'system';
  date: string;
  isRead: boolean;
  priority?: 'normal' | 'high' | 'critical';
  relatedEntityId?: string;
  relatedEntityType?: string;
}

// Dashboard notifikasiyası
export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'deadline' | 'approval' | 'category' | 'system';
  date: string;
  isRead: boolean;
  read?: boolean;
  createdAt?: string;
  timestamp?: string;
  priority?: 'normal' | 'high' | 'critical';
  relatedEntityId?: string;
  relatedEntityType?: string;
}

// NotificationType
export interface NotificationType {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'deadline' | 'approval' | 'category' | 'system';
  isRead: boolean;
  read?: boolean;
  createdAt?: string;
  timestamp?: string;
  date?: string;
  priority?: 'normal' | 'high' | 'critical';
  relatedEntityId?: string;
  relatedEntityType?: string;
}

// Adapter funksiyası - dashboard notification'ları app notification formatına çevirmək üçün
export function adaptDashboardNotificationToApp(notification: any): AppNotification {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    date: notification.date || notification.createdAt || notification.timestamp || new Date().toISOString(),
    isRead: notification.isRead || notification.read || false,
    priority: notification.priority || 'normal',
    relatedEntityId: notification.relatedEntityId || notification.related_entity_id,
    relatedEntityType: notification.relatedEntityType || notification.related_entity_type
  };
}

// DB notification'ları app notification formatına çevirmək üçün
export function adaptDbNotificationToApp(notification: any): Notification {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    isRead: notification.is_read || false,
    createdAt: notification.created_at,
    priority: notification.priority || 'normal',
    relatedEntityId: notification.related_entity_id,
    relatedEntityType: notification.related_entity_type
  };
}
