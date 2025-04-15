
export type NotificationType = 'system' | 'category' | 'deadline' | 'approval' | 'form' | 'warning' | 'error' | 'success' | 'info';
export type NotificationPriority = 'low' | 'normal' | 'high';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  userId: string;
  priority: NotificationPriority;
  relatedId?: string;
  relatedType?: string;
  date?: string;
  time?: string;
}

// Supabase-dən gələn notification tipini tətbiq notification tipinə çevirən funksiya
export const adaptDbNotificationToApp = (dbNotification: any): Notification => {
  return {
    id: dbNotification.id,
    title: dbNotification.title,
    message: dbNotification.message,
    type: dbNotification.type as NotificationType, 
    priority: dbNotification.priority as NotificationPriority,
    userId: dbNotification.user_id,
    isRead: dbNotification.is_read,
    createdAt: dbNotification.created_at,
    relatedId: dbNotification.related_entity_id,
    relatedType: dbNotification.related_entity_type,
    date: dbNotification.date || new Date(dbNotification.created_at).toISOString().split('T')[0],
    time: dbNotification.time || new Date(dbNotification.created_at).toTimeString().slice(0, 5)
  };
};
