
export interface NotificationType {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system' | 'category' | 'deadline' | 'approval';
  createdAt: string;
  read: boolean;
  priority?: 'normal' | 'high' | 'critical';
  time?: string;
  isRead?: boolean; // geriyə uyğunluq üçün
}

// UI bildiriş interfeysi
export interface UINotification extends NotificationType {
  isRead?: boolean; // UI komponenti üçün isRead əlavə edildi
  date?: string;
}

// Dashboard bildiriş interfeysi
export interface DashboardNotification extends UINotification {
  date?: string;
}

// Supabase verilənlər bazasından gələn bildiriş məlumatlarını tətbiq formatına çevirən funksiya
export const adaptDbNotificationToApp = (dbNotification: any): NotificationType => {
  return {
    id: dbNotification.id || '',
    title: dbNotification.title || '',
    message: dbNotification.message || '',
    type: dbNotification.type || 'info',
    createdAt: dbNotification.created_at || new Date().toISOString(),
    read: dbNotification.is_read || false,
    priority: dbNotification.priority || 'normal',
    time: dbNotification.created_at ? new Date(dbNotification.created_at).toLocaleTimeString() : undefined,
    isRead: dbNotification.is_read || false // geriyə uyğunluq üçün
  };
};

// Dashboard bildirişlərini çevirmək üçün adapter funksiya
export const adaptDashboardNotificationToApp = (notification: any): UINotification => {
  // Əgər bildiriş artıq formalaşdırılmışsa, onu qaytarırıq
  if (notification.id && (notification.createdAt || notification.created_at)) {
    return {
      ...notification,
      id: notification.id,
      title: notification.title || '',
      message: notification.message || '',
      type: notification.type || 'info',
      createdAt: notification.createdAt || notification.created_at || new Date().toISOString(),
      read: notification.isRead || notification.read || false,
      isRead: notification.isRead || notification.read || false,
      priority: notification.priority || 'normal',
      date: notification.date || (notification.createdAt ? new Date(notification.createdAt).toLocaleDateString() : undefined),
      time: notification.time || (notification.createdAt ? new Date(notification.createdAt).toLocaleTimeString() : undefined)
    };
  }

  // Xam bildiriş məlumatlarını çeviririk
  return {
    id: notification.id || '',
    title: notification.title || '',
    message: notification.message || '',
    type: notification.type || 'info',
    createdAt: notification.created_at || new Date().toISOString(),
    read: notification.is_read || notification.read || false,
    priority: notification.priority || 'normal',
    isRead: notification.is_read || notification.read || false,
    date: notification.date || (notification.created_at ? new Date(notification.created_at).toLocaleDateString() : undefined),
    time: notification.time || (notification.created_at ? new Date(notification.created_at).toLocaleTimeString() : undefined)
  };
};
