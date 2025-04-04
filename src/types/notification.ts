
export type NotificationType = 
  'category' | 
  'deadline' | 
  'approval' | 
  'system' | 
  'warning' | 
  'error' | 
  'info' | 
  'success';

export interface Notification {
  id: string;
  userId?: string;
  title: string;
  message?: string;
  type: NotificationType;
  time?: string;
  createdAt: string;
  isRead: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

// DashboardNotification modeli
export interface DashboardNotification {
  id: string;
  title: string;
  message?: string;
  type: NotificationType; 
  time?: string;
  read?: boolean;
}
