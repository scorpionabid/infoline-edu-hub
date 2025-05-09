
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { AppNotification } from '@/types/notification';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  error: Error | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  addNotification: (notification: Partial<AppNotification>) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const initialState: NotificationContextType = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  clearAll: async () => {},
  addNotification: async () => {},
  refreshNotifications: async () => {}
};

export const NotificationContext = createContext<NotificationContextType>(initialState);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { user, isAuthenticated } = useAuthStore();

  // Function to fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;

    setLoading(true);
    try {
      // Mock data for now - replace with actual API call
      const mockNotifications: AppNotification[] = [
        {
          id: '1',
          title: 'System Update',
          message: 'System has been updated successfully',
          type: 'info',
          isRead: false,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Approval Required',
          message: 'New form submission requires your approval',
          type: 'approval',
          isRead: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
    } catch (err) {
      console.error('Error fetching notifications', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch notifications'));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  // Initial fetch of notifications
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchNotifications();
    }
  }, [isAuthenticated, user?.id, fetchNotifications]);

  // Mark a single notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      // Mock implementation - replace with actual API call
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read', err);
      toast.error('Failed to mark notification as read');
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // Mock implementation - replace with actual API call
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read', err);
      toast.error('Failed to mark all notifications as read');
    }
  };

  // Clear all notifications
  const clearAll = async () => {
    try {
      // Mock implementation - replace with actual API call
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Error clearing notifications', err);
      toast.error('Failed to clear notifications');
    }
  };

  // Add a new notification
  const addNotification = async (notification: Partial<AppNotification>) => {
    if (!notification.title || !notification.message) {
      console.error('Notification must include title and message');
      return;
    }

    try {
      const newNotification: AppNotification = {
        id: Math.random().toString(36).substring(2, 11),
        title: notification.title,
        message: notification.message,
        type: notification.type || 'info',
        isRead: false,
        createdAt: new Date().toISOString(),
        priority: notification.priority || 'normal',
        relatedEntityId: notification.relatedEntityId,
        relatedEntityType: notification.relatedEntityType
      };

      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show toast for new notification
      toast[notification.type || 'info'](notification.title, {
        description: notification.message,
        duration: 5000
      });
    } catch (err) {
      console.error('Error adding notification', err);
    }
  };

  // Refresh notifications
  const refreshNotifications = async () => {
    await fetchNotifications();
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    clearAll,
    addNotification,
    refreshNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
