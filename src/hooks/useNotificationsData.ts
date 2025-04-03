
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/notification';
import { useAuth } from '@/context/AuthContext';

export const useNotificationsData = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  // Bildirişləri gətirmək
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Supabase-dən gələn məlumatları uyğunlaşdırmaq
      const adaptedNotifications: Notification[] = data.map((item) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        message: item.message,
        priority: item.priority,
        userId: item.user_id,
        createdAt: item.created_at,
        isRead: item.is_read,
        time: item.created_at,
        read_status: item.is_read,
        relatedEntityId: item.related_entity_id,
        relatedEntityType: item.related_entity_type
      }));

      setNotifications(adaptedNotifications);
      const unread = adaptedNotifications.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err: any) {
      console.error('Bildirişləri gətirərkən xəta:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Bildirişi oxunmuş kimi işarələmək
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Lokal vəziyyəti yeniləyin
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true, read_status: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Bildirişi oxunmuş kimi işarələyərkən xəta:', err);
      setError(err);
    }
  }, [user]);

  // Bütün bildirişləri oxunmuş kimi işarələmək
  const markAllAsRead = useCallback(async () => {
    if (!user?.id || unreadCount === 0) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      // Lokal vəziyyəti yeniləyin
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read_status: true })));
      setUnreadCount(0);
    } catch (err: any) {
      console.error('Bütün bildirişləri oxunmuş kimi işarələyərkən xəta:', err);
      setError(err);
    }
  }, [user, unreadCount]);

  // Bildirişi silmək
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      console.error('Bildirişi silməkdə xəta:', err);
      setError(err);
    }
  }, [user, notifications]);

  // Bütün bildirişləri silmək
  const deleteAllNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications([]);
      setUnreadCount(0);
    } catch (err: any) {
      console.error('Bütün bildirişləri silməkdə xəta:', err);
      setError(err);
    }
  }, [user]);

  // İlk yüklənmədə və istifadəçi dəyişdikdə bildirişləri gətir
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  // Bildirişlərə real vaxtda abunə olmaq
  useEffect(() => {
    if (!user?.id) return;

    const subscription = supabase
      .channel('notification_updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, 
        () => {
          fetchNotifications();
        })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
  };
};
