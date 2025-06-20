
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { 
  UnifiedNotification, 
  NotificationManagerConfig, 
  BulkNotificationRequest,
  NotificationAnalytics,
  DEFAULT_NOTIFICATION_CONFIG
} from './types';

export class UnifiedNotificationManager {
  private config: NotificationManagerConfig;
  private cache: Map<string, UnifiedNotification[]> = new Map();
  private subscribers: Map<string, ((notifications: UnifiedNotification[]) => void)[]> = new Map();

  constructor(config?: Partial<NotificationManagerConfig>) {
    this.config = { ...DEFAULT_NOTIFICATION_CONFIG, ...config };
  }

  // Create a single notification
  async createNotification(notification: Omit<UnifiedNotification, 'id' | 'created_at'>): Promise<UnifiedNotification | null> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          ...notification,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Show toast for high priority notifications
      if (data.priority === 'high' || data.priority === 'critical') {
        toast.info(data.title, {
          description: data.message,
        });
      }

      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  // Get notifications for a user
  async getNotifications(userId: string, limit = 50): Promise<UnifiedNotification[]> {
    try {
      // Check cache first
      const cacheKey = `user_${userId}`;
      if (this.config.cacheNotifications && this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey)!;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Update cache
      if (this.config.cacheNotifications) {
        this.cache.set(cacheKey, data || []);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  // Clear all notifications for a user
  async clearAll(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      // Clear cache
      const cacheKey = `user_${userId}`;
      this.cache.delete(cacheKey);

      return true;
    } catch (error) {
      console.error('Error clearing notifications:', error);
      return false;
    }
  }

  // Create bulk notifications
  async createBulkNotifications(request: BulkNotificationRequest): Promise<boolean> {
    try {
      // This would need to be implemented based on your user/role filtering logic
      console.log('Bulk notifications not yet implemented:', request);
      return true;
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      return false;
    }
  }

  // Get analytics
  async getAnalytics(userId?: string): Promise<NotificationAnalytics | null> {
    try {
      // Basic analytics implementation
      const { data, error } = await supabase
        .from('notifications')
        .select('type, is_read')
        .eq(userId ? 'user_id' : 'user_id', userId || ''); // Simple filter

      if (error) throw error;

      const analytics: NotificationAnalytics = {
        total_sent: data?.length || 0,
        total_delivered: data?.length || 0,
        total_read: data?.filter(n => n.is_read).length || 0,
        total_failed: 0,
        by_type: {} as any,
        by_channel: {} as any,
        by_priority: {} as any,
        daily_stats: [],
        average_delivery_time: 0,
        average_read_time: 0,
        bounce_rate: 0,
        engagement_rate: 0
      };

      return analytics;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return null;
    }
  }

  // Subscribe to real-time updates
  subscribeToUpdates(userId: string, callback: (notifications: UnifiedNotification[]) => void) {
    const subscribers = this.subscribers.get(userId) || [];
    subscribers.push(callback);
    this.subscribers.set(userId, subscribers);

    // Set up Supabase real-time subscription
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        async () => {
          // Refresh notifications when changes occur
          const notifications = await this.getNotifications(userId);
          callback(notifications);
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel);
      const updatedSubscribers = this.subscribers.get(userId)?.filter(cb => cb !== callback) || [];
      if (updatedSubscribers.length === 0) {
        this.subscribers.delete(userId);
      } else {
        this.subscribers.set(userId, updatedSubscribers);
      }
    };
  }

  // Clear cache
  clearCache(userId?: string) {
    if (userId) {
      this.cache.delete(`user_${userId}`);
    } else {
      this.cache.clear();
    }
  }
}

// Export a singleton instance
export const notificationManager = new UnifiedNotificationManager();

export default notificationManager;
