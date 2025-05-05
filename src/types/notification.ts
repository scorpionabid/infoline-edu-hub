
export type NotificationType = 
  'system' | 'category' | 'deadline' | 'approval' | 'rejection' | 'comment' | 
  'warning' | 'error' | 'success' | 'info' | 'form';

export type NotificationPriority = 'low' | 'normal' | 'high';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead?: boolean;
  read?: boolean; // Geriyə uyğunluq üçün
  createdAt: string;
  userId?: string;
  priority?: NotificationPriority;
  relatedId?: string;
  relatedType?: string;
  date?: string; // Tarix (formatlanmış)
  timestamp?: string; // Geriuyğunluq üçün
  time?: string; // Zaman (formatlanmış)
}

// Supabase-dən gələn notification tipini tətbiq notification tipinə çevirən funksiya
export const adaptDbNotificationToApp = (dbNotification: any): Notification => {
  return {
    id: dbNotification.id,
    title: dbNotification.title || 'Bildiriş',
    message: dbNotification.message || '',
    type: dbNotification.type as NotificationType, 
    priority: dbNotification.priority as NotificationPriority || 'normal',
    userId: dbNotification.user_id,
    isRead: dbNotification.is_read,
    read: dbNotification.is_read,
    createdAt: dbNotification.created_at,
    relatedId: dbNotification.related_entity_id,
    relatedType: dbNotification.related_entity_type,
    date: dbNotification.date || new Date(dbNotification.created_at).toISOString().split('T')[0],
    timestamp: dbNotification.created_at,
    time: dbNotification.time || new Date(dbNotification.created_at).toTimeString().slice(0, 5)
  };
};

// Dashboard bildiişləri üçün tip
export interface DashboardNotification extends Notification {}

// Dashboard bildirişlərini app bildirişlərinə çevirmək üçün adapter
export const adaptDashboardNotificationToApp = (notification: any): Notification => {
  return {
    id: notification.id || `temp-${Date.now()}`,
    title: notification.title || notification.message || 'Bildiriş',
    message: notification.message || '',
    type: (notification.type || 'info') as NotificationType,
    isRead: notification.isRead || notification.read || false,
    read: notification.read || notification.isRead || false,
    createdAt: notification.createdAt || notification.timestamp || new Date().toISOString(),
    userId: notification.userId || '',
    priority: notification.priority || 'normal',
    date: notification.date || notification.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
    timestamp: notification.timestamp || notification.createdAt || new Date().toISOString(),
    time: notification.time || new Date().toTimeString().slice(0, 5)
  };
};

// App bildirişlərini dashboard bildirişlərinə çevirmək üçün adapter
export const adaptAppToDashboardNotification = (notification: Notification): DashboardNotification => {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    isRead: notification.isRead,
    read: notification.read,
    date: notification.date || notification.createdAt.split('T')[0],
    timestamp: notification.timestamp || notification.createdAt,
    createdAt: notification.createdAt,
    priority: notification.priority,
    userId: notification.userId
  };
};
