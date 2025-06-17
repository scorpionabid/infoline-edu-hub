/**
 * İnfoLine Unified Notification System - React Hooks
 * React components üçün notification hooks
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationManager } from '../core/NotificationManager';
import type { 
  UnifiedNotification,
  NotificationType,
  NotificationPriority,
  NotificationChannel,
  NotificationEvent,
  BulkNotificationRequest
} from '../core/types';

/**
 * Main notifications hook - replaces all old notification hooks
 */
export function useNotifications(userId?: string) {
  const queryClient = useQueryClient();
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const eventListenersRef = useRef<(() => void)[]>([]);

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
    queryFn: () => currentUserId ? notificationManager.getNotifications(currentUserId) : Promise.resolve([]),
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
    queryFn: () => currentUserId ? notificationManager.getUnreadCount(currentUserId) : Promise.resolve(0),
    enabled: !!currentUserId,
    staleTime: 10 * 1000 // 10 seconds
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => 
      currentUserId ? notificationManager.markAsRead(notificationId, currentUserId) : Promise.resolve(false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', currentUserId] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count', currentUserId] });
    }
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => 
      currentUserId ? notificationManager.markAllAsRead(currentUserId) : Promise.resolve(false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', currentUserId] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count', currentUserId] });
    }
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: string) => 
      currentUserId ? notificationManager.deleteNotification(notificationId, currentUserId) : Promise.resolve(false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', currentUserId] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count', currentUserId] });
    }
  });

  // Clear all notifications mutation
  const clearAllMutation = useMutation({
    mutationFn: () => 
      currentUserId ? notificationManager.clearAllNotifications(currentUserId) : Promise.resolve(false),
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
      channels?: NotificationChannel[];
      relatedEntityId?: string;
      relatedEntityType?: string;
    }) => notificationManager.createNotification(
      params.userId,
      params.title,
      params.message,
      params.type,
      {
        priority: params.priority,
        channels: params.channels,
        relatedEntityId: params.relatedEntityId,
        relatedEntityType: params.relatedEntityType
      }
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    }
  });

  // Setup real-time listeners
  useEffect(() => {
    if (!currentUserId || !realTimeEnabled) return;

    const unsubscribeFunctions: (() => void)[] = [];

    // Listen for new notifications
    const unsubscribeCreated = notificationManager.addEventListener('notification_created', (event) => {
      if (event.user_id === currentUserId) {
        queryClient.invalidateQueries({ queryKey: ['notifications', currentUserId] });
        queryClient.invalidateQueries({ queryKey: ['notifications-unread-count', currentUserId] });
      }
    });

    // Listen for notification updates
    const unsubscribeUpdated = notificationManager.addEventListener('notification_updated', (event) => {
      if (event.user_id === currentUserId) {
        queryClient.invalidateQueries({ queryKey: ['notifications', currentUserId] });
        queryClient.invalidateQueries({ queryKey: ['notifications-unread-count', currentUserId] });
      }
    });

    // Listen for notification deletions
    const unsubscribeDeleted = notificationManager.addEventListener('notification_deleted', (event) => {
      if (event.user_id === currentUserId) {
        queryClient.invalidateQueries({ queryKey: ['notifications', currentUserId] });
        queryClient.invalidateQueries({ queryKey: ['notifications-unread-count', currentUserId] });
      }
    });

    unsubscribeFunctions.push(unsubscribeCreated, unsubscribeUpdated, unsubscribeDeleted);
    eventListenersRef.current = unsubscribeFunctions;

    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }, [currentUserId, realTimeEnabled, queryClient]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      eventListenersRef.current.forEach(unsubscribe => unsubscribe());
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

  const createNotification = useCallback((params: {
    userId: string;
    title: string;
    message: string;
    type?: NotificationType;
    priority?: NotificationPriority;
    channels?: NotificationChannel[];
    relatedEntityId?: string;
    relatedEntityType?: string;
  }) => {
    createNotificationMutation.mutate(params);
  }, [createNotificationMutation]);

  const toggleRealTime = useCallback((enabled: boolean) => {
    setRealTimeEnabled(enabled);
  }, []);

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
 */
export function useBulkNotifications() {
  const queryClient = useQueryClient();

  const sendBulkNotificationsMutation = useMutation({
    mutationFn: (request: BulkNotificationRequest) => 
      notificationManager.sendBulkNotifications(request),
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
 */
export function useNotificationAnalytics() {
  const [metrics, setMetrics] = useState(notificationManager.getPerformanceMetrics());
  const [health, setHealth] = useState(notificationManager.getHealth());

  const refreshMetrics = useCallback(() => {
    setMetrics(notificationManager.getPerformanceMetrics());
    setHealth(notificationManager.getHealth());
  }, []);

  // Auto-refresh metrics every 30 seconds
  useEffect(() => {
    const interval = setInterval(refreshMetrics, 30000);
    return () => clearInterval(interval);
  }, [refreshMetrics]);

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

  const urgentDeadlines = deadlineNotifications.filter(
    notification => {
      const daysRemaining = notification.metadata?.days_remaining;
      return daysRemaining !== undefined && daysRemaining <= 3;
    }
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

  const pendingApprovals = approvalNotifications.filter(
    notification => notification.metadata?.approval_status === 'pending'
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
 */
export function useSystemNotifications() {
  const queryClient = useQueryClient();

  const createSystemNotification = useCallback(async (
    title: string,
    message: string,
    priority: NotificationPriority = 'normal',
    userIds?: string[]
  ) => {
    if (userIds && userIds.length > 0) {
      // Bulk notification for specific users
      return notificationManager.sendBulkNotifications({
        type: 'system',
        title,
        message,
        priority,
        channels: ['inApp'],
        user_ids: userIds
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

// Legacy compatibility exports
export default useNotifications;
