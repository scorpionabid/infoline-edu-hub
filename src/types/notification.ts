
export interface NotificationStats {
  total: number;
  unread: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
  user_id: string;
  action_url?: string;
  metadata?: Record<string, any>;
}

// Add missing types
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'deadline';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  timestamp: string;
  entityId?: string;
  entityType?: string;
}

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  userId: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationFilters {
  type?: NotificationType[];
  priority?: NotificationPriority[];
  isRead?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface NotificationsCardProps {
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

export interface NotificationSettings {
  email: boolean;
  system: boolean;
  push?: boolean;
  sms?: boolean;
}

// Utility function
export const adaptDashboardNotificationToApp = (notification: DashboardNotification): AppNotification => {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type as 'info' | 'success' | 'warning' | 'error',
    is_read: notification.isRead,
    created_at: notification.timestamp,
    user_id: '',
    metadata: {
      entityId: notification.entityId,
      entityType: notification.entityType
    }
  };
};
