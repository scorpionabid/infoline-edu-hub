
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
  | 'system';

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
  is_read?: boolean; // Əlavə edildi
  relatedEntityId?: string;
  relatedEntityType?: string;
  read_status?: string; // Bu sahə əsas interfeysə əlavə edildi
  related_entity_id?: string; // Əlavə edildi
  related_entity_type?: string; // Əlavə edildi
  user_id?: string; // Əlavə edildi
  created_at?: string; // Əlavə edildi
}
