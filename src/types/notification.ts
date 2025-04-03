
export type NotificationType = 
  | 'category_created' 
  | 'deadline_approaching' 
  | 'form_submitted' 
  | 'form_approved' 
  | 'form_rejected' 
  | 'system_update'
  | string;

export type NotificationEntityType = 
  | 'category' 
  | 'form' 
  | 'school' 
  | 'user' 
  | 'system'
  | string;

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  priority: string;
  relatedEntityId: string;
  relatedEntityType: NotificationEntityType;
  createdAt: string;
  isRead: boolean;
  read_status: boolean; // Supabase uyğunluğu üçün əlavə edildi
  time?: string;
}

// Notification obyektini uyğunlaşdırmaq üçün helper funksiya
export function adaptNotification(rawNotification: any): Notification {
  return {
    id: rawNotification.id || '',
    type: rawNotification.type || 'system_update',
    title: rawNotification.title || '',
    message: rawNotification.message || '',
    userId: rawNotification.user_id || rawNotification.userId || '',
    priority: rawNotification.priority || 'normal',
    relatedEntityId: rawNotification.related_entity_id || rawNotification.relatedEntityId || '',
    relatedEntityType: rawNotification.related_entity_type || rawNotification.relatedEntityType || 'system',
    createdAt: rawNotification.created_at || rawNotification.createdAt || new Date().toISOString(),
    isRead: rawNotification.is_read || rawNotification.isRead || false,
    read_status: rawNotification.read_status || rawNotification.is_read || false,
    time: rawNotification.time || ''
  };
}
