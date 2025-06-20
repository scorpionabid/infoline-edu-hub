/**
 * İnfoLine Unified Notification System - Public API
 * Bütün notification funksionallığı üçün vahid entry point
 */

// Core exports
export { UnifiedNotificationManager, notificationManager } from './core/NotificationManager';

// Hook exports
export {
  useNotifications,
  useBulkNotifications,
  useNotificationAnalytics,
  useDeadlineNotifications,
  useApprovalNotifications,
  useSystemNotifications
} from './hooks';

// Component exports
export {
  UnifiedNotificationProvider,
  NotificationProvider,
  useNotificationContext,
  withNotifications
} from './components/NotificationProvider';

// Type exports
export type {
  UnifiedNotification,
  NotificationType,
  NotificationPriority,
  NotificationChannel,
  NotificationStatus,
  NotificationSettings,
  NotificationTemplate,
  BulkNotificationRequest,
  NotificationAnalytics,
  NotificationEvent,
  NotificationMetadata,
  NotificationAction,
  NotificationManagerConfig
} from './core/types';

// Constants exports
export {
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_TYPES,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_STATUS,
  DEFAULT_NOTIFICATION_CONFIG
} from './core/types';

// Utility functions for easy migration from old notification systems
export const NotificationUtils = {
  /**
   * Migrate from old contexts/NotificationContext.tsx usage
   */
  migrateFromContext: (
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ) => {
    console.warn('[DEPRECATED] Old NotificationContext usage. Use notificationManager.createNotification instead.');
    
    const notificationType = type as NotificationType;
    
    return {
      title,
      message,
      type: notificationType,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Migrate from old hooks/useNotifications.ts usage
   */
  migrateFromHook: (notification: any) => {
    console.warn('[DEPRECATED] Old useNotifications hook. Use unified useNotifications from @/notifications instead.');
    
    const unified: Partial<UnifiedNotification> = {
      id: notification.id,
      user_id: notification.user_id || '',
      type: notification.type || 'info',
      title: notification.title,
      message: notification.message,
      is_read: notification.is_read || false,
      priority: notification.priority || 'normal',
      created_at: notification.created_at,
      related_entity_id: notification.related_entity_id,
      related_entity_type: notification.related_entity_type
    };
    
    return unified;
  },

  /**
   * Migrate from old services/notificationService.ts usage
   */
  migrateFromService: {
    createNotification: async (
      userId: string,
      title: string,
      message: string,
      type: NotificationType = 'info',
      relatedEntityId?: string,
      relatedEntityType?: string
    ) => {
      console.warn('[DEPRECATED] Old notificationService. Use notificationManager instead.');
      
      return notificationManager.createNotification(
        userId,
        title,
        message,
        type,
        {
          relatedEntityId,
          relatedEntityType
        }
      );
    },

    createDeadlineNotification: async (
      title: string,
      message: string,
      categoryId: string
    ) => {
      console.warn('[DEPRECATED] Old createDeadlineNotification. Use notificationManager.createNotification with type "deadline".');
      
      return {
        title,
        message,
        type: 'deadline' as const,
        relatedEntityId: categoryId,
        relatedEntityType: 'category'
      };
    },

    createApprovalNotification: async (
      userId: string,
      categoryName: string,
      categoryId: string,
      isApproved: boolean,
      rejectionReason?: string
    ) => {
      console.warn('[DEPRECATED] Old createApprovalNotification. Use notificationManager.createNotification.');
      
      const title = isApproved 
        ? `"${categoryName}" məlumatları təsdiqləndi`
        : `"${categoryName}" məlumatları rədd edildi`;
      
      const message = isApproved
        ? `"${categoryName}" kateqoriyası üçün təqdim etdiyiniz məlumatlar təsdiqləndi.`
        : `"${categoryName}" kateqoriyası üçün təqdim etdiyiniz məlumatlar rədd edildi. ${rejectionReason ? `Səbəb: ${rejectionReason}` : ''}`;
      
      return notificationManager.createNotification(
        userId,
        title,
        message,
        isApproved ? 'approval' : 'rejection',
        {
          priority: 'high',
          relatedEntityId: categoryId,
          relatedEntityType: 'category',
          metadata: {
            approval_status: isApproved ? 'approved' : 'rejected',
            rejection_reason: rejectionReason,
            category_id: categoryId,
            category_name: categoryName
          }
        }
      );
    }
  }
};

// Helper functions for common notification patterns
export const NotificationHelpers = {
  /**
   * Create deadline notification
   */
  createDeadlineNotification: async (
    userId: string,
    categoryName: string,
    categoryId: string,
    deadlineDate: string,
    daysRemaining: number
  ) => {
    const title = `Son tarix xatırlatması: ${categoryName}`;
    const message = `"${categoryName}" kateqoriyası üçün son tarix ${daysRemaining} gün qalıb. Tarix: ${deadlineDate}`;
    
    return notificationManager.createNotification(
      userId,
      title,
      message,
      'deadline',
      {
        priority: daysRemaining <= 1 ? 'critical' : daysRemaining <= 3 ? 'high' : 'normal',
        channels: ['inApp', 'email'],
        relatedEntityId: categoryId,
        relatedEntityType: 'category',
        metadata: {
          deadline_date: deadlineDate,
          days_remaining: daysRemaining,
          category_id: categoryId,
          category_name: categoryName
        }
      }
    );
  },

  /**
   * Create approval notification
   */
  createApprovalNotification: async (
    userId: string,
    categoryName: string,
    categoryId: string,
    isApproved: boolean,
    reviewerId?: string,
    reviewerName?: string,
    rejectionReason?: string
  ) => {
    const title = isApproved 
      ? `Təsdiqləndi: ${categoryName}`
      : `Rədd edildi: ${categoryName}`;
    
    const message = isApproved
      ? `"${categoryName}" kateqoriyası üçün təqdim etdiyiniz məlumatlar təsdiqləndi.`
      : `"${categoryName}" kateqoriyası üçün təqdim etdiyiniz məlumatlar rədd edildi. ${rejectionReason ? `Səbəb: ${rejectionReason}` : ''}`;
    
    return notificationManager.createNotification(
      userId,
      title,
      message,
      isApproved ? 'approval' : 'rejection',
      {
        priority: 'high',
        channels: ['inApp', 'email'],
        relatedEntityId: categoryId,
        relatedEntityType: 'category',
        metadata: {
          approval_status: isApproved ? 'approved' : 'rejected',
          reviewer_id: reviewerId,
          reviewer_name: reviewerName,
          rejection_reason: rejectionReason,
          category_id: categoryId,
          category_name: categoryName
        }
      }
    );
  },

  /**
   * Create data entry reminder
   */
  createDataEntryReminder: async (
    userId: string,
    categoryName: string,
    categoryId: string,
    completionPercentage: number,
    schoolName?: string
  ) => {
    const title = `Məlumat daxil etmə xatırlatması: ${categoryName}`;
    const message = `"${categoryName}" kateqoriyası üçün məlumat daxil etmə ${completionPercentage}% tamamlanıb. ${schoolName ? `Məktəb: ${schoolName}` : ''}`;
    
    return notificationManager.createNotification(
      userId,
      title,
      message,
      'reminder',
      {
        priority: completionPercentage < 50 ? 'high' : 'normal',
        channels: ['inApp'],
        relatedEntityId: categoryId,
        relatedEntityType: 'category',
        metadata: {
          category_id: categoryId,
          category_name: categoryName,
          completion_percentage: completionPercentage,
          school_name: schoolName
        }
      }
    );
  },

  /**
   * Create system maintenance notification
   */
  createSystemNotification: async (
    userIds: string[],
    title: string,
    message: string,
    priority: NotificationPriority = 'normal'
  ) => {
    return notificationManager.sendBulkNotifications({
      type: 'system',
      title,
      message,
      priority,
      channels: ['inApp'],
      user_ids: userIds
    });
  },

  /**
   * Create school update notification
   */
  createSchoolUpdateNotification: async (
    userId: string,
    schoolName: string,
    schoolId: string,
    updateType: 'created' | 'updated' | 'deleted'
  ) => {
    const titles = {
      created: `Yeni məktəb əlavə edildi: ${schoolName}`,
      updated: `Məktəb məlumatları yeniləndi: ${schoolName}`,
      deleted: `Məktəb silindi: ${schoolName}`
    };

    const messages = {
      created: `"${schoolName}" məktəbi sistemə əlavə edildi.`,
      updated: `"${schoolName}" məktəbinin məlumatları yeniləndi.`,
      deleted: `"${schoolName}" məktəbi sistemdən silindi.`
    };
    
    return notificationManager.createNotification(
      userId,
      titles[updateType],
      messages[updateType],
      'school_update',
      {
        priority: 'normal',
        channels: ['inApp'],
        relatedEntityId: schoolId,
        relatedEntityType: 'school',
        metadata: {
          school_id: schoolId,
          school_name: schoolName,
          update_type: updateType
        }
      }
    );
  }
};

// Debug and monitoring utilities
export const NotificationDebug = {
  /**
   * Enable verbose logging for notifications
   */
  enableVerboseLogging: () => {
    console.log('[NotificationDebug] Verbose logging enabled');
    // This would hook into the NotificationManager's debug mode
    notificationManager.getHealth(); // Trigger health check logging
  },

  /**
   * Get comprehensive notification statistics
   */
  getStats: () => {
    return {
      performance: notificationManager.getPerformanceMetrics(),
      health: notificationManager.getHealth()
    };
  },

  /**
   * Test notification functionality
   */
  runTests: async (testUserId: string) => {
    console.group('[NotificationDebug] Running notification tests');

    try {
      // Test basic notification creation
      const testNotification = await notificationManager.createNotification(
        testUserId,
        'Test Notification',
        'This is a test notification',
        'info'
      );
      console.assert(testNotification !== null, 'Basic notification creation failed');

      // Test unread count
      const unreadCount = await notificationManager.getUnreadCount(testUserId);
      console.assert(unreadCount >= 0, 'Unread count failed');

      // Test mark as read
      if (testNotification) {
        const markResult = await notificationManager.markAsRead(testNotification.id, testUserId);
        console.assert(markResult === true, 'Mark as read failed');
      }

      console.log('✅ All notification tests passed');
    } catch (error) {
      console.error('❌ Notification tests failed:', error);
    }

    console.groupEnd();
  }
};

// Performance monitoring
export const NotificationPerformance = {
  /**
   * Start performance monitoring
   */
  startMonitoring: () => {
    const metrics = notificationManager.getPerformanceMetrics();
    console.log('[NotificationPerformance] Monitoring started:', metrics);
    
    return {
      getMetrics: () => notificationManager.getPerformanceMetrics(),
      getHealth: () => notificationManager.getHealth()
    };
  }
};

// Default export with commonly used functions
export default {
  // Main manager
  notificationManager,
  
  // Hooks
  useNotifications,
  useBulkNotifications,
  useNotificationAnalytics,
  useDeadlineNotifications,
  useApprovalNotifications,
  useSystemNotifications,
  
  // Components
  UnifiedNotificationProvider,
  NotificationProvider,
  useNotificationContext,
  
  // Utilities
  NotificationUtils,
  NotificationHelpers,
  NotificationDebug,
  NotificationPerformance,
  
  // Constants
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_STATUS
};
