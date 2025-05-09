
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | string;
  isRead: boolean;
  date: string;
  createdAt: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  priority?: 'low' | 'normal' | 'high' | string;
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  timestamp: string;
  entityId?: string;
  entityType?: string;
}
