
export interface UnifiedNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'deadline' | 'approval' | 'rejection';
  timestamp: string;
  is_read?: boolean;
  priority?: 'normal' | 'high' | 'critical';
  created_at?: string;
  related_entity_id?: string;
  related_entity_type?: string;
}

class NotificationManager {
  private notifications: UnifiedNotification[] = [];

  add(notification: Omit<UnifiedNotification, 'id' | 'timestamp'>) {
    const newNotification: UnifiedNotification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      created_at: new Date().toISOString(),
      is_read: false,
      priority: notification.priority || 'normal'
    };
    this.notifications.push(newNotification);
    return newNotification;
  }

  remove(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  getAll() {
    return this.notifications;
  }

  clear() {
    this.notifications = [];
  }

  markAsRead(id: string) {
    this.notifications = this.notifications.map(n => 
      n.id === id ? { ...n, is_read: true } : n
    );
  }

  markAllAsRead() {
    this.notifications = this.notifications.map(n => ({ ...n, is_read: true }));
  }
}

export const notificationManager = new NotificationManager();
