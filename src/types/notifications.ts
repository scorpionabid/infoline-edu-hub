
export interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
  type: string;
  priority: 'normal' | 'high' | 'low';
  relatedEntityType?: string;
  relatedEntityId?: string;
}
