
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { supabase } from '@/integrations/supabase/client';
import { AppNotification } from '@/types/notification';
import { toast } from 'sonner';

export interface UseNotificationsResult {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  refetch: () => void;
}

export const useNotifications = (userId?: string): UseNotificationsResult => {
  const user = useAuthStore(selectUser);
  const targetUserId = userId || user?.id;
  
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch notifications from database
  const fetchNotifications = useCallback(async () => {
    if (!targetUserId) return;

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

      // Map database format to AppNotification format
      const mappedNotifications: AppNotification[] = (data || []).map(notification => ({
        id: notification.id,
        title: notification.title,
        message: notification.message || '',
        type: notification.type,
        priority: notification.priority as 'low' | 'normal' | 'high',
        created_at: notification.created_at,
        createdAt: notification.created_at, // Backward compatibility
        is_read: notification.is_read,
        user_id: notification.user_id
      }));

      setNotifications(mappedNotifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err as Error);
      toast.error('Bildirişlər yüklənərkən xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  }, [targetUserId]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Set up real-time updates
  useEffect(() => {
    if (!targetUserId) return;

    const channel = supabase
      .channel(`notifications-${targetUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${targetUserId}`
        },
        (payload) => {
          console.log('Real-time notification update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newNotification: AppNotification = {
              id: payload.new.id,
              title: payload.new.title,
              message: payload.new.message || '',
              type: payload.new.type,
              priority: payload.new.priority,
              created_at: payload.new.created_at,
              createdAt: payload.new.created_at,
              is_read: payload.new.is_read,
              user_id: payload.new.user_id
            };
            
            setNotifications(prev => [newNotification, ...prev]);
            
            // Show toast for high priority notifications
            if (newNotification.priority === 'high') {
              toast.info(newNotification.title, {
                description: newNotification.message,
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            setNotifications(prev => 
              prev.map(notif => 
                notif.id === payload.new.id 
                  ? { ...notif, is_read: payload.new.is_read }
                  : notif
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setNotifications(prev => 
              prev.filter(notif => notif.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [targetUserId]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!targetUserId) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', targetUserId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      toast.error('Bildiriş oxunmuş kimi işarələnərkən xəta baş verdi');
    }
  }, [targetUserId]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!targetUserId) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', targetUserId)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );

      toast.success('Bütün bildirişlər oxunmuş kimi işarələndi');
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      toast.error('Bildirişləri oxunmuş kimi işarələrkən xəta baş verdi');
    }
  }, [targetUserId]);

  // Clear all notifications
  const clearAll = useCallback(async () => {
    if (!targetUserId) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', targetUserId);

      if (error) throw error;

      setNotifications([]);
      toast.success('Bütün bildirişlər təmizləndi');
    } catch (err) {
      console.error('Error clearing notifications:', err);
      toast.error('Bildirişləri təmizlərkən xəta baş verdi');
    }
  }, [targetUserId]);

  const unreadCount = notifications.filter(notif => !notif.is_read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    clearAll,
    refetch: fetchNotifications
  };
};

export default useNotifications;
