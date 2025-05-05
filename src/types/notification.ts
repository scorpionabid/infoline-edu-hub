
// Müxtəlif bildiriş tipləri arasında uyğunluğu təmin edir

export type NotificationType = {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system' | 'category' | 'deadline' | 'approval';
  isRead: boolean;
  read?: boolean; // backwards compatibility
  date?: string;
  createdAt: string;
  priority?: 'high' | 'normal' | 'low';
  time?: string; // Backwards compatibility üçün
  relatedId?: string;
  relatedType?: string;
};

// Dashboard tipləri ilə Notification tipləri arasında uyğunluğu təmin edək
export interface UINotification extends NotificationType {}

// Verilənlər bazası bildirişini tətbiq bildirişinə çevirmək üçün adapter
export const adaptDbNotificationToApp = (dbNotification: any): NotificationType => {
  return {
    id: dbNotification.id,
    title: dbNotification.title,
    message: dbNotification.message || "",
    type: dbNotification.type || 'info',
    isRead: dbNotification.is_read || false,
    read: dbNotification.is_read || false, // backwards compatibility
    createdAt: dbNotification.created_at || new Date().toISOString(),
    date: dbNotification.created_at ? new Date(dbNotification.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    priority: dbNotification.priority || 'normal',
    relatedId: dbNotification.related_entity_id,
    relatedType: dbNotification.related_entity_type
  };
};

// Dashboard bildirişlərini tətbiq bildirişlərinə çevirmək üçün adapter
export const adaptDashboardNotificationToApp = (notification: UINotification): NotificationType => {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type || 'info',
    isRead: notification.isRead || notification.read || false,
    createdAt: notification.createdAt || notification.date || new Date().toISOString(),
    priority: notification.priority || 'normal',
    relatedId: notification.relatedId,
    relatedType: notification.relatedType,
  };
};

// Geriyə uyğunluq üçün Notification tipini də təyin edirik
export type Notification = NotificationType;
