
// Notification types
export type NotificationType = 
  | 'info' 
  | 'warning' 
  | 'error' 
  | 'success'
  | 'data_approval'
  | 'deadline_reminder'
  | 'proxy_data_entry'
  | 'system_update';

export interface NotificationData {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message?: string;
  is_read?: boolean;
  priority?: 'low' | 'normal' | 'high';
  related_entity_type?: string;
  related_entity_id?: string;
  created_at: string;
}
