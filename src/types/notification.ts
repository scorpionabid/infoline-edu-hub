
export type NotificationType = 'newCategory' | 'deadline' | 'approval' | 'rejection' | 'system';
export type NotificationEntityType = 'category' | 'column' | 'data' | 'user' | 'school';

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
