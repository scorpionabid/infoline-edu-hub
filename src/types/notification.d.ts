
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  createdAt?: string | Date;
  time?: string;
  read?: boolean;
  userId?: string;
  relatedId?: string;
  relatedType?: string;
}
