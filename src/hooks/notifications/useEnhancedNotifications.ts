
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppNotification } from '@/types/notification';
import { useAuth } from '@/context/AuthContext';
import { RealtimeNotificationService } from '@/services/notifications/realtimeService';

export interface NotificationFilters {
  type: string;
  priority: string; 
  read: 'all' | 'read' | 'unread';
  searchTerm: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface ConnectionHealth {
  health: 'excellent' | 'good' | 'poor' | 'offline';
  latency: number;
  reconnectCount: number;
  lastConnected?: number;
}

/**
 * Enhanced notifications hook with filtering and real-time capabilities
 */
export const useEnhancedNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<NotificationFilters>({
    type: '',
    priority: '',
    read: 'all',
    searchTerm: ''
  });

  // Fetch notifications
  const { 
    data: notifications = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async (): Promise<AppNotification[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      return (data || []).map(notification => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority,
        isRead: notification.is_read,
        is_read: notification.is_read,
        createdAt: notification.created_at,
        timestamp: notification.created_at,
        relatedEntityId: notification.related_entity_id,
        relatedEntityType: notification.related_entity_type,
        user_id: notification.user_id
      }));
    },
    enabled: !!user?.id
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    }
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    }
  });

  // Clear all mutation
  const clearAllMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    }
  });

  // Setup real-time notifications
  useEffect(() => {
    if (!user?.id) return;

    const subscription = RealtimeNotificationService.setupRealtimeNotifications(
      user.id,
      (notification) => {
        queryClient.setQueryData(['notifications', user.id], (oldData: AppNotification[] = []) => {
          return [notification, ...oldData];
        });
      }
    );

    return subscription.unsubscribe;
  }, [user?.id, queryClient]);

  // Calculate unread count
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.isRead && !n.is_read).length;
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    clearAll: clearAllMutation.mutate,
    refreshNotifications: refetch,
    filters,
    setFilters
  };
};

/**
 * Hook for notification filtering
 */
export const useNotificationFilters = () => {
  const { notifications, filters, setFilters } = useEnhancedNotifications();

  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      // Type filter
      if (filters.type && notification.type !== filters.type) {
        return false;
      }

      // Priority filter
      if (filters.priority && notification.priority !== filters.priority) {
        return false;
      }

      // Read status filter
      if (filters.read === 'read' && !notification.isRead && !notification.is_read) {
        return false;
      }
      if (filters.read === 'unread' && (notification.isRead || notification.is_read)) {
        return false;
      }

      // Search filter
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        const searchableText = `${notification.title} ${notification.message || ''}`.toLowerCase();
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateRange) {
        const notificationDate = new Date(notification.createdAt || notification.timestamp);
        if (notificationDate < filters.dateRange.from || notificationDate > filters.dateRange.to) {
          return false;
        }
      }

      return true;
    });
  }, [notifications, filters]);

  const updateFilter = useCallback((key: keyof NotificationFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, [setFilters]);

  const clearFilters = useCallback(() => {
    setFilters({
      type: '',
      priority: '',
      read: 'all',
      searchTerm: ''
    });
  }, [setFilters]);

  const getFilterOptions = useCallback(() => {
    const types = [...new Set(notifications.map(n => n.type).filter(Boolean))];
    const priorities = [...new Set(notifications.map(n => n.priority).filter(Boolean))];
    
    return { types, priorities };
  }, [notifications]);

  return {
    filters,
    filteredNotifications,
    updateFilter,
    clearFilters,
    getFilterOptions
  };
};

/**
 * Hook for monitoring connection health
 */
export const useNotificationConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState('DISCONNECTED');
  const [connectionHealth, setConnectionHealth] = useState<ConnectionHealth>({
    health: 'offline',
    latency: 0,
    reconnectCount: 0
  });

  const handleReconnect = useCallback(async () => {
    await RealtimeNotificationService.reconnect();
  }, []);

  const getConnectionHealth = useCallback((): ConnectionHealth => {
    const status = RealtimeNotificationService.getConnectionStatus();
    
    let health: ConnectionHealth['health'] = 'offline';
    if (status.isConnected) {
      if (status.reconnectCount === 0) {
        health = 'excellent';
      } else if (status.reconnectCount < 3) {
        health = 'good';
      } else {
        health = 'poor';
      }
    }

    return {
      health,
      latency: 0, // Could be calculated with ping
      reconnectCount: status.reconnectCount,
      lastConnected: status.lastReconnectAttempt
    };
  }, []);

  // Update connection health periodically
  useEffect(() => {
    const updateHealth = () => {
      setConnectionHealth(getConnectionHealth());
    };

    updateHealth();
    const interval = setInterval(updateHealth, 5000);

    return () => clearInterval(interval);
  }, [getConnectionHealth]);

  return {
    connectionStatus,
    connectionHealth,
    handleReconnect,
    getConnectionHealth
  };
};
