
export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  createdAt?: string;
  isRead: boolean;
  priority: "normal" | "high" | "critical";
  type?: string;
  entityId?: string;
  entityType?: string;
  date?: string; // Əlavə edildi
  read?: boolean; // Əlavə edildi
}

export type NotificationType = Notification;

export function adaptDashboardNotificationToApp(notification: any): Notification {
  return {
    id: notification.id || '',
    title: notification.title || '',
    message: notification.message || '',
    timestamp: notification.timestamp || notification.createdAt || new Date().toISOString(),
    createdAt: notification.createdAt || notification.timestamp || new Date().toISOString(),
    date: notification.date || notification.timestamp || notification.createdAt || new Date().toISOString(),
    isRead: notification.isRead || false,
    read: notification.read || notification.isRead || false,
    priority: notification.priority || "normal",
    type: notification.type || 'info',
    entityId: notification.entityId || notification.related_entity_id || '',
    entityType: notification.entityType || notification.related_entity_type || '',
  };
}
