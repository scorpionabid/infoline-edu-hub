
import { AppNotification, DashboardNotification, NotificationType, NotificationPriority } from "@/types/notification";

export function adaptDashboardNotificationToApp(dashboardNotification: any): AppNotification {
  return {
    id: dashboardNotification.id || Math.random().toString(),
    title: dashboardNotification.title || '',
    message: dashboardNotification.message || '',
    type: (dashboardNotification.type || 'info') as NotificationType,
    isRead: dashboardNotification.isRead ?? false,
    createdAt: dashboardNotification.createdAt || dashboardNotification.date || dashboardNotification.timestamp || new Date().toISOString(),
    priority: dashboardNotification.priority || 'normal',
    relatedEntityId: dashboardNotification.relatedEntityId,
    relatedEntityType: dashboardNotification.relatedEntityType
  };
}

export function adaptAppNotificationToDashboard(appNotification: AppNotification): DashboardNotification {
  // Convert AppNotification types to DashboardNotification types
  let dashboardType: 'error' | 'info' | 'warning' | 'success' = 'info';
  
  switch(appNotification.type) {
    case 'error':
      dashboardType = 'error';
      break;
    case 'warning':
      dashboardType = 'warning';
      break;
    case 'success':
      dashboardType = 'success';
      break;
    case 'deadline':
    case 'approval':
    case 'category':
    case 'system':
    case 'info':
    default:
      dashboardType = 'info';
      break;
  }

  return {
    id: appNotification.id,
    title: appNotification.title,
    message: appNotification.message,
    type: dashboardType,
    date: appNotification.createdAt,
    createdAt: appNotification.createdAt,
    isRead: appNotification.isRead,
    timestamp: appNotification.createdAt
  };
}
