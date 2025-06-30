import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Notification } from '@/types/notifications';

interface UseNotificationSubscriptionProps {
  userId: string;
  onNotificationReceived?: (notification: Notification) => void;
  onNotificationUpdated?: (notification: Notification) => void;
  onNotificationDeleted?: (notificationId: string) => void;
}

/**
 * Real-time notification subscription hook
 * Ayrıca real-time functionality üçün
 */
export const useNotificationSubscription = ({
  userId,
  onNotificationReceived,
  onNotificationUpdated,
  onNotificationDeleted
}: UseNotificationSubscriptionProps) => {
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!userId) return;

    console.log('[useNotificationSubscription] Setting up subscription for user:', userId);

    // Create realtime channel
    channelRef.current = supabase
      .channel(`user_notifications_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('[useNotificationSubscription] New notification:', payload.new);
          onNotificationReceived?.(payload.new as Notification);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('[useNotificationSubscription] Updated notification:', payload.new);
          onNotificationUpdated?.(payload.new as Notification);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('[useNotificationSubscription] Deleted notification:', payload.old);
          onNotificationDeleted?.(payload.old.id);
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      if (channelRef.current) {
        console.log('[useNotificationSubscription] Cleaning up subscription');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId, onNotificationReceived, onNotificationUpdated, onNotificationDeleted]);

  // Return channel status
  return {
    isConnected: channelRef.current?.state === 'joined',
    disconnect: () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    }
  };
};