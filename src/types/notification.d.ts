
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  timestamp?: string;
  createdAt?: string;
  priority?: 'low' | 'normal' | 'high';
  relatedEntityId?: string;
  relatedEntityType?: string;
}
