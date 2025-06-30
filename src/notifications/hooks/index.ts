/**
 * İnfoLine Unified Notification System - React Hooks
 * React components üçün notification hooks
 * 
 * @deprecated 
 * Bu modul köhnədir və yeni ilə əvəz edilib.
 * Xahiş olunur yeni Notification sistemini istifadə edin:
 * 
 * import { useNotificationContext } from '@/components/notifications/NotificationProvider';
 * və ya
 * import { useNotificationContext } from '@/notifications';
 */

// React imports
import { useEffect, useRef, useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import NotificationService from '@/services/api/notificationService';
import {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationFilters,
  UseNotificationsResult,
  RelatedEntityType
} from '@/types/notifications';

// Geriyə uyğunluq üçün köhnə tip adlarını əhatə et
type UnifiedNotification = Notification;
type NotificationChannel = 'inApp' | 'email';
type NotificationEvent = {
  id: string;
  user_id: string;
};

type BulkNotificationRequest = {
  userIds: string[];
  notification: Partial<Notification>;
};

/**
 * @deprecated Use the new NotificationProvider and useNotificationContext hook instead
 * Main notifications hook - replaces all old notification hooks
 * 
 * This hook uses the new NotificationService internally
 */

export function useNotifications(userId?: string) {
  // We can't use useNotificationContext here as this is the old hook implementation
  // It's mentioned in the deprecation notice that users should migrate
  
  const queryClient = useQueryClient();
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Show deprecation warning on first render
  useEffect(() => {
    console.warn('[DEPRECATED] useNotifications hook is deprecated. Please use useNotificationContext from NotificationProvider instead.');
  }, []);

  // Get current user ID (you might need to adapt this to your auth system)
  const currentUserId = userId; // TODO: Get from auth context

  // Fetch notifications
  const {
    data: notifications = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['notifications', currentUserId],
    queryFn: () => currentUserId ? NotificationService.getUserNotifications(currentUserId, {}) : Promise.resolve([]),
    enabled: !!currentUserId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: realTimeEnabled ? false : 60 * 1000 // 1 minute if real-time disabled
  });

  // Get unread count
  const {
    data: unreadCount = 0,
    refetch: refetchUnreadCount
  } = useQuery({
    queryKey: ['notifications-unread-count', currentUserId],
    queryFn: () => currentUserId ? NotificationService.getUnreadCount(currentUserId) : Promise.resolve(0),
    enabled: !!currentUserId,
    staleTime: 10 * 1000 // 10 seconds
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => 
      currentUserId ? NotificationService.markAsRead(notificationId, currentUserId) : Promise.resolve(false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', currentUserId] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count', currentUserId] });
    }
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => 
      currentUserId ? NotificationService.markAllAsRead(currentUserId) : Promise.resolve(false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', currentUserId] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count', currentUserId] });
    }
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: string) => 
      currentUserId ? NotificationService.deleteNotification(notificationId, currentUserId) : Promise.resolve(false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', currentUserId] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count', currentUserId] });
    }
  });

  // Clear all notifications mutation
  const clearAllMutation = useMutation({
    mutationFn: () => 
      currentUserId ? NotificationService.clearAllNotifications(currentUserId) : Promise.resolve(false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', currentUserId] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count', currentUserId] });
    }
  });

  // Create notification mutation
  const createNotificationMutation = useMutation({
    mutationFn: (params: {
      userId: string;
      title: string;
      message: string;
      type?: NotificationType;
      priority?: NotificationPriority;
      relatedEntityId?: string;
      relatedEntityType?: RelatedEntityType;
    }) => {
      return NotificationService.createNotification({
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type || 'info',
        priority: params.priority || 'normal',
        relatedEntityId: params.relatedEntityId,
        relatedEntityType: params.relatedEntityType
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    }
  });

  // Setup real-time listeners using Supabase directly since NotificationService doesn't have subscription methods
  useEffect(() => {
    if (!currentUserId || !realTimeEnabled) return;

    try {
      // Create a Supabase channel for real-time notifications
      const channel = supabase
        .channel(`notifications:${currentUserId}`)
        .on(
          'postgres_changes',
          {
            event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${currentUserId}`
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['notifications', currentUserId] });
            queryClient.invalidateQueries({ queryKey: ['notifications-unread-count', currentUserId] });
          }
        )
        .subscribe();
        
      // Store channel reference for cleanup
      channelRef.current = channel;
      
      console.log(`[Notifications] Subscribed to real-time updates for user ${currentUserId}`);
    } catch (error) {
      console.error('[Notifications] Failed to setup real-time listeners:', error);
    }

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
        console.log(`[Notifications] Unsubscribed from real-time updates for user ${currentUserId}`);
      }
    };
  }, [currentUserId, queryClient, realTimeEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, []);

  // Public API
  const markAsRead = useCallback((notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  }, [markAsReadMutation]);

  const markAllAsRead = useCallback(() => {
    markAllAsReadMutation.mutate();
  }, [markAllAsReadMutation]);

  const deleteNotification = useCallback((notificationId: string) => {
    deleteNotificationMutation.mutate(notificationId);
  }, [deleteNotificationMutation]);

  const clearAll = useCallback(() => {
    clearAllMutation.mutate();
  }, [clearAllMutation]);

  const createNotification = useCallback(
    async (params: {
      userId: string;
      title: string;
      message: string;
      type?: NotificationType;
      priority?: NotificationPriority;
      relatedEntityId?: string;
      relatedEntityType?: RelatedEntityType;
    }) => {
      try {
        // Use the notification service to create the notification
        const result = await createNotificationMutation.mutateAsync(params);
        return result;
      } catch (error) {
        console.error('[Notifications] Failed to create notification:', error);
        return null;
      }
    },
    [createNotificationMutation]
  );

  const toggleRealTime = useCallback(
    (enable: boolean) => {
      setRealTimeEnabled(enable);

      if (enable) {
        // Resubscribe if needed
        if (!channelRef.current && currentUserId) {
          // Create a new channel subscription
          const channel = supabase
            .channel(`notifications:${currentUserId}`)
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${currentUserId}`
              },
              () => {
                queryClient.invalidateQueries({ queryKey: ['notifications', currentUserId] });
                queryClient.invalidateQueries({ queryKey: ['notifications-unread-count', currentUserId] });
              }
            )
            .subscribe();
            
          channelRef.current = channel;
        }
      } else {
        // Unsubscribe from real-time updates
        if (channelRef.current) {
          channelRef.current.unsubscribe();
          channelRef.current = null;
        }
      }
    },
    [currentUserId, queryClient]
  );

  return {
    // Data
    notifications,
    unreadCount,
    isLoading,
    error,
    
    // Actions
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    createNotification,
    refetch,
    refetchUnreadCount,
    
    // Real-time control
    realTimeEnabled,
    toggleRealTime,
    
    // Mutation states
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isDeleting: deleteNotificationMutation.isPending,
    isClearing: clearAllMutation.isPending,
    isCreating: createNotificationMutation.isPending
  };
}

/**
 * Hook for bulk notifications (admin functionality)
 * @deprecated Use the new NotificationProvider and useNotificationContext hook instead
 */
export function useBulkNotifications() {
  const queryClient = useQueryClient();

  // Log deprecation warning on first render
  useEffect(() => {
    console.warn('[DEPRECATED] useBulkNotifications hook is deprecated. Please use useNotificationContext from NotificationProvider instead.');
  }, []);

  const sendBulkNotificationsMutation = useMutation({
    mutationFn: (request: BulkNotificationRequest) => 
      // Use NotificationService to create bulk notifications
      NotificationService.createBulkNotifications({
        userIds: request.userIds,
        title: request.notification.title || '',
        message: request.notification.message || '',
        type: request.notification.type || 'info',
        priority: request.notification.priority || 'normal',
        relatedEntityId: request.notification.related_entity_id,
        relatedEntityType: (request.notification.related_entity_type as RelatedEntityType) || 'system'
      }),
    onSuccess: () => {
      // Invalidate all notification queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    }
  });

  const sendBulkNotifications = useCallback((request: BulkNotificationRequest) => {
    return sendBulkNotificationsMutation.mutateAsync(request);
  }, [sendBulkNotificationsMutation]);

  return {
    sendBulkNotifications,
    isSending: sendBulkNotificationsMutation.isPending,
    error: sendBulkNotificationsMutation.error,
    lastResult: sendBulkNotificationsMutation.data
  };
}

/**
 * Hook for notification analytics and monitoring
 * @deprecated This hook is no longer supported in the new notification system
 */
export function useNotificationAnalytics() {
  // Create placeholder data structures to maintain compatibility
  const [metrics, setMetrics] = useState({
    totalProcessed: 0,
    avgProcessingTime: 0,
    successRate: 100,
    lastUpdated: new Date().toISOString()
  });
  
  const [health, setHealth] = useState({
    status: 'healthy',
    availableChannels: ['inApp'],
    issuesDetected: []
  });

  // Log deprecation warning on first render
  useEffect(() => {
    console.warn('[DEPRECATED] useNotificationAnalytics hook is deprecated and no longer provides real metrics.');
  }, []);

  const refreshMetrics = useCallback(() => {
    // Update timestamp to simulate refresh
    setMetrics(prev => ({
      ...prev,
      lastUpdated: new Date().toISOString()
    }));
  }, []);

  return {
    metrics,
    health,
    refreshMetrics
  };
}

/**
 * Hook for deadline notifications specifically
 */
export function useDeadlineNotifications(userId?: string) {
  const { notifications, ...rest } = useNotifications(userId);
  
  const deadlineNotifications = notifications.filter(
    notification => notification.type === 'deadline'
  );

  // New notification system doesn't support metadata field directly, warn about this limitation
  useEffect(() => {
    console.warn('[DEPRECATED] useDeadlineNotifications hook: metadata support is limited in the new notification system. Deadline urgency filtering may not work as expected.');
  }, []);
  
  // Simply return all deadline notifications as urgent if their priority is high or critical
  const urgentDeadlines = deadlineNotifications.filter(
    notification => notification.priority === 'high' || notification.priority === 'critical'
  );

  const createDeadlineNotification = useCallback(async (
    userId: string,
    categoryName: string,
    categoryId: string,
    deadlineDate: string,
    daysRemaining: number
  ) => {
    const title = `Son tarix xatırlatması: ${categoryName}`;
    const message = `"${categoryName}" kateqoriyası üçün son tarix ${daysRemaining} gün qalıb. Tarix: ${deadlineDate}`;
    
    return NotificationService.createNotification({
      userId,
      title,
      message,
      type: 'deadline',
      priority: daysRemaining <= 1 ? 'critical' : daysRemaining <= 3 ? 'high' : 'normal',
      relatedEntityId: categoryId,
      relatedEntityType: 'category'
    });
  }, []);

  return {
    ...rest,
    deadlineNotifications,
    urgentDeadlines,
    createDeadlineNotification
  };
}

/**
 * Hook for approval notifications specifically
 */
export function useApprovalNotifications(userId?: string) {
  const { notifications, ...rest } = useNotifications(userId);
  
  const approvalNotifications = notifications.filter(
    notification => notification.type === 'approval' || notification.type === 'rejection'
  );

  // New notification system doesn't support metadata field directly, warn about this limitation
  useEffect(() => {
    console.warn('[DEPRECATED] useApprovalNotifications hook: metadata support is limited in the new notification system. Pending approval filtering may not work as expected.');
  }, []);
  
  // In the new system, all approval notifications without 'is_read' flag are considered pending
  const pendingApprovals = approvalNotifications.filter(
    notification => !notification.is_read
  );

  const createApprovalNotification = useCallback(async (
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
    
    return NotificationService.createNotification({
      userId,
      title,
      message,
      type: isApproved ? 'approval' : 'rejection',
      priority: 'high',
      relatedEntityId: categoryId,
      relatedEntityType: 'category'
    });
  }, []);

  return {
    ...rest,
    approvalNotifications,
    pendingApprovals,
    createApprovalNotification
  };
}

/**
 * Hook for system notifications
 * @deprecated Use the new NotificationProvider and useNotificationContext hook instead
 */
export function useSystemNotifications() {
  const queryClient = useQueryClient();
  
  // Log deprecation warning on first render
  useEffect(() => {
    console.warn('[DEPRECATED] useSystemNotifications hook is deprecated. Please use useNotificationContext from NotificationProvider instead.');
  }, []);

  const createSystemNotification = useCallback(async (
    title: string,
    message: string,
    priority: NotificationPriority = 'normal',
    userIds?: string[]
  ) => {
    if (userIds && userIds.length > 0) {
      // Bulk notification for specific users
      return NotificationService.createBulkNotifications({
        userIds: userIds,
        title,
        message,
        type: 'system',
        priority,
        relatedEntityType: 'system'
      });
    } else {
      // This would require getting all user IDs from the system
      console.warn('System notification to all users not implemented');
      return null;
    }
  }, []);

  return {
    createSystemNotification
  };
}

/**
 * Hook for notification preferences management
 */
export function useNotificationPreferences(userId?: string) {
  const queryClient = useQueryClient();
  const [isTestingNotification, setIsTestingNotification] = useState(false);

  // Get user preferences
  const {
    data: preferences,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['notification-preferences', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { NotificationPreferencesService } = await import('@/services/NotificationPreferencesService');
      return NotificationPreferencesService.getUserPreferences(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get notification statistics
  const {
    data: stats,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['notification-stats', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { NotificationPreferencesService } = await import('@/services/NotificationPreferencesService');
      return NotificationPreferencesService.getUserNotificationStats(userId);
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (updates: any) => {
      if (!userId) return false;
      const { NotificationPreferencesService } = await import('@/services/NotificationPreferencesService');
      return NotificationPreferencesService.updateUserPreferences(userId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences', userId] });
    }
  });

  // Send test notification mutation
  const sendTestNotificationMutation = useMutation({
    mutationFn: async () => {
      if (!userId) return false;
      const { NotificationPreferencesService } = await import('@/services/NotificationPreferencesService');
      return NotificationPreferencesService.sendTestNotification(userId);
    },
    onSuccess: (success) => {
      if (success) {
        // Refresh notification stats after test
        setTimeout(() => refetchStats(), 2000);
      }
    }
  });

  // Convenience functions
  const toggleEmailNotifications = useCallback((enabled: boolean) => {
    updatePreferencesMutation.mutate({ email_enabled: enabled });
  }, [updatePreferencesMutation]);

  const togglePushNotifications = useCallback((enabled: boolean) => {
    updatePreferencesMutation.mutate({ push_enabled: enabled });
  }, [updatePreferencesMutation]);

  const updateDeadlineReminders = useCallback((setting: '3_1' | '1' | 'none') => {
    updatePreferencesMutation.mutate({ deadline_reminders: setting });
  }, [updatePreferencesMutation]);

  const updateDigestFrequency = useCallback((frequency: 'immediate' | 'daily' | 'weekly') => {
    updatePreferencesMutation.mutate({ digest_frequency: frequency });
  }, [updatePreferencesMutation]);

  const updateCategoryPreferences = useCallback((categoryPreferences: Record<string, boolean>) => {
    updatePreferencesMutation.mutate({ category_preferences: categoryPreferences });
  }, [updatePreferencesMutation]);

  const sendTestNotification = useCallback(async () => {
    setIsTestingNotification(true);
    try {
      await sendTestNotificationMutation.mutateAsync();
    } finally {
      setIsTestingNotification(false);
    }
  }, [sendTestNotificationMutation]);

  // Update all preferences at once
  const updatePreferences = useCallback((updates: any) => {
    updatePreferencesMutation.mutate(updates);
  }, [updatePreferencesMutation]);

  // Reset to default preferences
  const resetToDefaults = useCallback(async () => {
    if (userId) {
      const { NotificationPreferencesService } = await import('@/services/NotificationPreferencesService');
      const defaults = NotificationPreferencesService.getDefaultPreferences(userId);
      updatePreferencesMutation.mutate(defaults);
    }
  }, [userId, updatePreferencesMutation]);

  return {
    // Data
    preferences,
    stats,
    isLoading,
    error,
    
    // Actions
    toggleEmailNotifications,
    togglePushNotifications,
    updateDeadlineReminders,
    updateDigestFrequency,
    updateCategoryPreferences,
    updatePreferences,
    resetToDefaults,
    sendTestNotification,
    refetch,
    refetchStats,
    
    // States
    isUpdating: updatePreferencesMutation.isPending,
    isTestingNotification: isTestingNotification || sendTestNotificationMutation.isPending,
    
    // Computed values
    hasUnsavedChanges: false,
    canReceiveEmail: preferences?.email_enabled ?? true,
    canReceivePush: preferences?.push_enabled ?? true,
    deadlineRemindersEnabled: preferences?.deadline_reminders !== 'none',
  };
}

// Legacy compatibility exports
export default useNotifications;
