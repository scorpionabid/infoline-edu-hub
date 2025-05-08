
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  user_id: string;
  created_at: string;
  is_read: boolean;
  priority?: string;
  related_entity_type?: string;
  related_entity_id?: string;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationFilter {
  type?: NotificationType;
  isRead?: boolean;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
