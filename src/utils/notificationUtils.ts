
import { AppNotification, DashboardNotification } from '@/types/notification';

// DashboardNotification-ı AppNotification-a çevirmək üçün adaptasiya funksiyası
export const adaptDashboardNotificationToApp = (
  notification: DashboardNotification
): AppNotification => {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    createdAt: notification.createdAt || notification.date || notification.timestamp || new Date().toISOString(),
    isRead: notification.isRead || notification.read || false,
    read: notification.read || notification.isRead || false,
    type: notification.type,
    priority: notification.priority,
    link: notification.link,
    category: notification.category,
    timestamp: notification.timestamp || notification.createdAt || notification.date,
    date: notification.date || notification.createdAt || notification.timestamp,
    entity: notification.entity
  };
};

// Birden çox bildirişi çevirmək üçün köməkçi funksiya
export const adaptDashboardNotificationsToApp = (
  notifications: DashboardNotification[]
): AppNotification[] => {
  return notifications.map(adaptDashboardNotificationToApp);
};

// AppNotification-ı DashboardNotification-a çevirmək üçün adaptasiya funksiyası
export const adaptAppNotificationToDashboard = (
  notification: AppNotification
): DashboardNotification => {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    date: notification.date || notification.createdAt || notification.timestamp || new Date().toISOString(),
    isRead: notification.isRead || notification.read || false,
    read: notification.read || notification.isRead || false,
    type: notification.type,
    priority: notification.priority,
    link: notification.link,
    category: notification.category,
    createdAt: notification.createdAt || notification.date || notification.timestamp,
    timestamp: notification.timestamp || notification.createdAt || notification.date,
    entity: notification.entity
  };
};

// SuperAdminDashboard və RegionAdminDashboard komponentlərində istifadə edilən funksiya üçün alias
export const adaptDashboardToAppNotification = adaptDashboardNotificationToApp;

// SectorAdminDashboard komponenti üçün funksiya üçün alias
export const adaptAppToDashboardNotification = adaptAppNotificationToDashboard;
