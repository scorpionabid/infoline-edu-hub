
import { AppNotification } from '@/context/NotificationContext';

export interface DashboardNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  date: string;
}

// Convert dashboard notification format to app notification format
export const adaptDashboardNotificationToApp = (notification: DashboardNotification): AppNotification => {
  return {
    id: notification.id,
    user_id: '', // This will be set by the backend
    title: notification.message.split(' ').slice(0, 3).join(' ') + '...', 
    message: notification.message,
    type: notification.type,
    is_read: false,
    created_at: notification.date,
  };
};

// Convert app notification format to dashboard notification format
export const adaptAppNotificationToDashboard = (notification: AppNotification): DashboardNotification => {
  return {
    id: notification.id,
    type: notification.type,
    message: notification.message,
    date: notification.created_at,
  };
};

// Aliases for backward compatibility
export const adaptDashboardToAppNotification = adaptDashboardNotificationToApp;
export const adaptAppToDashboardNotification = adaptAppNotificationToDashboard;
