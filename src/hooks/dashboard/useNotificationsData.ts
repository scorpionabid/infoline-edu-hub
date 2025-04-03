
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/notification';

interface UseNotificationsDataReturn {
  notifications: Notification[];
  fetchNotifications: (userId: string) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export const useNotificationsData = (): UseNotificationsDataReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchNotifications = useCallback(async (userId: string) => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Supabase formasından bizə lazım olan formata uyğunlaşdırmaq
      const adaptedNotifications: Notification[] = data.map((item) => ({
        id: item.id,
        type: item.type as any, // TypeScript ilə uyğunlaşdırmaq üçün
        title: item.title,
        message: item.message,
        priority: item.priority as any,
        userId: item.user_id,
        createdAt: item.created_at,
        isRead: item.is_read,
        time: item.created_at,
        relatedEntityId: item.related_entity_id,
        relatedEntityType: item.related_entity_type,
        read_status: item.is_read ? 'read' : 'unread' // Çevirmə
      }));

      setNotifications(adaptedNotifications);
    } catch (err: any) {
      console.error('Bildirişləri əldə edərkən xəta:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      // Lokal vəziyyəti yeniləyin
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isRead: true, read_status: 'read' } : n
        )
      );
    } catch (err: any) {
      console.error('Bildirişi oxunmuş kimi qeyd edərkən xəta:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', notifications.filter(n => !n.isRead).map(n => n.id));

      if (error) throw error;

      // Lokal vəziyyəti yeniləyin
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true, read_status: 'read' }))
      );
    } catch (err: any) {
      console.error('Bütün bildirişləri oxunmuş kimi qeyd edərkən xəta:', err);
    }
  }, [notifications]);

  return {
    notifications,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    isLoading,
    error
  };
};
