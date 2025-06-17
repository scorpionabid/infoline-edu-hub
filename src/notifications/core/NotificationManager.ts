/**
 * İnfoLine Unified Notification System - Main Manager
 * Bütün notification funksionallığını idarə edən əsas sinif
 */

import { supabase } from '@/integrations/supabase/client';
import { cacheManager, CACHE_TTL } from '@/cache';
import type { 
  UnifiedNotification,
  NotificationSettings,
  NotificationType,
  NotificationPriority,
  NotificationChannel,
  BulkNotificationRequest,
  NotificationAnalytics,
  NotificationEvent,
  NotificationManagerConfig,
  DEFAULT_NOTIFICATION_CONFIG,
  NotificationMetadata
} from './types';

export class UnifiedNotificationManager {
  private config: NotificationManagerConfig;
  private realtimeChannel?: any;
  private eventListeners = new Map<string, Set<(event: NotificationEvent) => void>>();
  private performanceMetrics = {
    operationsCount: 0,
    totalTime: 0,
    errors: 0
  };

  constructor(config: Partial<NotificationManagerConfig> = {}) {
    this.config = { ...DEFAULT_NOTIFICATION_CONFIG, ...config };
    
    if (this.config.enableRealTime) {
      this.initializeRealTime();
    }
    
    console.log('[NotificationManager] Initialized with config:', this.config);
  }

  /**
   * Initialize real-time notifications
   */
  private initializeRealTime(): void {
    try {
      this.realtimeChannel = supabase
        .channel(this.config.realtimeChannel)
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'notifications' 
          },
          (payload) => this.handleRealtimeEvent(payload)
        )
        .subscribe();
        
      console.log('[NotificationManager] Real-time notifications enabled');
    } catch (error) {
      console.error('[NotificationManager] Failed to initialize real-time:', error);
    }
  }

  /**
   * Handle real-time database events
   */
  private handleRealtimeEvent(payload: any): void {
    try {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      let event: NotificationEvent;
      
      switch (eventType) {
        case 'INSERT':
          event = {
            type: 'notification_created',
            notification: newRecord as UnifiedNotification,
            user_id: newRecord.user_id,
            timestamp: new Date().toISOString()
          };
          break;
          
        case 'UPDATE':
          event = {
            type: 'notification_updated',
            notification: newRecord as UnifiedNotification,
            user_id: newRecord.user_id,
            timestamp: new Date().toISOString()
          };
          break;
          
        case 'DELETE':
          event = {
            type: 'notification_deleted',
            notification: oldRecord as UnifiedNotification,
            user_id: oldRecord.user_id,
            timestamp: new Date().toISOString()
          };
          break;
          
        default:
          return;
      }
      
      this.emitEvent(event);
      
      // Invalidate cache
      if (this.config.cacheNotifications) {
        cacheManager.delete(`notifications_${event.user_id}`);
      }
      
    } catch (error) {
      console.error('[NotificationManager] Error handling real-time event:', error);
    }
  }

  /**
   * Emit event to listeners
   */
  private emitEvent(event: NotificationEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('[NotificationManager] Error in event listener:', error);
        }
      });
    }
  }

  /**
   * Track performance metrics
   */
  private trackPerformance(operation: string, startTime: number, success: boolean): void {
    if (!this.config.enablePerformanceTracking) return;
    
    const duration = Date.now() - startTime;
    this.performanceMetrics.operationsCount++;
    this.performanceMetrics.totalTime += duration;
    
    if (!success) {
      this.performanceMetrics.errors++;
    }
    
    if (this.config.enableDebug) {
      console.log(`[NotificationManager] ${operation} completed in ${duration}ms (success: ${success})`);
    }
  }

  /**
   * Get cache key for user notifications
   */
  private getCacheKey(userId: string, type?: 'all' | 'unread' | 'settings'): string {
    const suffix = type ? `_${type}` : '';
    return `notifications_${userId}${suffix}`;
  }

  // Public API Methods

  /**
   * Create a new notification
   */
  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = 'info',
    options: {
      priority?: NotificationPriority;
      channels?: NotificationChannel[];
      relatedEntityId?: string;
      relatedEntityType?: string;
      metadata?: NotificationMetadata;
      expiresAt?: string;
    } = {}
  ): Promise<UnifiedNotification | null> {
    const startTime = Date.now();
    
    try {
      const {
        priority = 'normal',
        channels = ['inApp'],
        relatedEntityId,
        relatedEntityType,
        metadata,
        expiresAt
      } = options;

      const notification: Partial<UnifiedNotification> = {
        user_id: userId,
        type,
        title,
        message,
        is_read: false,
        priority,
        channel: channels[0], // Primary channel
        related_entity_id: relatedEntityId,
        related_entity_type: relatedEntityType,
        metadata,
        expires_at: expiresAt
      };

      const { data, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single();

      if (error) throw error;

      // Cache invalidation
      if (this.config.cacheNotifications) {
        const cacheKey = this.getCacheKey(userId);
        cacheManager.delete(cacheKey);
        cacheManager.delete(`unread_count_${userId}`);
      }

      this.trackPerformance('createNotification', startTime, true);
      
      console.log(`[NotificationManager] Created notification for user ${userId}`);
      return data as UnifiedNotification;

    } catch (error) {
      console.error('[NotificationManager] Error creating notification:', error);
      this.trackPerformance('createNotification', startTime, false);
      return null;
    }
  }

  /**
   * Get notifications for a user
   */
  async getNotifications(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
      types?: NotificationType[];
      priorities?: NotificationPriority[];
      useCache?: boolean;
    } = {}
  ): Promise<UnifiedNotification[]> {
    const startTime = Date.now();
    
    try {
      const {
        limit = 50,
        offset = 0,
        unreadOnly = false,
        types,
        priorities,
        useCache = this.config.cacheNotifications
      } = options;

      // Try cache first
      if (useCache) {
        const cacheKey = this.getCacheKey(userId, unreadOnly ? 'unread' : 'all');
        const cached = cacheManager.get<UnifiedNotification[]>(cacheKey);
        if (cached) {
          this.trackPerformance('getNotifications', startTime, true);
          return cached.slice(offset, offset + limit);
        }
      }

      // Build query
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (unreadOnly) {
        query = query.eq('is_read', false);
      }

      if (types && types.length > 0) {
        query = query.in('type', types);
      }

      if (priorities && priorities.length > 0) {
        query = query.in('priority', priorities);
      }

      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) throw error;

      const notifications = data as UnifiedNotification[];

      // Cache the results
      if (useCache && offset === 0) {
        const cacheKey = this.getCacheKey(userId, unreadOnly ? 'unread' : 'all');
        cacheManager.set(cacheKey, notifications, {
          ttl: this.config.cacheExpiry,
          storage: 'memory'
        });
      }

      this.trackPerformance('getNotifications', startTime, true);
      return notifications;

    } catch (error) {
      console.error('[NotificationManager] Error fetching notifications:', error);
      this.trackPerformance('getNotifications', startTime, false);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) throw error;

      // Invalidate cache
      if (this.config.cacheNotifications) {
        cacheManager.delete(this.getCacheKey(userId));
        cacheManager.delete(this.getCacheKey(userId, 'unread'));
        cacheManager.delete(`unread_count_${userId}`);
      }

      this.trackPerformance('markAsRead', startTime, true);
      return true;

    } catch (error) {
      console.error('[NotificationManager] Error marking notification as read:', error);
      this.trackPerformance('markAsRead', startTime, false);
      return false;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<boolean> {
    const startTime = Date.now();
    
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

      // Invalidate cache
      if (this.config.cacheNotifications) {
        cacheManager.delete(this.getCacheKey(userId));
        cacheManager.delete(this.getCacheKey(userId, 'unread'));
        cacheManager.delete(`unread_count_${userId}`);
      }

      this.trackPerformance('markAllAsRead', startTime, true);
      return true;

    } catch (error) {
      console.error('[NotificationManager] Error marking all notifications as read:', error);
      this.trackPerformance('markAllAsRead', startTime, false);
      return false;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) throw error;

      // Invalidate cache
      if (this.config.cacheNotifications) {
        cacheManager.delete(this.getCacheKey(userId));
        cacheManager.delete(this.getCacheKey(userId, 'unread'));
        cacheManager.delete(`unread_count_${userId}`);
      }

      this.trackPerformance('deleteNotification', startTime, true);
      return true;

    } catch (error) {
      console.error('[NotificationManager] Error deleting notification:', error);
      this.trackPerformance('deleteNotification', startTime, false);
      return false;
    }
  }

  /**
   * Clear all notifications for a user
   */
  async clearAllNotifications(userId: string): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      // Invalidate cache
      if (this.config.cacheNotifications) {
        cacheManager.delete(this.getCacheKey(userId));
        cacheManager.delete(this.getCacheKey(userId, 'unread'));
        cacheManager.delete(`unread_count_${userId}`);
      }

      this.trackPerformance('clearAllNotifications', startTime, true);
      return true;

    } catch (error) {
      console.error('[NotificationManager] Error clearing all notifications:', error);
      this.trackPerformance('clearAllNotifications', startTime, false);
      return false;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    const startTime = Date.now();
    
    try {
      // Try cache first
      if (this.config.cacheNotifications) {
        const cacheKey = `unread_count_${userId}`;
        const cached = cacheManager.get<number>(cacheKey);
        if (cached !== null) {
          this.trackPerformance('getUnreadCount', startTime, true);
          return cached;
        }
      }

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;

      const unreadCount = count || 0;

      // Cache the count
      if (this.config.cacheNotifications) {
        const cacheKey = `unread_count_${userId}`;
        cacheManager.set(cacheKey, unreadCount, {
          ttl: CACHE_TTL.SHORT,
          storage: 'memory'
        });
      }

      this.trackPerformance('getUnreadCount', startTime, true);
      return unreadCount;

    } catch (error) {
      console.error('[NotificationManager] Error getting unread count:', error);
      this.trackPerformance('getUnreadCount', startTime, false);
      return 0;
    }
  }

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(request: BulkNotificationRequest): Promise<{
    success: number;
    failed: number;
    notifications: UnifiedNotification[];
  }> {
    const startTime = Date.now();
    const results = {
      success: 0,
      failed: 0,
      notifications: [] as UnifiedNotification[]
    };
    
    try {
      let userIds = request.user_ids || [];
      
      if (userIds.length === 0) {
        console.warn('[NotificationManager] Bulk notification without user_ids not implemented');
        return results;
      }

      // Process in batches
      const batches = [];
      for (let i = 0; i < userIds.length; i += this.config.batchSize) {
        batches.push(userIds.slice(i, i + this.config.batchSize));
      }

      for (const batch of batches) {
        const notifications = batch.map(userId => ({
          user_id: userId,
          type: request.type,
          title: request.title,
          message: request.message,
          is_read: false,
          priority: request.priority,
          channel: request.channels[0],
          metadata: request.metadata,
          expires_at: request.expires_at
        }));

        try {
          const { data, error } = await supabase
            .from('notifications')
            .insert(notifications)
            .select();

          if (error) throw error;

          results.success += data.length;
          results.notifications.push(...(data as UnifiedNotification[]));

          // Invalidate caches for affected users
          if (this.config.cacheNotifications) {
            batch.forEach(userId => {
              cacheManager.delete(this.getCacheKey(userId));
              cacheManager.delete(`unread_count_${userId}`);
            });
          }

        } catch (error) {
          console.error('[NotificationManager] Error in batch:', error);
          results.failed += batch.length;
        }

        // Delay between batches
        if (this.config.batchDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, this.config.batchDelay));
        }
      }

      this.trackPerformance('sendBulkNotifications', startTime, true);
      console.log(`[NotificationManager] Bulk notifications: ${results.success} sent, ${results.failed} failed`);
      
      return results;

    } catch (error) {
      console.error('[NotificationManager] Error sending bulk notifications:', error);
      this.trackPerformance('sendBulkNotifications', startTime, false);
      return results;
    }
  }

  /**
   * Subscribe to notification events
   */
  addEventListener(
    eventType: NotificationEvent['type'],
    listener: (event: NotificationEvent) => void
  ): () => void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    
    this.eventListeners.get(eventType)!.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.eventListeners.get(eventType)?.delete(listener);
    };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    const avgTime = this.performanceMetrics.operationsCount > 0 
      ? this.performanceMetrics.totalTime / this.performanceMetrics.operationsCount 
      : 0;
      
    return {
      ...this.performanceMetrics,
      averageOperationTime: avgTime,
      errorRate: this.performanceMetrics.operationsCount > 0 
        ? (this.performanceMetrics.errors / this.performanceMetrics.operationsCount) * 100 
        : 0
    };
  }

  /**
   * Get system health
   */
  getHealth() {
    const metrics = this.getPerformanceMetrics();
    const issues: string[] = [];
    const recommendations: string[] = [];

    if (metrics.errorRate > 10) {
      issues.push(`High error rate: ${metrics.errorRate.toFixed(1)}%`);
      recommendations.push('Check database connectivity and query performance');
    }

    if (metrics.averageOperationTime > 1000) {
      issues.push(`Slow average operation time: ${metrics.averageOperationTime.toFixed(0)}ms`);
      recommendations.push('Consider optimizing database queries or increasing cache TTL');
    }

    if (!this.config.enableRealTime) {
      recommendations.push('Enable real-time notifications for better user experience');
    }

    return {
      healthy: issues.length === 0,
      issues,
      recommendations,
      metrics
    };
  }

  /**
   * Cleanup expired notifications
   */
  async cleanup(): Promise<void> {
    const startTime = Date.now();
    
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .not('expires_at', 'is', null)
        .lt('expires_at', new Date().toISOString());

      if (error) throw error;

      this.trackPerformance('cleanup', startTime, true);
      console.log('[NotificationManager] Cleanup completed');

    } catch (error) {
      console.error('[NotificationManager] Error during cleanup:', error);
      this.trackPerformance('cleanup', startTime, false);
    }
  }

  /**
   * Destroy notification manager
   */
  destroy(): void {
    if (this.realtimeChannel) {
      this.realtimeChannel.unsubscribe();
    }
    
    this.eventListeners.clear();
    
    console.log('[NotificationManager] Destroyed');
  }
}

// Global notification manager instance
export const notificationManager = new UnifiedNotificationManager();

export default notificationManager;
