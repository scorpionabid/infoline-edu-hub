
import { AppNotification, DashboardNotification } from "@/types/notification";

// DashboardNotification -> AppNotification adaptasiyası
export const adaptDashboardToAppNotification = (notification: Partial<DashboardNotification>): AppNotification => {
  return {
    id: notification.id || '',
    title: notification.title || '',
    message: notification.message || '',
    date: notification.date || new Date().toISOString(),
    read: notification.read || notification.isRead || false,
    isRead: notification.isRead || notification.read || false,
    type: notification.type || 'info',
    link: notification.link,
    category: notification.category,
    priority: notification.priority,
    createdAt: notification.createdAt || notification.date || new Date().toISOString(),
    timestamp: notification.timestamp || notification.date || new Date().toISOString(),
    entity: notification.entity
  };
};

// AppNotification -> DashboardNotification adaptasiyası
export const adaptAppToDashboardNotification = (notification: Partial<AppNotification>): DashboardNotification => {
  return {
    id: notification.id || '',
    title: notification.title || '',
    message: notification.message || '',
    date: notification.date || new Date().toISOString(),
    read: notification.read ?? notification.isRead ?? false,
    isRead: notification.isRead ?? notification.read ?? false,
    type: notification.type || 'info',
    link: notification.link,
    category: notification.category,
    priority: notification.priority,
    createdAt: notification.createdAt || notification.date || new Date().toISOString(),
    timestamp: notification.timestamp || notification.date || new Date().toISOString(),
    entity: notification.entity
  };
};

// Tiplərin normal işləməsi üçün priority xassəsinin validasiyası
export const normalizePriority = (priority: any): 'normal' | 'high' | 'critical' | 'low' | 'medium' => {
  if (priority === 'low' || priority === 'medium') {
    return 'normal'; // low və medium prioritetləri normal-a mapləyirik
  }
  
  if (priority === 'high' || priority === 'critical') {
    return priority;
  }
  
  return 'normal'; // default priority
};
