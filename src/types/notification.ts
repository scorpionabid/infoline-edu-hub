
// Bildiriş tipi
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read?: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
  link?: string;
  category?: string;
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
  type: 'info' | 'warning' | 'error' | 'success';
  link?: string;
  category?: string;
  entity?: {
    type: string;
    id: string;
    name?: string;
  };
}

/**
 * Dashboard bildirişini app bildirişinə çevirmək üçün adapter
 */
export const adaptDashboardNotificationToApp = (notification: DashboardNotification): AppNotification => {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    date: notification.date,
    read: notification.read,
    type: notification.type,
    link: notification.link,
    category: notification.category,
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
    read: notification.read ?? false,
    type: notification.type,
    link: notification.link,
    category: notification.category,
    entity: notification.entity
  };
};
