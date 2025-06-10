
import { supabase } from '@/integrations/supabase/client';

export interface ConnectionStatus {
  isConnected: boolean;
  reconnectCount: number;
  lastReconnectAttempt: number;
}

export class RealtimeNotificationService {
  private static connectionStatus: ConnectionStatus = {
    isConnected: false,
    reconnectCount: 0,
    lastReconnectAttempt: 0
  };

  private static subscriptions = new Map();

  static setupRealtimeNotifications(userId: string, onNotification: (notification: any) => void) {
    try {
      const channel = supabase
        .channel(`notifications-${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          onNotification
        )
        .subscribe((status) => {
          this.connectionStatus.isConnected = status === 'SUBSCRIBED';
          console.log('Notification channel status:', status);
        });

      this.subscriptions.set(userId, channel);
      
      return {
        unsubscribe: () => {
          const existingChannel = this.subscriptions.get(userId);
          if (existingChannel) {
            supabase.removeChannel(existingChannel);
            this.subscriptions.delete(userId);
          }
          this.connectionStatus.isConnected = false;
        }
      };
    } catch (error) {
      console.error('Error setting up real-time notifications:', error);
      return {
        unsubscribe: () => {}
      };
    }
  }

  static async reconnect() {
    this.connectionStatus.reconnectCount++;
    this.connectionStatus.lastReconnectAttempt = Date.now();
    
    // Attempt to reconnect existing subscriptions
    for (const [userId, channel] of this.subscriptions.entries()) {
      try {
        await channel.subscribe();
        this.connectionStatus.isConnected = true;
      } catch (error) {
        console.error('Error reconnecting notification channel:', error);
      }
    }
  }

  static getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }
}
