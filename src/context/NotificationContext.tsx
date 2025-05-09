import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './auth';
import { toast } from 'sonner';
import { AppNotification, adaptDbNotificationToApp } from '@/types/notification';

export type { AppNotification } from '@/types/notification';

// Explicitly export the type with a named export
export type { NotificationContextType };  
export type NotificationContextType = {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  error: Error | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  addNotification: (notification: Partial<AppNotification>) => Promise<void>;
  refreshNotifications: () => Promise<void>;
};

export const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  markAsRead: () => Promise.resolve(),
  markAllAsRead: () => Promise.resolve(),
  clearAll: () => Promise.resolve(),
  addNotification: () => Promise.resolve(),
  refreshNotifications: () => Promise.resolve(),
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const appNotifications = data?.map(adaptDbNotificationToApp) || [];
      setNotifications(appNotifications);
      setUnreadCount(appNotifications.filter(n => !n.isRead).length);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Set up realtime subscription for new notifications
    if (user?.id) {
      const subscription = supabase
        .channel('notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        }, () => {
          fetchNotifications();
        })
        .subscribe();
      
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user?.id]);

  const markAsRead = async (notificationId: string) => {
    try {
      // Update local state first
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Then update database
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      toast.error('Failed to update notification');
      // Revert on error
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    try {
      if (!user) return;
      
      // Update local state first
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      
      // Then update database
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id);
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
      toast.error('Failed to update notifications');
      // Revert on error
      fetchNotifications();
    }
  };

  const clearAll = async () => {
    try {
      if (!user) return;
      
      // Update local state first
      setNotifications([]);
      setUnreadCount(0);
      
      // Then update database
      await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);
    } catch (err: any) {
      console.error('Error clearing notifications:', err);
      toast.error('Failed to clear notifications');
      // Revert on error
      fetchNotifications();
    }
  };

  const addNotification = async (notification: Partial<AppNotification>) => {
    try {
      if (!user) return;
      
      const newNotification = {
        user_id: user.id,
        title: notification.title || 'New notification',
        message: notification.message || '',
        type: notification.type || 'info',
        is_read: false,
        created_at: new Date().toISOString(),
        priority: notification.priority || 'normal',
        related_entity_id: notification.relatedEntityId,
        related_entity_type: notification.relatedEntityType
      };
      
      const { data, error } = await supabase
        .from('notifications')
        .insert(newNotification)
        .select();
      
      if (error) throw error;
      
      // Refresh notifications
      await fetchNotifications();
    } catch (err: any) {
      console.error('Error adding notification:', err);
      toast.error('Failed to add notification');
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        clearAll,
        addNotification,
        refreshNotifications: fetchNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
