/**
 * İnfoLine Unified Notification System
 * 
 * Notification sistemi üçün standart export point
 * 
 * Bu fayl, notification sisteminin əsas komponentlərini və tiplərini ixrac edir.
 * Notification sisteminin əsas xidmətlərini və funksionallığını təmin edir.
 */

// Export core provider and hook
export { UnifiedNotificationProvider, NotificationProvider, useNotificationContext } from './components/NotificationProvider';

// Export legacy hooks for backward compatibility - deprecated but still used in some components
export { 
  useNotifications,
  useBulkNotifications,
  useDeadlineNotifications,
  useApprovalNotifications,
  useSystemNotifications,
  useNotificationAnalytics,
  useNotificationPreferences as useNotificationPreferencesLegacy
} from './hooks';


// Export types from the unified type system
export type { 
  Notification,
  NotificationType,
  NotificationPriority,
  RelatedEntityType,
  UseNotificationsResult,
  NotificationFilters,
  NotificationSettings,
  NotificationItemProps,
  NotificationListProps,
  CreateNotificationParams,
  BulkNotificationParams,
  ApprovalNotificationData,
  DeadlineNotificationData,
  DataEntryNotificationData
} from '@/types/notifications';

// Export notification constants and utilities
export {
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES,
  isNotificationType,
  isNotificationPriority,
  getNotificationTypeIcon,
  getNotificationTypeColor,
  getPriorityWeight
} from '@/types/notifications';

// Export service for direct API access (for advanced usage)
export { default as NotificationService } from '@/services/api/notificationService';

/**
 * @deprecated Use the new notification system components
 * 
 * Notification statistics interface.
 * İndi bu yerinə @/types/notifications içindən NotificationStats istifadə edin.
 */
export interface NotificationStats {
  total: number;
  unread: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
}

/**
 * @deprecated Use the NotificationService or useNotificationContext instead
 * 
 * Old preferences interface.
 * İndi bu yerinə @/types/notifications içindən NotificationSettings istifadə edin.
 */
export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  deadline_reminders: '3_1' | '1' | 'none';
  digest_frequency: 'immediate' | 'daily' | 'weekly';
}

/**
 * @deprecated Use the new NotificationProvider and useNotificationContext hook instead
 * 
 * This hook is kept for backward compatibility only.
 * Please use the new unified notification system:
 * 
 * import { useNotificationContext } from '@/notifications';
 * // or
 * import { useNotificationContext } from '@/components/notifications/NotificationProvider';
 */
import { useState, useCallback } from 'react';
import NotificationService from '@/services/api/notificationService';

export const useNotificationPreferences = (userId?: string) => {
  // Use constant mock values since this is a deprecated hook
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    push_notifications: false,
    deadline_reminders: '3_1' as '3_1' | '1' | 'none',
    digest_frequency: 'immediate' as 'immediate' | 'daily' | 'weekly'
  });

  // Use constant mock values for stats
  const [stats] = useState({
    total: 0,
    unread: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0
  });

  const [isLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isTestingNotification, setIsTestingNotification] = useState(false);

  const toggleEmailNotifications = useCallback(async (enabled: boolean) => {
    setIsUpdating(true);
    try {
      setPreferences(prev => ({ ...prev, email_notifications: enabled }));
      console.warn('[DEPRECATED] toggleEmailNotifications is deprecated. Use new notification system.');
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const togglePushNotifications = useCallback(async (enabled: boolean) => {
    setIsUpdating(true);
    try {
      setPreferences(prev => ({ ...prev, push_notifications: enabled }));
      console.warn('[DEPRECATED] togglePushNotifications is deprecated. Use new notification system.');
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const updateDeadlineReminders = useCallback(async (value: '3_1' | '1' | 'none') => {
    setIsUpdating(true);
    try {
      setPreferences(prev => ({ ...prev, deadline_reminders: value }));
      console.warn('[DEPRECATED] updateDeadlineReminders is deprecated. Use new notification system.');
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const updateDigestFrequency = useCallback(async (value: 'immediate' | 'daily' | 'weekly') => {
    setIsUpdating(true);
    try {
      setPreferences(prev => ({ ...prev, digest_frequency: value }));
      console.warn('[DEPRECATED] updateDigestFrequency is deprecated. Use new notification system.');
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const resetToDefaults = useCallback(async () => {
    setIsUpdating(true);
    try {
      setPreferences({
        email_notifications: true,
        push_notifications: false,
        deadline_reminders: '3_1',
        digest_frequency: 'immediate'
      });
      console.warn('[DEPRECATED] resetToDefaults is deprecated. Use new notification system.');
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const sendTestNotification = useCallback(async () => {
    setIsTestingNotification(true);
    try {
      // Use the new NotificationService instead of the old notificationManager
      if (userId) {
        await NotificationService.createNotification({
          userId,
          title: 'Test Notification',
          message: 'This is a test notification from deprecated interface',
          type: 'info',
          priority: 'normal'
        });
      }
      console.warn('[DEPRECATED] sendTestNotification is deprecated. Use NotificationService.createNotification instead.');
    } catch (error) {
      console.error('[DEPRECATED] Error sending test notification:', error);
    } finally {
      setIsTestingNotification(false);
    }
  }, [userId]);

  const canReceiveEmail = preferences.email_notifications;
  const canReceivePush = preferences.push_notifications;

  return {
    preferences,
    stats,
    isLoading,
    toggleEmailNotifications,
    togglePushNotifications,
    updateDeadlineReminders,
    updateDigestFrequency,
    resetToDefaults,
    sendTestNotification,
    isUpdating,
    isTestingNotification,
    canReceiveEmail,
    canReceivePush
  };
};
