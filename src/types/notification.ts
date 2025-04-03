
export type NotificationType = 
  | 'info' 
  | 'warning' 
  | 'error' 
  | 'success' 
  | 'new_category' 
  | 'deadline' 
  | 'completed' 
  | 'approved' 
  | 'rejected'
  | 'system'
  | 'newCategory'
  | 'formApproved'
  | 'formRejected'
  | 'dueDateReminder'
  | 'systemUpdate'
  | 'approvalRequest';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  userId: string;
  createdAt: string;
  isRead: boolean;
  time?: string;
  is_read?: boolean; 
  relatedEntityId?: string;
  relatedEntityType?: string;
  read_status: string; 
  related_entity_id?: string; 
  related_entity_type?: string; 
  user_id?: string; 
  created_at?: string; 
}
