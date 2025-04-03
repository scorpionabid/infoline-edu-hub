
export type NotificationType = 'newCategory' | 'deadline' | 'approval' | 'rejection' | 'system' | 'approvalRequest' | 'approved' | 'rejected' | 'formApproved' | 'formRejected' | 'systemUpdate' | 'dueDateReminder' | 'info';
export type NotificationEntityType = 'category' | 'column' | 'data' | 'user' | 'school';
export type NotificationPriority = 'normal' | 'high' | 'critical';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  time?: string;
  isRead: boolean;
  read_status: boolean;
  userId: string;
  priority: string;
  relatedEntityId?: string;
  relatedEntityType?: NotificationEntityType;
}

export const adaptNotification = (notification: any): Notification => {
  if (!notification) {
    return {
      id: 'default',
      type: 'info',
      title: 'Bildiriş',
      message: '',
      createdAt: new Date().toISOString(),
      time: new Date().toISOString(),
      isRead: false,
      userId: '',
      priority: 'normal',
      read_status: false
    };
  }
  
  return {
    ...notification,
    time: notification.time || notification.createdAt,
    read_status: notification.read_status !== undefined ? notification.read_status : notification.isRead
  };
};
