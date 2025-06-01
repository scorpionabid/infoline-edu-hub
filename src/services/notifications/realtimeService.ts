import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { AppNotification } from '@/types/notification';

export interface RealtimeSubscription {
  channel: RealtimeChannel;
  unsubscribe: () => void;
}

export interface ConnectionStatus {
  isConnected: boolean;
  status: string;
  lastReconnectAttempt?: number;
  reconnectCount: number;
}

export interface NotificationUpdatePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: any;
  old: any;
  table: string;
}

/**
 * Enhanced Real-time Notification Service
 * Provides robust real-time notifications with reconnection logic and error handling
 */
export class RealtimeNotificationService {
  
  private static channels: Map<string, RealtimeChannel> = new Map();
  private static connectionStatus: ConnectionStatus = {
    isConnected: false,
    status: 'DISCONNECTED',
    reconnectCount: 0
  };
  private static reconnectTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private static maxReconnectAttempts = 5;
  private static baseReconnectDelay = 1000; // 1 second

  /**
   * Setup real-time notifications for a specific user
   */
  static setupRealtimeNotifications(
    userId: string,
    onNotificationUpdate: (notification: AppNotification) => void,
    onConnectionStatusChange?: (status: ConnectionStatus) => void
  ): RealtimeSubscription {
    
    const channelId = `notifications-${userId}`;
    
    // Remove existing channel if any
    this.removeChannel(channelId);
    
    // Create new channel
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          this.handleNotificationChange(payload, onNotificationUpdate);
        }
      )
      .subscribe((status) => {
        this.updateConnectionStatus(status, channelId, onConnectionStatusChange);
      });

    // Store channel reference
    this.channels.set(channelId, channel);

    return {
      channel,
      unsubscribe: () => this.removeChannel(channelId)
    };
  }

  /**
   * Broadcast notification to multiple users
   */
  static async broadcastNotification(notification: AppNotification, userIds: string[]): Promise<void> {
    try {
      // Notifications are automatically broadcasted via database triggers
      // This method can be used for additional custom broadcasting if needed
      console.log(`Broadcasting notification to ${userIds.length} users:`, notification.title);
      
      // Optional: Send custom real-time event
      for (const userId of userIds) {
        const channelId = `notifications-${userId}`;
        const channel = this.channels.get(channelId);
        
        if (channel) {
          await channel.send({
            type: 'broadcast',
            event: 'notification_created',
            payload: notification
          });
        }
      }
    } catch (error) {
      console.error('Error broadcasting notification:', error);
    }
  }

  /**
   * Get current connection status
   */
  static getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  /**
   * Force reconnection for all channels
   */
  static async reconnect(): Promise<void> {
    try {
      console.log('Force reconnecting all real-time channels...');
      
      // Increment reconnect count
      this.connectionStatus.reconnectCount++;
      this.connectionStatus.lastReconnectAttempt = Date.now();
      
      // Remove all existing channels
      const channelIds = Array.from(this.channels.keys());
      for (const channelId of channelIds) {
        this.removeChannel(channelId);
      }
      
      // Clear reconnect timeouts
      this.reconnectTimeouts.forEach((timeout) => {
        clearTimeout(timeout);
      });
      this.reconnectTimeouts.clear();
      
      // Update status
      this.connectionStatus.status = 'RECONNECTING';
      this.connectionStatus.isConnected = false;
      
      console.log('Real-time channels cleared for reconnection');
    } catch (error) {
      console.error('Error during reconnection:', error);
    }
  }

  /**
   * Setup real-time updates for data entries (for admin users)
   */
  static setupDataEntryRealtime(
    schoolId: string,
    onDataEntryUpdate: (payload: NotificationUpdatePayload) => void
  ): RealtimeSubscription {
    
    const channelId = `data-entries-${schoolId}`;
    
    // Remove existing channel if any
    this.removeChannel(channelId);
    
    // Create new channel with debouncing
    let updateTimeout: NodeJS.Timeout | null = null;
    
    const debouncedUpdate = (payload: RealtimePostgresChangesPayload<any>) => {
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
      
      updateTimeout = setTimeout(() => {
        onDataEntryUpdate({
          eventType: payload.eventType,
          new: payload.new,
          old: payload.old,
          table: 'data_entries'
        });
        updateTimeout = null;
      }, 300); // 300ms debounce
    };
    
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'data_entries',
          filter: `school_id=eq.${schoolId}`
        },
        debouncedUpdate
      )
      .subscribe((status) => {
        console.log(`Data entry real-time status for school ${schoolId}:`, status);
      });

    this.channels.set(channelId, channel);

    return {
      channel,
      unsubscribe: () => {
        if (updateTimeout) {
          clearTimeout(updateTimeout);
        }
        this.removeChannel(channelId);
      }
    };
  }

  /**
   * Setup real-time updates for approval status changes
   */
  static setupApprovalRealtime(
    onApprovalUpdate: (payload: NotificationUpdatePayload) => void,
    userRole?: string,
    regionId?: string,
    sectorId?: string
  ): RealtimeSubscription {
    
    const channelId = `approvals-${userRole || 'admin'}`;
    
    // Remove existing channel if any
    this.removeChannel(channelId);
    
    // Create new channel with smart filtering
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'data_entries'
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          // Only trigger on status changes
          if (payload.old?.status !== payload.new?.status) {
            // Additional filtering based on user role and permissions
            if (this.shouldReceiveApprovalUpdate(payload, userRole, regionId, sectorId)) {
              onApprovalUpdate({
                eventType: payload.eventType,
                new: payload.new,
                old: payload.old,
                table: 'data_entries'
              });
            }
          }
        }
      )
      .subscribe((status) => {
        console.log(`Approval real-time status:`, status);
      });

    this.channels.set(channelId, channel);

    return {
      channel,
      unsubscribe: () => this.removeChannel(channelId)
    };
  }

  /**
   * Handle notification changes with enhanced error handling
   */
  private static handleNotificationChange(
    payload: RealtimePostgresChangesPayload<any>,
    onNotificationUpdate: (notification: AppNotification) => void
  ): void {
    try {
      console.log('Real-time notification change:', payload.eventType, payload.new?.title);
      
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const notification: AppNotification = {
          id: payload.new.id,
          title: payload.new.title,
          message: payload.new.message,
          type: payload.new.type,
          priority: payload.new.priority,
          isRead: payload.new.is_read,
          is_read: payload.new.is_read,
          createdAt: payload.new.created_at,
          timestamp: payload.new.created_at,
          relatedEntityId: payload.new.related_entity_id,
          relatedEntityType: payload.new.related_entity_type,
          user_id: payload.new.user_id
        };
        
        onNotificationUpdate(notification);
      }
    } catch (error) {
      console.error('Error handling notification change:', error);
    }
  }

  /**
   * Update connection status and handle reconnection
   */
  private static updateConnectionStatus(
    status: string,
    channelId: string,
    onConnectionStatusChange?: (status: ConnectionStatus) => void
  ): void {
    const wasConnected = this.connectionStatus.isConnected;
    
    this.connectionStatus.status = status;
    this.connectionStatus.isConnected = status === 'SUBSCRIBED';
    
    console.log(`Real-time connection status for ${channelId}:`, status);
    
    // Notify about status change
    if (onConnectionStatusChange) {
      onConnectionStatusChange({ ...this.connectionStatus });
    }
    
    // Handle reconnection logic
    if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
      this.handleReconnection(channelId);
    } else if (status === 'SUBSCRIBED' && !wasConnected) {
      // Reset reconnect count on successful connection
      this.connectionStatus.reconnectCount = 0;
      
      // Clear any pending reconnection timeout for this channel
      const timeout = this.reconnectTimeouts.get(channelId);
      if (timeout) {
        clearTimeout(timeout);
        this.reconnectTimeouts.delete(channelId);
      }
    }
  }

  /**
   * Handle reconnection with exponential backoff
   */
  private static handleReconnection(channelId: string): void {
    // Don't reconnect if we've exceeded max attempts
    if (this.connectionStatus.reconnectCount >= this.maxReconnectAttempts) {
      console.warn(`Max reconnection attempts reached for ${channelId}`);
      return;
    }
    
    // Clear existing timeout for this channel
    const existingTimeout = this.reconnectTimeouts.get(channelId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    // Calculate delay with exponential backoff
    const delay = this.baseReconnectDelay * Math.pow(2, this.connectionStatus.reconnectCount);
    const maxDelay = 30000; // 30 seconds max
    const finalDelay = Math.min(delay, maxDelay);
    
    console.log(`Scheduling reconnection for ${channelId} in ${finalDelay}ms (attempt ${this.connectionStatus.reconnectCount + 1})`);
    
    const timeout = setTimeout(() => {
      this.connectionStatus.reconnectCount++;
      this.connectionStatus.lastReconnectAttempt = Date.now();
      
      // Remove the channel and let the calling code recreate it
      this.removeChannel(channelId);
      
      // The channel will be recreated by the calling code
      console.log(`Reconnection timeout executed for ${channelId}`);
      
      this.reconnectTimeouts.delete(channelId);
    }, finalDelay);
    
    this.reconnectTimeouts.set(channelId, timeout);
  }

  /**
   * Remove a specific channel
   */
  private static removeChannel(channelId: string): void {
    const channel = this.channels.get(channelId);
    if (channel) {
      try {
        supabase.removeChannel(channel);
        this.channels.delete(channelId);
        console.log(`Removed real-time channel: ${channelId}`);
      } catch (error) {
        console.warn(`Error removing channel ${channelId}:`, error);
      }
    }
    
    // Clear any pending timeout
    const timeout = this.reconnectTimeouts.get(channelId);
    if (timeout) {
      clearTimeout(timeout);
      this.reconnectTimeouts.delete(channelId);
    }
  }

  /**
   * Check if user should receive approval update based on role and permissions
   */
  private static shouldReceiveApprovalUpdate(
    payload: RealtimePostgresChangesPayload<any>,
    userRole?: string,
    regionId?: string,
    sectorId?: string
  ): boolean {
    // SuperAdmin receives all updates
    if (userRole === 'superadmin') {
      return true;
    }
    
    // For role-based filtering, you would need to join with schools table
    // For now, return true for all admin roles
    if (userRole && ['regionadmin', 'sectoradmin'].includes(userRole)) {
      return true;
    }
    
    return false;
  }

  /**
   * Get real-time statistics
   */
  static getRealTimeStatistics(): any {
    return {
      activeChannels: this.channels.size,
      connectionStatus: this.connectionStatus,
      channels: Array.from(this.channels.keys())
    };
  }

  /**
   * Cleanup all channels (call on app unmount)
   */
  static cleanup(): void {
    console.log('Cleaning up all real-time channels...');
    
    // Clear all timeouts
    this.reconnectTimeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });
    this.reconnectTimeouts.clear();
    
    // Remove all channels
    const channelIds = Array.from(this.channels.keys());
    for (const channelId of channelIds) {
      this.removeChannel(channelId);
    }
    
    // Reset connection status
    this.connectionStatus = {
      isConnected: false,
      status: 'DISCONNECTED',
      reconnectCount: 0
    };
    
    console.log('Real-time service cleanup completed');
  }
}

export default RealtimeNotificationService;
