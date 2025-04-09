
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  createdAt: string;
  userId: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
}
