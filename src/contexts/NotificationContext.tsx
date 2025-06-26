
/**
 * İnfoLine Notification System - Legacy Compatibility Layer
 * DEPRECATED: Use /src/notifications/index.ts for new implementations
 * Bu fayl backward compatibility üçün saxlanılır
 */

import { useNotifications as newUseNotifications, notificationManager } from '@/notifications';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'deadline' | 'approval' | 'rejection';
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'pending';
  channel?: 'email' | 'push' | 'inApp' | 'sms';
  timestamp: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
}

/**
 * @deprecated Use UnifiedNotificationProvider from @/notifications instead
 */
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.warn(`
[MIGRATION NOTICE] 
/src/contexts/NotificationContext.tsx is deprecated.

Please migrate to the new unified notification system:
- Import: import { UnifiedNotificationProvider } from '@/notifications'
- Usage: <UnifiedNotificationProvider userId={userId}>{children}</UnifiedNotificationProvider>

New features available:
- Real-time notifications
- Multiple notification types and priorities
- Cross-tab synchronization
- Better caching and performance
- Built-in toast notifications

See /src/notifications/index.ts for full API documentation.
  `);

  // For backward compatibility, we'll provide a basic implementation
  // but encourage migration to the new system
  return <>{children}</>;
};

/**
 * @deprecated Use useNotifications from @/notifications instead
 */
export const useNotifications = (): NotificationContextType => {
  console.warn(`
[DEPRECATED] useNotifications from contexts/NotificationContext is deprecated.

Please migrate to:
- Import: import { useNotifications } from '@/notifications'
- Usage: const { notifications, markAsRead, ... } = useNotifications(userId)

The new hook provides better TypeScript support and more features.
  `);

  // Provide a legacy-compatible interface that works with the new system
  const { notifications: newNotifications, markAsRead: newMarkAsRead } = newUseNotifications();

  // Map new notifications to old format for compatibility
  const legacyNotifications: Notification[] = newNotifications.map(notification => ({
    id: notification.id,
    title: notification.title,
    message: notification.message || '',
    type: notification.type === 'approval' ? 'success' : 
          notification.type === 'rejection' ? 'error' :
          notification.type === 'deadline' ? 'warning' : 
          notification.type as 'info' | 'success' | 'warning' | 'error',
    status: notification.is_read ? 'read' : 'delivered',
    timestamp: new Date(notification.created_at || notification.timestamp)
  }));

  const addNotification = async (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    console.warn('[DEPRECATED] addNotification. Use notificationManager.createNotification instead.');
    // This requires a user ID which the old system didn't have
    // Implementation would need to be adapted based on current user context
  };

  const removeNotification = (id: string) => {
    console.warn('[DEPRECATED] removeNotification. Use deleteNotification from useNotifications hook instead.');
    // Would need current user ID for the new system
  };

  const markAsRead = (id: string) => {
    newMarkAsRead(id);
  };

  return {
    notifications: legacyNotifications,
    addNotification,
    removeNotification,
    markAsRead
  };
};

export default {
  NotificationProvider,
  useNotifications
};

