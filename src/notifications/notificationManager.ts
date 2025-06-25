
export interface UnifiedNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  userId?: string;
}

class NotificationManager {
  private notifications: UnifiedNotification[] = [];

  add(notification: Omit<UnifiedNotification, 'id' | 'timestamp'>) {
    const newNotification: UnifiedNotification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
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
}

export const notificationManager = new NotificationManager();
