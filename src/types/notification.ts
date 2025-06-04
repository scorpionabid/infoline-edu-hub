
export interface AppNotification {
  id: string;
  title: string;
  message?: string;
  type: string;
  priority?: string;
  is_read: boolean;
  user_id: string;
  related_entity_type?: string;
  related_entity_id?: string;
  created_at: string;
  createdAt?: string; // Alias for compatibility
}

export interface Notification extends AppNotification {}

export interface NotificationFilters {
  type?: string;
  priority?: string;
  is_read?: boolean;
  date_range?: {
    start: string;
    end: string;
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
  by_type?: Record<string, number>;
  by_priority?: Record<string, number>;
}
