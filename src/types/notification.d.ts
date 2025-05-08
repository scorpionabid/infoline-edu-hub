
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  date: string;
  user_id: string;
  created_at?: string;
  related_entity_id?: string;
  related_entity_type?: string;
}

export type NotificationType = 
  | 'info' 
  | 'warning' 
  | 'error' 
  | 'success'
  | 'deadline'
  | 'approval'
  | 'rejection'
  | 'system';

export interface NotificationFilters {
  read?: boolean;
  type?: NotificationType | NotificationType[];
  startDate?: string;
  endDate?: string;
}
