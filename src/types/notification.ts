// Notification types
export type NotificationType = 
  | 'info' 
  | 'warning' 
  | 'error' 
  | 'success'
  | 'data_approval'
  | 'deadline_reminder'
  | 'proxy_data_entry'
  | 'system_update'
  | 'deadline';

export type NotificationPriority = 'low' | 'normal' | 'high';

export interface NotificationData {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message?: string;
  is_read?: boolean;
  priority?: NotificationPriority;
  related_entity_type?: string;
  related_entity_id?: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  created_at: string;
  createdAt?: string; // For backward compatibility
  is_read: boolean;
  user_id: string;
}

export interface NotificationsCardProps {
  notifications: AppNotification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  title?: string;
}

export interface NotificationStats {
  totalCount: number;
  unreadCount: number;
  todayCount: number;
  weekCount: number;
}
