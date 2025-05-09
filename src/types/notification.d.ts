
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'deadline' | 'approval' | 'category' | 'system';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

export interface BaseNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  date?: string;
  createdAt?: string;
  isRead?: boolean;
}

export interface AppNotification extends BaseNotification {
  isRead: boolean;
  createdAt: string;
  priority?: NotificationPriority;
  relatedEntityId?: string;
  relatedEntityType?: string;
}

export interface DashboardNotification extends BaseNotification {
  type: 'error' | 'info' | 'warning' | 'success';
  timestamp?: string;
}

export interface DbNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  priority?: string;
  created_at: string;
  related_entity_id?: string;
  related_entity_type?: string;
}

export function adaptDbNotificationToApp(dbNotification: DbNotification): AppNotification {
  return {
    id: dbNotification.id,
    title: dbNotification.title,
    message: dbNotification.message,
    type: dbNotification.type as NotificationType,
    isRead: dbNotification.is_read,
    createdAt: dbNotification.created_at,
    priority: dbNotification.priority as NotificationPriority,
    relatedEntityId: dbNotification.related_entity_id,
    relatedEntityType: dbNotification.related_entity_type
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
