

export type NotificationPriority = 'normal' | 'high' | 'critical';

export type NotificationType = 
  | 'new_category'
  | 'deadline'
  | 'approval'
  | 'rejection'
  | 'system'
  | 'update'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'category'
  | 'form';

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
  type: NotificationType | string;
}

// Dashboard üçün istifadə olunan bildiriş tipi
export interface DashboardNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  date?: string;
  isRead: boolean;
  priority?: NotificationPriority;
  relatedEntityId?: string;
  relatedEntityType?: string;
  createdAt?: string;
  read?: boolean;
}

export interface DbNotification {
  id: string;
  user_id: string;
  type: NotificationType | string;
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
    type: dbNotification.type
  };
}

// Dashboard bildirişlərini tətbiq formatına çevirir
export function adaptDashboardNotificationToApp(dashboardNotification: any): DashboardNotification {
  return {
    id: dashboardNotification.id || `notification-${Date.now()}`,
    type: dashboardNotification.type || 'info',
    title: dashboardNotification.title || '',
    message: dashboardNotification.message || '',
    date: dashboardNotification.date || dashboardNotification.createdAt || new Date().toISOString(),
    isRead: dashboardNotification.isRead || dashboardNotification.is_read || false,
    priority: dashboardNotification.priority || 'normal',
    relatedEntityId: dashboardNotification.relatedEntityId || dashboardNotification.related_entity_id,
    relatedEntityType: dashboardNotification.relatedEntityType || dashboardNotification.related_entity_type,
    createdAt: dashboardNotification.createdAt || dashboardNotification.created_at || new Date().toISOString()
  };
}

