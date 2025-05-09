
export type NotificationType = 'info' | 'success' | 'error' | 'warning' | 'deadline' | 'approval' | 'category' | 'system';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  priority: NotificationPriority;
  relatedEntityId?: string;
  relatedEntityType?: string;
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  type: 'error' | 'info' | 'warning' | 'success';
  date?: string;
  createdAt?: string;
  isRead?: boolean;
  timestamp?: string;
  priority?: NotificationPriority;
}

export function adaptDbNotificationToApp(dbNotification: any): AppNotification {
  return {
    id: dbNotification.id || Math.random().toString(),
    title: dbNotification.title || '',
    message: dbNotification.message || '',
    type: (dbNotification.type || 'info') as NotificationType,
    isRead: dbNotification.is_read ?? false,
    createdAt: dbNotification.created_at || new Date().toISOString(),
    priority: (dbNotification.priority || 'normal') as NotificationPriority,
    relatedEntityId: dbNotification.related_entity_id,
    relatedEntityType: dbNotification.related_entity_type
  };
}

export function adaptDashboardNotificationToApp(dashboardNotification: any): AppNotification {
  return {
    id: dashboardNotification.id || Math.random().toString(),
    title: dashboardNotification.title || '',
    message: dashboardNotification.message || '',
    type: (dashboardNotification.type || 'info') as NotificationType,
    isRead: dashboardNotification.isRead ?? false,
    createdAt: dashboardNotification.createdAt || dashboardNotification.date || dashboardNotification.timestamp || new Date().toISOString(),
    priority: (dashboardNotification.priority || 'normal') as NotificationPriority,
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
    timestamp: appNotification.createdAt,
    priority: appNotification.priority
  };
}
