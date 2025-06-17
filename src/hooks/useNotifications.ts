/**
 * İnfoLine Notification System - Legacy Hook Compatibility Layer
 * DEPRECATED: Use unified useNotifications from @/notifications instead
 * Bu fayl backward compatibility üçün saxlanılır
 */

import { useNotifications as newUseNotifications, notificationManager } from '@/notifications';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message?: string;
  is_read: boolean;
  priority: string;
  related_entity_id?: string;
  related_entity_type?: string;
  created_at: string;
}

/**
 * @deprecated Use useNotifications from @/notifications instead
 */
export const useNotifications = (userId?: string) => {
  console.warn(`
[MIGRATION NOTICE] 
/src/hooks/useNotifications.ts is deprecated.

Please migrate to the new unified notification system:
- Import: import { useNotifications } from '@/notifications'
- Usage: const { notifications, unreadCount, markAsRead, ... } = useNotifications(userId)

New features available:
- Better TypeScript support
- Real-time updates with Supabase
- Improved caching with React Query
- Multiple notification types and priorities
- Built-in loading and error states

See /src/notifications/hooks/index.ts for full API documentation.
  `);

  const {
    notifications: newNotifications,
    unreadCount: newUnreadCount,
    isLoading: loading,
    markAsRead: newMarkAsRead,
    markAllAsRead: newMarkAllAsRead,
    clearAll: newClearAll,
    refetch
  } = newUseNotifications(userId);

  // Map new notifications to old interface for backward compatibility
  const notifications: Notification[] = newNotifications.map(notification => ({
    id: notification.id,
    user_id: notification.user_id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    is_read: notification.is_read,
    priority: notification.priority,
    related_entity_id: notification.related_entity_id,
    related_entity_type: notification.related_entity_type,
    created_at: notification.created_at
  }));

  const markAsRead = async (notificationId: string) => {
    try {
      newMarkAsRead(notificationId);
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      newMarkAllAsRead();
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const clearAll = async () => {
    try {
      newClearAll();
    } catch (err) {
      console.error('Error clearing all notifications:', err);
    }
  };

  const unreadCount = newUnreadCount;

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    refetch
  };
};

export default useNotifications;
