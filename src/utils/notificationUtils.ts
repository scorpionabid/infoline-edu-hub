
import { AppNotification, DashboardNotification } from "@/types/notification";

// DashboardNotification -> AppNotification adaptasiyası
export const adaptDashboardToAppNotification = (notification: Partial<DashboardNotification>): AppNotification => {
  return {
    id: notification.id || '',
    title: notification.title || '',
    message: notification.message || '',
    createdAt: notification.createdAt || notification.date || new Date().toISOString(),
    isRead: notification.isRead || notification.read || false,
    read: notification.read || notification.isRead || false,
    type: notification.type || 'info',
    link: notification.link,
    category: notification.category,
    priority: normalizePriority(notification.priority),
    timestamp: notification.timestamp || notification.date || new Date().toISOString(),
    date: notification.date || notification.createdAt || new Date().toISOString(),
    entity: notification.entity
  };
};

// AppNotification -> DashboardNotification adaptasiyası
export const adaptAppToDashboardNotification = (notification: Partial<AppNotification>): DashboardNotification => {
  return {
    id: notification.id || '',
    title: notification.title || '',
    message: notification.message || '',
    date: notification.date || notification.createdAt || notification.timestamp || new Date().toISOString(),
    isRead: notification.isRead || notification.read || false,
    read: notification.read || notification.isRead || false,
    type: notification.type || 'info',
    link: notification.link,
    category: notification.category,
    priority: normalizePriority(notification.priority),
    createdAt: notification.createdAt || notification.date || notification.timestamp,
    timestamp: notification.timestamp || notification.date || notification.createdAt,
    entity: notification.entity
  };
};

// Tiplərin normal işləməsi üçün priority xassəsinin validasiyası
export const normalizePriority = (priority: any): 'normal' | 'high' | 'critical' | 'low' | 'medium' => {
  if (priority === 'low' || priority === 'medium') {
    return priority;
  }
  
  if (priority === 'high' || priority === 'critical') {
    return priority;
  }
  
  return 'normal'; // default priority
};
