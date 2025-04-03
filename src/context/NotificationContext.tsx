
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Notification, NotificationType } from '@/types/notification'; // Düzəliş burada

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAllAsRead: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  getNotificationsByType: (type: NotificationType) => Notification[];
  loadNotifications: () => Promise<void>;
  loading: boolean;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAllAsRead: async () => {},
  markAsRead: async () => {},
  getNotificationsByType: () => [],
  loadNotifications: async () => {},
  loading: false,
});

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useAuth();

  const loadNotifications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedNotifications: Notification[] = data.map(notification => ({
        id: notification.id,
        type: notification.type as NotificationType,
        title: notification.title,
        message: notification.message,
        userId: notification.user_id,
        priority: notification.priority,
        relatedEntityId: notification.related_entity_id,
        relatedEntityType: notification.related_entity_type,
        createdAt: notification.created_at,
        isRead: notification.is_read,
        read_status: notification.is_read, // Supabase uyğunluğu üçün əlavə edildi
        time: new Date(notification.created_at).toLocaleTimeString()
      }));

      setNotifications(formattedNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();

      // Real-time bildirişlər üçün abunə
      const subscription = supabase
        .channel('public:notifications')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          const newNotification: Notification = {
            id: payload.new.id,
            type: payload.new.type as NotificationType,
            title: payload.new.title,
            message: payload.new.message,
            userId: payload.new.user_id,
            priority: payload.new.priority,
            relatedEntityId: payload.new.related_entity_id,
            relatedEntityType: payload.new.related_entity_type,
            createdAt: payload.new.created_at,
            isRead: payload.new.is_read,
            read_status: payload.new.is_read, // Supabase uyğunluğu üçün əlavə edildi
            time: new Date(payload.new.created_at).toLocaleTimeString()
          };
          setNotifications(prev => [newNotification, ...prev]);
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true, read_status: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true, read_status: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationsByType = (type: NotificationType) => {
    return notifications.filter(notification => notification.type === type);
  };

  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAllAsRead,
        markAsRead,
        getNotificationsByType,
        loadNotifications,
        loading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
