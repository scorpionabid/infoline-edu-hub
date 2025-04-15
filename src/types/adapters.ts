
import { Notification, NotificationType } from './notification';
import { DashboardNotification } from './dashboard';
import { format } from 'date-fns';

// Bildiriş adapterlərini təyin edirik
export function adaptNotificationToDashboard(notification: Notification): DashboardNotification {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    userId: notification.userId,
    isRead: notification.isRead,
    priority: notification.priority,
    date: notification.date || format(new Date(notification.createdAt), 'yyyy-MM-dd'),
    time: notification.time || format(new Date(notification.createdAt), 'HH:mm'),
    createdAt: notification.createdAt,
    relatedEntityId: notification.relatedId,
    relatedEntityType: notification.relatedType
  };
}

export function adaptDashboardToNotification(dashboardNotification: DashboardNotification): Notification {
  return {
    id: dashboardNotification.id,
    type: dashboardNotification.type as NotificationType,
    title: dashboardNotification.title,
    message: dashboardNotification.message,
    isRead: dashboardNotification.isRead,
    createdAt: dashboardNotification.createdAt || new Date().toISOString(),
    userId: dashboardNotification.userId,
    priority: dashboardNotification.priority as 'low' | 'normal' | 'high',
    relatedId: dashboardNotification.relatedEntityId,
    relatedType: dashboardNotification.relatedEntityType,
    date: dashboardNotification.date,
    time: dashboardNotification.time
  };
}

// Burada digər adapterlər də əlavə edilə bilər...
