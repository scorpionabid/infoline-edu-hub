
// Bildiriş tipi
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean; 
  isRead?: boolean;
  type: 'info' | 'warning' | 'error' | 'success' | 'deadline' | 'approval' | 'category' | 'system';
  link?: string;
  category?: string;
  priority?: 'normal' | 'high' | 'critical' | 'low' | 'medium';
  createdAt?: string;
  timestamp?: string;
  entity?: {
    type: string;
    id: string;
    name?: string;
  };
}

// Dashboard bildiriş tipi
export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  isRead: boolean; // Bu əvvəllər optional idi, indi məcburi etdik
  type: 'info' | 'warning' | 'error' | 'success' | 'deadline' | 'approval' | 'category' | 'system';
  link?: string;
  category?: string;
  priority?: 'normal' | 'high' | 'critical' | 'low' | 'medium';
  createdAt?: string;
  timestamp?: string;
  entity?: {
    type: string;
    id: string;
    name?: string;
  };
}

export type NotificationType = AppNotification;

// Notification alias - legacy support
export type Notification = AppNotification;

/**
 * Dashboard bildirişini app bildirişinə çevirmək üçün adapter
 */
export const adaptDashboardNotificationToApp = (notification: DashboardNotification): AppNotification => {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    date: notification.date,
    read: notification.read || notification.isRead || false,
    isRead: notification.isRead || notification.read || false,
    type: notification.type,
    link: notification.link,
    category: notification.category,
    createdAt: notification.createdAt || notification.date,
    timestamp: notification.timestamp || notification.date,
    priority: notification.priority,
    entity: notification.entity
  };
};

/**
 * App bildirişini dashboard bildirişinə çevirmək üçün adapter
 */
export const adaptAppNotificationToDashboard = (notification: AppNotification): DashboardNotification => {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    date: notification.date,
    read: notification.read ?? notification.isRead ?? false,
    isRead: notification.isRead ?? notification.read ?? false,
    type: notification.type,
    link: notification.link,
    category: notification.category,
    createdAt: notification.createdAt || notification.date,
    timestamp: notification.timestamp || notification.date,
    priority: notification.priority,
    entity: notification.entity
  };
};
