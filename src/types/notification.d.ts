
export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp?: string;
  created_at?: string;
  user_id?: string;
  related_entity_id?: string;
  related_entity_type?: string;
  priority?: 'normal' | 'high' | 'critical';
  type: 'error' | 'info' | 'warning' | 'success' | 'deadline' | 'approval' | 'rejection' | 'comment' | 'system';
  read?: boolean;
  is_read?: boolean;
}

export interface NotificationsResponse {
  data: Notification[];
  count: number;
}
