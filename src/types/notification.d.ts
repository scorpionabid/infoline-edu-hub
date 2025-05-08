
export type NotificationType = 'info' | 'warning' | 'error' | 'success';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAt: string;
  isRead: boolean;
  userId: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  priority?: 'high' | 'normal' | 'low';
}

export interface NotificationFilter {
  type?: NotificationType[];
  isRead?: boolean;
  fromDate?: string;
  toDate?: string;
}
