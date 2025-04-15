
export type NotificationType = 
  | 'system'
  | 'category'
  | 'deadline'
  | 'approval'
  | 'form'
  | 'warning'
  | 'error'
  | 'success'
  | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  priority?: 'low' | 'normal' | 'high';
  relatedId?: string;
  relatedType?: string;
}
