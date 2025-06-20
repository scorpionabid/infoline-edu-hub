
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { UnifiedNotification } from '@/notifications/core/types';

export interface UseUnifiedNotificationsResult {
  notifications: UnifiedNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAll: () => void;
  refetch: () => void;
}

export const useUnifiedNotifications = (userId?: string): UseUnifiedNotificationsResult => {
  const user = useAuthStore(selectUser);
  const targetUserId = userId || user?.id;
  
  const [notifications, setNotifications] = useState<UnifiedNotification[]>([]);
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

      setNotifications(data || []);
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
            setNotifications(prev => [payload.new as UnifiedNotification, ...prev]);
            
            // Show toast for new notifications
            const newNotification = payload.new as UnifiedNotification;
            if (newNotification.priority === 'high' || newNotification.priority === 'critical') {
              toast.info(newNotification.title, {
                description: newNotification.message,
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            setNotifications(prev => 
              prev.map(notif => 
                notif.id === payload.new.id ? payload.new as UnifiedNotification : notif
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
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
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
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
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

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', targetUserId);

      if (error) throw error;

      setNotifications(prev => 
        prev.filter(notif => notif.id !== notificationId)
      );

      toast.success('Bildiriş silindi');
    } catch (err) {
      console.error('Error deleting notification:', err);
      toast.error('Bildiriş silinərkən xəta baş verdi');
    }
  }, [targetUserId]);

  // Clear all notifications
  const clearAll = useCallback(async () => {
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
    deleteNotification,
    clearAll,
    refetch: fetchNotifications
  };
};

export default useUnifiedNotifications;
