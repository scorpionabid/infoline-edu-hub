
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'deadline' | 'update' | 'reminder' | 'system';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type NotificationEntityType = 'category' | 'form' | 'school' | 'user' | 'system' | 'region' | 'sector' | 'column' | 'data';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority | string;
  userId: string;
  createdAt: string;
  isRead: boolean;
  time: string;
  relatedEntityId: string;
  relatedEntityType: NotificationEntityType | string;
}

export interface NotificationSettings {
  email: boolean;
  inApp: boolean;
  push?: boolean;
  system?: boolean;
}
