
export type NotificationType = 
  | 'newCategory' 
  | 'deadline' 
  | 'approvalRequest' 
  | 'approved' 
  | 'rejected' 
  | 'systemUpdate' 
  | 'reminder'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'formApproved'
  | 'formRejected'
  | 'dueDateReminder';

export type NotificationPriority = 'normal' | 'high' | 'critical';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  userId?: string;
  isRead?: boolean;
  createdAt: string;
  time?: string;
  priority?: NotificationPriority;
  relatedEntityId?: string;
  relatedEntityType?: 'category' | 'column' | 'data' | 'user' | 'school';
}
