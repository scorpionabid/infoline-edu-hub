
export type NotificationType = 'system' | 'category' | 'deadline' | 'approval' | 'form' | 
                              'warning' | 'error' | 'success' | 'info' | 'rejection' | 'comment';
export type NotificationPriority = 'low' | 'normal' | 'high';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  read?: boolean; // Geriyə uyğunluq üçün
  createdAt: string;
  userId: string;
  priority: NotificationPriority;
  relatedId?: string;
  relatedType?: string;
  date?: string; // Tarix (formatlanmış)
  time?: string; // Zaman (formatlanmış)
}

// Supabase-dən gələn notification tipini tətbiq notification tipinə çevirən funksiya
export const adaptDbNotificationToApp = (dbNotification: any): Notification => {
  return {
    id: dbNotification.id,
    title: dbNotification.title || 'Bildiriş',
    message: dbNotification.message,
    type: dbNotification.type as NotificationType, 
    priority: dbNotification.priority as NotificationPriority,
    userId: dbNotification.user_id,
    isRead: dbNotification.is_read,
    read: dbNotification.is_read,
    createdAt: dbNotification.created_at,
    relatedId: dbNotification.related_entity_id,
    relatedType: dbNotification.related_entity_type,
    date: dbNotification.date || new Date(dbNotification.created_at).toISOString().split('T')[0],
    time: dbNotification.time || new Date(dbNotification.created_at).toTimeString().slice(0, 5)
  };
};

// Dashboard bildiişləri üçün tip
export interface DashboardNotification {
  id: string;
  title: string; // Artıq optional deyil
  message: string;
  type: NotificationType; // Birləşdirilmiş tip
  isRead: boolean; // Artıq optional deyil
  read?: boolean;
  date?: string;
  createdAt: string; // Artıq optional deyil
  priority?: NotificationPriority;
}

// Dashboard bildirişlərini app bildirişlərinə çevirmək üçün adapter
export const adaptDashboardNotificationToApp = (notification: DashboardNotification): Notification => {
  return {
    id: notification.id,
    title: notification.title || 'Bildiriş',
    message: notification.message,
    type: notification.type,
    isRead: notification.isRead || notification.read || false,
    read: notification.read || notification.isRead || false,
    createdAt: notification.createdAt || new Date().toISOString(),
    userId: '', // Dashboard bildirişlərində userId olmaya bilər
    priority: notification.priority || 'normal',
    date: notification.date || new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5)
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
    createdAt: notification.createdAt,
    priority: notification.priority
  };
};
