
// Bildiriş tipi
export type NotificationType = 
  | 'warning' 
  | 'error' 
  | 'success' 
  | 'info' 
  | 'system' 
  | 'category' 
  | 'deadline' 
  | 'approval';

// Bildiriş interfeysi
export interface Notification {
  id: string;
  title: string;
  message?: string;
  type: NotificationType;
  createdAt: string;
  time?: string;
  isRead: boolean;
  userId?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  priority?: string;
}
