
export type NotificationType = 
  | 'info' 
  | 'warning' 
  | 'error' 
  | 'success'
  | 'newCategory'
  | 'deadline'
  | 'approvalRequest'
  | 'approved'
  | 'rejected'
  | 'systemUpdate'
  | 'formApproved'
  | 'formRejected'
  | 'dueDateReminder';

export type NotificationPriority = 'normal' | 'high' | 'critical';

export type NotificationEntityType = 'category' | 'column' | 'data' | 'user' | 'school';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  time?: string;
  isRead: boolean;
  userId: string;
  priority: NotificationPriority;
  read_status: boolean;
  relatedEntityId?: string;
  relatedEntityType?: NotificationEntityType;
}

// adaptSupabaseNotification əvəzinə adaptNotification istifadə etmək üçün
export const adaptNotification = (rawData: any): Notification => {
  return {
    id: rawData.id || '',
    type: rawData.type || 'info',
    title: rawData.title || '',
    message: rawData.message || '',
    createdAt: rawData.created_at || rawData.createdAt || new Date().toISOString(),
    time: rawData.time || rawData.created_at || rawData.createdAt || new Date().toISOString(),
    isRead: rawData.is_read ?? rawData.isRead ?? false,
    userId: rawData.user_id || rawData.userId || '',
    priority: rawData.priority || 'normal',
    read_status: Boolean(rawData.is_read ?? rawData.isRead ?? rawData.read_status ?? false),
    relatedEntityId: rawData.related_entity_id || rawData.relatedEntityId,
    relatedEntityType: rawData.related_entity_type || rawData.relatedEntityType,
  };
};
