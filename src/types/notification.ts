
export interface NotificationType {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system' | 'category' | 'deadline' | 'approval';
  createdAt: string;
  read: boolean;
  priority?: 'normal' | 'high' | 'critical';
  time?: string;
}

export interface UINotification {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  read: boolean;
  priority?: string;
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
    time: dbNotification.created_at ? new Date(dbNotification.created_at).toLocaleTimeString() : undefined
  };
};
