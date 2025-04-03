
export type NotificationType = 
  'info' | 'warning' | 'success' | 'error' |
  'approval' | 'rejection' | 'deadline' | 'system' |
  'approvalRequest' | 'approved' | 'rejected' | 
  'formApproved' | 'formRejected' | 'systemUpdate' | 
  'dueDateReminder' | 'newCategory';

export type NotificationEntityType = 
  'category' | 'column' | 'school' | 'region' | 
  'sector' | 'user' | 'form' | 'entry' | 'system';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: 'normal' | 'high' | 'critical';
  createdAt: string;
  isRead: boolean;
  userId: string;
  relatedEntityId?: string;
  relatedEntityType?: NotificationEntityType;
  read_status?: boolean;
  time?: string; // Vaxt xüsusiyyətini əlavə edirik, çünki çox yerdə istifadə olunur
}

export const adaptNotification = (notification: any): Notification => {
  return {
    id: notification.id || '',
    title: notification.title || '',
    message: notification.message || '',
    type: notification.type as NotificationType || 'info',
    priority: notification.priority || 'normal',
    createdAt: notification.createdAt || notification.created_at || new Date().toISOString(),
    isRead: notification.isRead || notification.is_read || false,
    userId: notification.userId || notification.user_id || '',
    relatedEntityId: notification.relatedEntityId || notification.related_entity_id,
    relatedEntityType: notification.relatedEntityType || notification.related_entity_type as NotificationEntityType,
    read_status: notification.read_status,
    time: notification.time || notification.createdAt || notification.created_at // Vaxt xüsusiyyətini əlavə edirik
  };
};
