
// Notification types
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  read?: boolean; // for backwards compatibility
  type: 'info' | 'warning' | 'error' | 'success' | 'deadline' | 'approval' | 'category' | 'system';
  priority?: 'low' | 'medium' | 'high' | 'normal' | 'critical';
  relatedEntityId?: string;
  relatedEntityType?: string;
  link?: string;
  category?: string;
  timestamp?: string;
  date?: string; // for backwards compatibility
  entity?: any;
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  read?: boolean; // for backwards compatibility
  type: 'info' | 'warning' | 'error' | 'success' | 'deadline' | 'approval' | 'category' | 'system';
  priority?: 'low' | 'medium' | 'high' | 'normal' | 'critical';
  link?: string;
  category?: string;
  timestamp?: string;
  createdAt?: string;
  entity?: any;
}

// Function to convert AppNotification to DashboardNotification
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

// Function to convert DashboardNotification to AppNotification
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

// Function to convert DB notification to AppNotification
export const adaptDbNotificationToApp = (dbNotification: any): AppNotification => {
  return {
    id: dbNotification.id,
    title: dbNotification.title,
    message: dbNotification.message,
    createdAt: dbNotification.created_at,
    isRead: dbNotification.is_read,
    read: dbNotification.is_read,
    type: dbNotification.type,
    priority: dbNotification.priority,
    relatedEntityId: dbNotification.related_entity_id,
    relatedEntityType: dbNotification.related_entity_type,
    timestamp: dbNotification.created_at,
    date: dbNotification.created_at
  };
};

// Aliases for backward compatibility
export const adaptDashboardToAppNotification = adaptDashboardNotificationToApp;
export const adaptAppToDashboardNotification = adaptAppNotificationToDashboard;

// For backward compatibility
export type Notification = AppNotification;
