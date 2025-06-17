/**
 * İnfoLine Notification System - Legacy Service Compatibility Layer
 * DEPRECATED: Use notificationManager from @/notifications instead
 * Bu fayl backward compatibility üçün saxlanılır
 */

import { notificationManager, NotificationHelpers } from '@/notifications';
import type { NotificationType } from '@/notifications';

/**
 * @deprecated Use notificationManager.createNotification instead
 */
export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: NotificationType = 'info',
  relatedEntityId?: string,
  relatedEntityType?: string
) => {
  console.warn(`
[DEPRECATED] createNotification from services/notificationService is deprecated.

Please migrate to:
- Import: import { notificationManager } from '@/notifications'
- Usage: notificationManager.createNotification(userId, title, message, type, options)

The new API provides better options configuration and TypeScript support.
  `);

  try {
    const data = await notificationManager.createNotification(
      userId,
      title,
      message,
      type,
      {
        relatedEntityId,
        relatedEntityType
      }
    );

    return data;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * @deprecated Use NotificationHelpers.createDeadlineNotification instead
 */
export const createDeadlineNotification = async (
  title: string,
  message: string,
  categoryId: string
) => {
  console.warn(`
[DEPRECATED] createDeadlineNotification is deprecated.

Please migrate to:
- Import: import { NotificationHelpers } from '@/notifications'
- Usage: NotificationHelpers.createDeadlineNotification(userId, categoryName, categoryId, deadlineDate, daysRemaining)

The new API requires userId and provides better deadline-specific metadata.
  `);

  try {
    // This function was incomplete in the old system - it didn't specify userId
    // For backward compatibility, we'll return the parameters that should be used
    // with the new system
    return {
      title,
      message,
      type: 'deadline' as const,
      relatedEntityId: categoryId,
      relatedEntityType: 'category',
      // Note: The old function was missing userId - this needs to be provided by the caller
      migrationNote: 'This function needs userId. Use NotificationHelpers.createDeadlineNotification instead.'
    };
  } catch (error) {
    console.error('Error creating deadline notification:', error);
    throw error;
  }
};

/**
 * @deprecated Use NotificationHelpers.createApprovalNotification instead
 */
export const createApprovalNotification = async (
  userId: string,
  categoryName: string,
  categoryId: string,
  isApproved: boolean,
  rejectionReason?: string
) => {
  console.warn(`
[DEPRECATED] createApprovalNotification is deprecated.

Please migrate to:
- Import: import { NotificationHelpers } from '@/notifications'
- Usage: NotificationHelpers.createApprovalNotification(userId, categoryName, categoryId, isApproved, reviewerId, reviewerName, rejectionReason)

The new API provides better metadata and reviewer information support.
  `);

  try {
    return await NotificationHelpers.createApprovalNotification(
      userId,
      categoryName,
      categoryId,
      isApproved,
      undefined, // reviewerId - not available in old API
      undefined, // reviewerName - not available in old API
      rejectionReason
    );
  } catch (error) {
    console.error('Error creating approval notification:', error);
    throw error;
  }
};

/**
 * @deprecated Use notificationManager.getNotifications instead
 */
export const getUserNotifications = async (userId: string) => {
  console.warn(`
[DEPRECATED] getUserNotifications is deprecated.

Please migrate to:
- Import: import { notificationManager } from '@/notifications'
- Usage: notificationManager.getNotifications(userId, options)

The new API provides better filtering and pagination options.
  `);

  try {
    const notifications = await notificationManager.getNotifications(userId);
    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * @deprecated Use notificationManager.getNotifications instead
 * Alias for getUserNotifications for backward compatibility
 */
export const getNotifications = getUserNotifications;

// Migration notice
if (typeof window !== 'undefined') {
  console.warn(`
[MIGRATION NOTICE] 
/src/services/notificationService.ts is deprecated.

Please migrate to the new unified notification system:
- Import: import { notificationManager, NotificationHelpers } from '@/notifications'

Key changes:
- Better TypeScript support with detailed types
- Improved error handling and retry logic
- Real-time notification support
- Better caching and performance
- More notification types and metadata support

Migration examples:
- Old: createNotification(userId, title, message, type)
- New: notificationManager.createNotification(userId, title, message, type, options)

- Old: createDeadlineNotification(title, message, categoryId)
- New: NotificationHelpers.createDeadlineNotification(userId, categoryName, categoryId, deadlineDate, daysRemaining)

See /src/notifications/index.ts for full API documentation.
  `);
}

export default {
  createNotification,
  createDeadlineNotification,
  createApprovalNotification,
  getUserNotifications,
  getNotifications
};
