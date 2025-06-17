
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { toast } from 'sonner';
import { AppNotification, NotificationType, NotificationPriority } from '@/types/notification';

export const useEnhancedNotifications = () => {
  const user = useAuthStore(selectUser);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const processedNotifications: AppNotification[] = data?.map(notification => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        description: notification.message,
        type: (notification.type === 'success' || notification.type === 'warning' || 
               notification.type === 'error' || notification.type === 'info' || notification.type === 'deadline') 
               ? notification.type as NotificationType : 'info',
        priority: (notification.priority === 'low' || notification.priority === 'normal' || 
                   notification.priority === 'high' || notification.priority === 'critical')
                   ? notification.priority as NotificationPriority : 'normal',
        isRead: notification.is_read,
        is_read: notification.is_read,
        createdAt: notification.created_at,
        created_at: notification.created_at,
        date: notification.created_at,
        relatedEntityId: notification.related_entity_id,
        relatedEntityType: notification.related_entity_type,
        reference_id: notification.related_entity_id,
        reference_type: notification.related_entity_type,
      })) || [];

      setNotifications(processedNotifications);
      setUnreadCount(processedNotifications.filter(n => !n.is_read).length);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      toast.error('Bildiriş oxundu olaraq işarələnərkən xəta baş verdi');
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true, isRead: true })));
      setUnreadCount(0);
      toast.success('Bütün bildirişlər oxundu olaraq işarələndi');
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
      toast.error('Bildirişlər işarələnərkən xəta baş verdi');
    }
  }, [user]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Bildiriş silindi');
    } catch (err: any) {
      console.error('Error deleting notification:', err);
      toast.error('Bildiriş silinərkən xəta baş verdi');
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
  };
};
