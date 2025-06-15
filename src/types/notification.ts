
export type NotificationType = 'success' | 'warning' | 'error' | 'info';

export interface NotificationData {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  priority: string;
  is_read: boolean;
  created_at: string;
  reference_id: any;
  reference_type: any;
}
