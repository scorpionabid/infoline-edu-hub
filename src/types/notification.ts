
// Notification interface
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | string;
  time?: string;
  userId?: string;
  isRead?: boolean;
  createdAt: string;
  priority?: 'normal' | 'high' | 'critical';
  relatedEntityId?: string;
  relatedEntityType?: string;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system' | 'deadline' | 'approval';

export type NotificationPriority = 'normal' | 'high' | 'critical';

export const adaptNotification = (data: any): Notification => {
  return {
    id: data.id || '',
    title: data.title || '',
    message: data.message || '',
    type: data.type || 'info',
    time: data.time || data.created_at || new Date().toISOString(),
    userId: data.user_id,
    isRead: data.is_read ?? false,
    createdAt: data.created_at || new Date().toISOString(),
    priority: data.priority || 'normal',
    relatedEntityId: data.related_entity_id,
    relatedEntityType: data.related_entity_type
  };
};
