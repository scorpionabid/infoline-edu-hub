
export interface NotificationType {
  id: string;
  title: string;
  message?: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'system' | 'category' | 'deadline' | 'approval';
  isRead: boolean;
  read?: boolean; // geriyə uyğunluq üçün
  createdAt: string;
  date?: string; // geriyə uyğunluq üçün
  relatedEntityId?: string;
  relatedEntityType?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

// Notification tipini geriyə uyğunluq üçün export edirik
export type Notification = NotificationType;

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
    read: notification.isRead || notification.read || false, // geriyə uyğunluq üçün
    createdAt: notification.createdAt || notification.created_at || notification.date || new Date().toISOString(),
    date: notification.createdAt || notification.created_at || notification.date || new Date().toISOString(), // geriyə uyğunluq üçün
    relatedEntityId: notification.relatedEntityId || notification.entityId || '',
    relatedEntityType: notification.relatedEntityType || notification.entityType || '',
    priority: notification.priority || 'medium'
  };
};

// db-dən gələn bildirişləri app formatına çevirən adapter
export const adaptDbNotificationToApp = (notification: any): NotificationType => {
  return {
    id: notification.id || '',
    title: notification.title || '',
    message: notification.message || '',
    type: notification.type || 'info',
    isRead: notification.is_read || false,
    read: notification.is_read || false, // geriyə uyğunluq üçün  
    createdAt: notification.created_at || new Date().toISOString(),
    date: notification.created_at || new Date().toISOString(), // geriyə uyğunluq üçün
    relatedEntityId: notification.related_entity_id || '',
    relatedEntityType: notification.related_entity_type || '',
    priority: notification.priority || 'medium'
  };
};
