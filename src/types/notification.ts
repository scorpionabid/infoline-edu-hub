
export type NotificationType = 
  | 'info' 
  | 'warning' 
  | 'error' 
  | 'success' 
  | 'new_category' 
  | 'deadline' 
  | 'completed' 
  | 'approved' 
  | 'rejected'
  | 'system'
  | 'newCategory'
  | 'formApproved'
  | 'formRejected'
  | 'dueDateReminder'
  | 'systemUpdate'
  | 'approvalRequest';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  userId: string;
  createdAt: string;
  isRead: boolean;
  time?: string;
  is_read?: boolean; 
  read_status: string; // 'read' | 'unread' olaraq üstünlük verilir
  relatedEntityId?: string;
  relatedEntityType?: string;
  related_entity_id?: string; 
  related_entity_type?: string; 
  user_id?: string; 
  created_at?: string; 
}

// Supabase'dən gələn məlumatları Notification tipinə çevirmək üçün
export const adaptSupabaseNotification = (rawData: any): Notification => {
  return {
    id: rawData.id,
    title: rawData.title || '',
    message: rawData.message || '',
    type: rawData.type as NotificationType,
    priority: rawData.priority as NotificationPriority || 'normal',
    userId: rawData.user_id || '',
    createdAt: rawData.created_at || new Date().toISOString(),
    isRead: rawData.is_read || false,
    time: rawData.created_at || new Date().toISOString(),
    read_status: rawData.is_read ? 'read' : 'unread',
    relatedEntityId: rawData.related_entity_id,
    relatedEntityType: rawData.related_entity_type,
    user_id: rawData.user_id,
    created_at: rawData.created_at,
    is_read: rawData.is_read,
    related_entity_id: rawData.related_entity_id,
    related_entity_type: rawData.related_entity_type
  };
};

// Frontend-dən Supabase'ə məlumat göndərmək üçün
export const adaptNotificationToSupabase = (notification: Partial<Notification>) => {
  return {
    title: notification.title,
    message: notification.message,
    type: notification.type,
    priority: notification.priority || 'normal',
    user_id: notification.userId || notification.user_id,
    is_read: notification.isRead || notification.is_read || false,
    related_entity_id: notification.relatedEntityId || notification.related_entity_id,
    related_entity_type: notification.relatedEntityType || notification.related_entity_type
  };
};
