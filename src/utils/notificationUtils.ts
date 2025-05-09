
import { AppNotification, DashboardNotification, NotificationType } from '@/types/notification';

/**
 * Helper function to adapt dashboard notifications to app notifications
 */
export const adaptDashboardNotificationToApp = (notification: DashboardNotification): AppNotification => {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type as NotificationType,
    isRead: notification.isRead ?? false,
    createdAt: notification.createdAt || notification.date || new Date().toISOString(),
    date: notification.date,
    priority: notification.priority as 'low' | 'normal' | 'high' | undefined,
  };
};

/**
 * Get color class based on notification type
 */
export const getNotificationColorClass = (type: NotificationType): string => {
  switch (type) {
    case 'error':
      return 'bg-destructive text-destructive-foreground';
    case 'warning':
      return 'bg-amber-500 text-white';
    case 'success':
      return 'bg-emerald-500 text-white';
    case 'info':
      return 'bg-blue-500 text-white';
    case 'system':
      return 'bg-purple-500 text-white';
    case 'approval':
      return 'bg-indigo-500 text-white';
    case 'deadline':
      return 'bg-rose-500 text-white';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

/**
 * Format date for notification display
 */
export const formatNotificationDate = (dateString?: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
