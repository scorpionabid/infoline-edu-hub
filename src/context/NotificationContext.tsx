
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/auth/useAuth';
import { AppNotification, adaptDashboardNotificationToApp, adaptNotificationForDatabase } from '@/types/notification';

// Context type definition
interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  addNotification: (notification: Partial<AppNotification>) => void;
  deleteNotification: (id: string) => void;
  isLoading: boolean;
  error: Error | null;
}

// Create the notification context
const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearAll: () => {},
  addNotification: () => {},
  deleteNotification: () => {},
  isLoading: false,
  error: null,
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  
  // Fetch notifications from Supabase
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        throw new Error(fetchError.message);
      }
      
      // Convert DB notification format to app format
      const appNotifications = data.map(adaptDashboardNotificationToApp);
      
      setNotifications(appNotifications);
      setUnreadCount(appNotifications.filter(n => !(n.isRead || n.is_read)).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError(error instanceof Error ? error : new Error('Unknown error fetching notifications'));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);
  
  // Fetch notifications when user changes
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);
  
  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    if (!user?.id) return;
    
    try {
      // Update locally first for immediate UI feedback
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Update in the database
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [user?.id]);
  
  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.id || notifications.length === 0) return;
    
    try {
      // Update locally first
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, is_read: true })));
      setUnreadCount(0);
      
      // Update in the database
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .in('id', notifications.map(n => n.id));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [user?.id, notifications]);
  
  // Clear all notifications
  const clearAll = useCallback(async () => {
    if (!user?.id || notifications.length === 0) return;
    
    try {
      setNotifications([]);
      setUnreadCount(0);
      
      // Delete from the database
      await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id)
        .in('id', notifications.map(n => n.id));
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }, [user?.id, notifications]);
  
  // Add a new notification
  const addNotification = useCallback(async (notification: Partial<AppNotification>) => {
    if (!user?.id) return;
    
    try {
      const now = new Date().toISOString();
      const newNotification: AppNotification = {
        id: crypto.randomUUID(),
        title: notification.title || 'Notification',
        message: notification.message || '',
        type: notification.type || 'info',
        isRead: false,
        is_read: false,
        createdAt: now,
        timestamp: now,
        priority: notification.priority || 'normal',
        user_id: user.id,
        ...notification
      };
      
      // Add locally first
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Add to the database
      await supabase
        .from('notifications')
        .insert(adaptNotificationForDatabase(newNotification));
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  }, [user?.id]);
  
  // Delete a notification
  const deleteNotification = useCallback(async (id: string) => {
    if (!user?.id) return;
    
    try {
      // Delete locally first
      setNotifications(prev => prev.filter(n => n.id !== id));
      const wasUnread = notifications.find(n => n.id === id && !(n.isRead || n.is_read));
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      // Delete from the database
      await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [user?.id, notifications]);
  
  // Value object for the context
  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    addNotification,
    deleteNotification,
    isLoading,
    error
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
