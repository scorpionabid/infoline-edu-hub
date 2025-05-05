
export interface NotificationType {
  id: string;
  title: string;
  message?: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  read?: boolean; // geriye uyğunluq üçün
  createdAt: string;
  date?: string; // geriye uyğunluq üçün
  relatedEntityId?: string;
  relatedEntityType?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface UINotification extends NotificationType {
  // UI'da əlavə sahələr
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

// Dashboard-dan alınan bildirişləri app formatına çevirən adapter
export const adaptDashboardNotificationToApp = (notification: any): NotificationType => {
  return {
    id: notification.id || '',
    title: notification.title || '',
    message: notification.message || notification.description || '',
    type: notification.type || 'info',
    isRead: notification.isRead || notification.read || false,
    read: notification.isRead || notification.read || false, // geriye uyğunluq üçün
    createdAt: notification.createdAt || notification.created_at || notification.date || new Date().toISOString(),
    date: notification.createdAt || notification.created_at || notification.date || new Date().toISOString(), // geriye uyğunluq üçün
    relatedEntityId: notification.relatedEntityId || notification.entityId || '',
    relatedEntityType: notification.relatedEntityType || notification.entityType || '',
    priority: notification.priority || 'medium'
  };
};
