
export interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  type: NotificationType;
  priority?: 'low' | 'normal' | 'high';
  entityId?: string;
  entityType?: string;
}

export type NotificationType = 'info' | 'warning' | 'error' | 'success';
