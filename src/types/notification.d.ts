
export interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  type: NotificationType;
  priority?: 'low' | 'normal' | 'high';
  entityId?: string;
  entityType?: string;
  is_read?: boolean;
  created_at?: string;
  related_entity_id?: string;
  related_entity_type?: string;
  user_id?: string;
}

export type NotificationType = 'info' | 'warning' | 'error' | 'success';
