
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
