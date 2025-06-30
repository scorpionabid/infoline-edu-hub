import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth/useAuth';
import type { Notification, UseNotificationsResult } from '@/types/notifications';

export const useNotifications = (): UseNotificationsResult => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch notifications from Supabase
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      setNotifications(data || []);
      console.log(`[useNotifications] Loaded ${data?.length || 0} notifications for user ${user.id}`);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Mark single notification as read
  const markAsRead = useCallback(async (id: string) => {
    if (!user?.id) return;

    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Optimistically update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );

      console.log(`[useNotifications] Marked notification ${id} as read`);
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError(err as Error);
    }
  }, [user?.id]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (updateError) throw updateError;

      // Optimistically update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );

      console.log(`[useNotifications] Marked all notifications as read for user ${user.id}`);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError(err as Error);
    }
  }, [user?.id]);

  // Remove single notification
  const removeNotification = useCallback(async (id: string) => {
    if (!user?.id) return;

    try {
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Optimistically update local state
      setNotifications(prev => prev.filter(notif => notif.id !== id));

      console.log(`[useNotifications] Removed notification ${id}`);
    } catch (err) {
      console.error('Error removing notification:', err);
      setError(err as Error);
    }
  }, [user?.id]);

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      setNotifications([]);
      console.log(`[useNotifications] Cleared all notifications for user ${user.id}`);
    } catch (err) {
      console.error('Error clearing all notifications:', err);
      setError(err as Error);
    }
  }, [user?.id]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    console.log('[useNotifications] Setting up real-time subscription for user:', user.id);

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('[useNotifications] Real-time event:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              setNotifications(prev => [payload.new as Notification, ...prev]);
              break;
            case 'UPDATE':
              setNotifications(prev => 
                prev.map(notif => 
                  notif.id === payload.new.id ? payload.new as Notification : notif
                )
              );
              break;
            case 'DELETE':
              setNotifications(prev => 
                prev.filter(notif => notif.id !== payload.old.id)
              );
              break;
          }
        }
      )
      .subscribe();

    return () => {
      console.log('[useNotifications] Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Initial fetch when user changes
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    refetch: fetchNotifications
  };
};