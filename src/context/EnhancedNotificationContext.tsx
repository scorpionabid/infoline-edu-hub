import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import {
  Notification,
  NotificationFilters,
  NotificationStats,
} from '@/types/notification';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedNotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  createNotification: (notification: Partial<Notification>) => Promise<void>;
  
  // Filtering and searching
  filterNotifications: (filters: NotificationFilters) => void;
  searchNotifications: (searchTerm: string) => void;
  
  // Real-time updates
  enableRealtime: () => void;
  disableRealtime: () => void;
  
  // Bulk operations
  markMultipleAsRead: (notificationIds: string[]) => Promise<void>;
  deleteMultiple: (notificationIds: string[]) => Promise<void>;
  
  // Analytics
  getNotificationStats: () => NotificationStats;
  
  // Refresh
  refetch: () => Promise<void>;
}

const EnhancedNotificationContext =
  createContext<EnhancedNotificationContextType | undefined>(undefined);

interface EnhancedNotificationProviderProps {
  children: React.ReactNode;
}

const EnhancedNotificationProvider: React.FC<
  EnhancedNotificationProviderProps
> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [realtimeChannel, setRealtimeChannel] = useState<any>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [realtimeChannel]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const fetchedNotifications = data as Notification[];
      setNotifications(fetchedNotifications);
      setTotalCount(fetchedNotifications.length);
      setUnreadCount(
        fetchedNotifications.filter((notification) => !notification.is_read).length
      );
    } catch (error: any) {
      setError(error);
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeListeners = () => {
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          console.log('Realtime event received:', payload);
          fetchNotifications();
        }
      )
      .subscribe();
    
    setRealtimeChannel(channel);
  };

  const removeRealtimeListeners = () => {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      setRealtimeChannel(null);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (updateError) throw updateError;

      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId ? { ...notification, is_read: true } : notification
        )
      );
      setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
    } catch (error: any) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false);

      if (updateError) throw updateError;

      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({ ...notification, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error: any) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (deleteError) throw deleteError;

      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== notificationId)
      );
      setTotalCount((prevCount) => Math.max(0, prevCount - 1));
      setUnreadCount((prevCount) => {
        const deletedNotification = notifications.find(
          (notification) => notification.id === notificationId
        );
        return deletedNotification && !deletedNotification.is_read
          ? Math.max(0, prevCount - 1)
          : prevCount;
      });
    } catch (error: any) {
      console.error('Failed to delete notification:', error);
    }
  };

  const createNotification = async (notificationData: Partial<Notification>) => {
    try {
      const fullNotification = {
        title: notificationData.title || 'Untitled',
        type: notificationData.type || 'info',
        user_id: notificationData.user_id || '',
        message: notificationData.message,
        priority: notificationData.priority,
        related_entity_id: notificationData.related_entity_id,
        related_entity_type: notificationData.related_entity_type,
        is_read: false
      };

      const { data, error: createError } = await supabase
        .from('notifications')
        .insert([fullNotification])
        .select('*');

      if (createError) throw createError;

      const newNotification = data ? (data[0] as Notification) : null;

      if (newNotification) {
        setNotifications((prevNotifications) => [
          newNotification,
          ...prevNotifications,
        ]);
        setTotalCount((prevCount) => prevCount + 1);
        if (!newNotification.is_read) {
          setUnreadCount((prevCount) => prevCount + 1);
        }
      }
    } catch (error: any) {
      console.error('Failed to create notification:', error);
    }
  };

  const filterNotifications = (filters: NotificationFilters) => {
    console.log('Filtering notifications with:', filters);
  };

  const searchNotifications = (searchTerm: string) => {
    console.log('Searching notifications with:', searchTerm);
  };

  const enableRealtime = () => {
    setupRealtimeListeners();
  };

  const disableRealtime = () => {
    removeRealtimeListeners();
  };

  const markMultipleAsRead = async (notificationIds: string[]) => {
    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', notificationIds);

      if (updateError) throw updateError;

      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notificationIds.includes(notification.id)
            ? { ...notification, is_read: true }
            : notification
        )
      );
      setUnreadCount((prevCount) => {
        const markedAsRead = notifications.filter(
          (notification) =>
            notificationIds.includes(notification.id) && !notification.is_read
        ).length;
        return Math.max(0, prevCount - markedAsRead);
      });
    } catch (error: any) {
      console.error('Failed to mark multiple notifications as read:', error);
    }
  };

  const deleteMultiple = async (notificationIds: string[]) => {
    try {
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .in('id', notificationIds);

      if (deleteError) throw deleteError;

      setNotifications((prevNotifications) =>
        prevNotifications.filter(
          (notification) => !notificationIds.includes(notification.id)
        )
      );
      setTotalCount((prevCount) => Math.max(0, prevCount - notificationIds.length));
      setUnreadCount((prevCount) => {
        const deletedUnread = notifications.filter(
          (notification) =>
            notificationIds.includes(notification.id) && !notification.is_read
        ).length;
        return Math.max(0, prevCount - deletedUnread);
      });
    } catch (error: any) {
      console.error('Failed to delete multiple notifications:', error);
    }
  };

  const getNotificationStats = (): NotificationStats => {
    return {
      total: totalCount,
      unread: unreadCount,
    };
  };

  const refetch = useCallback(async () => {
    await fetchNotifications();
  }, []);

  const value: EnhancedNotificationContextType = {
    notifications,
    unreadCount,
    totalCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    filterNotifications,
    searchNotifications,
    enableRealtime,
    disableRealtime,
    markMultipleAsRead,
    deleteMultiple,
    getNotificationStats,
    refetch,
  };

  return (
    <EnhancedNotificationContext.Provider value={value}>
      {children}
    </EnhancedNotificationContext.Provider>
  );
};

const useEnhancedNotificationContext = () => {
  const context = useContext(EnhancedNotificationContext);
  if (!context) {
    throw new Error(
      'useEnhancedNotificationContext must be used within a EnhancedNotificationProvider'
    );
  }
  return context;
};

export { EnhancedNotificationProvider, useEnhancedNotificationContext };
