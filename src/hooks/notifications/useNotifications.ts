
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/hooks/auth/useAuthStore';

export interface NotificationData {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message?: string;
  is_read: boolean;
  priority: string;
  created_at: string;
  related_entity_type?: string;
  related_entity_id?: string;
}

export interface UseNotificationsResult {
  notifications: NotificationData[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useNotifications = (userId?: string): UseNotificationsResult => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const user = useAuthStore((state) => state.user);
  const targetUserId = userId || user?.id;

  const fetchNotifications = async () => {
    if (!targetUserId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      setNotifications(data || []);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.message);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

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
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      setError(err.message);
    }
  };

  const markAllAsRead = async () => {
    if (!targetUserId) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', targetUserId)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, is_read: true }))
      );
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
      setError(err.message);
    }
  };

  const clearAll = async () => {
    if (!targetUserId) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', targetUserId);

      if (error) throw error;

      setNotifications([]);
    } catch (err: any) {
      console.error('Error clearing notifications:', err);
      setError(err.message);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      );
    } catch (err: any) {
      console.error('Error deleting notification:', err);
      setError(err.message);
    }
  };

  const refetch = async () => {
    await fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
  }, [targetUserId]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    clearAll,
    deleteNotification,
    refetch,
  };
};
