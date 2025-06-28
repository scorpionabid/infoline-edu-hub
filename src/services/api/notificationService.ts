
import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  priority: 'low' | 'normal' | 'high';
  isRead: boolean;
  createdAt: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

export interface CreateNotificationRequest {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  priority?: 'low' | 'normal' | 'high';
  relatedEntityType?: string;
  relatedEntityId?: string;
}

export class NotificationService {
  /**
   * Get notifications for user
   */
  static async getUserNotifications(
    userId: string,
    limit: number = 50
  ): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map(notification => ({
        id: notification.id,
        title: notification.title,
        message: notification.message || '',
        type: notification.type as any,
        priority: notification.priority as any,
        isRead: notification.is_read,
        createdAt: notification.created_at,
        relatedEntityType: notification.related_entity_type,
        relatedEntityId: notification.related_entity_id
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Create notification
   */
  static async createNotification(
    notification: CreateNotificationRequest
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: notification.userId,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          priority: notification.priority || 'normal',
          related_entity_type: notification.relatedEntityType,
          related_entity_id: notification.relatedEntityId,
          is_read: false
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Mark notifications as read
   */
  static async markAsRead(notificationIds: string[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', notificationIds);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw error;
    }
  }

  /**
   * Get unread count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  /**
   * Send bulk notifications for approval workflow
   */
  static async notifyApprovalWorkflow(
    entries: any[],
    action: 'submitted' | 'approved' | 'rejected'
  ): Promise<void> {
    try {
      // This would implement the logic to notify relevant users
      // based on the organizational hierarchy
      
      const notifications: CreateNotificationRequest[] = [];
      
      // Group entries by school/sector/region to minimize notifications
      const groupedEntries = entries.reduce((acc, entry) => {
        const key = `${entry.school_id}-${action}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(entry);
        return acc;
      }, {});

      // Create notifications for each group
      for (const [key, groupEntries] of Object.entries(groupedEntries)) {
        const sampleEntry = (groupEntries as any[])[0];
        
        notifications.push({
          userId: sampleEntry.created_by, // This would be determined by business logic
          title: this.getNotificationTitle(action),
          message: this.getNotificationMessage(action, groupEntries as any[]),
          type: action === 'approved' ? 'success' : action === 'rejected' ? 'error' : 'info',
          priority: 'normal',
          relatedEntityType: 'data_entry',
          relatedEntityId: sampleEntry.id
        });
      }

      // Send all notifications
      await Promise.all(
        notifications.map(notification => 
          this.createNotification(notification)
        )
      );
    } catch (error) {
      console.error('Error sending approval workflow notifications:', error);
      throw error;
    }
  }

  private static getNotificationTitle(action: string): string {
    switch (action) {
      case 'submitted': {
        return 'Yeni məlumat təsdiqi gözləyir';
      }
      case 'approved': {
        return 'Məlumatlarınız təsdiqləndi';
      }
      case 'rejected': {
        return 'Məlumatlarınız rədd edildi';
      }
      default:
        return 'Bildiriş';
    }
  }

  private static getNotificationMessage(action: string, entries: any[]): string {
    const count = entries.length;
    switch (action) {
      case 'submitted': {
        return `${count} məlumat sahəsi təsdiq üçün göndərildi`;
      }
      case 'approved': {
        return `${count} məlumat sahəsi təsdiqləndi`;
      }
      case 'rejected': {
        return `${count} məlumat sahəsi rədd edildi`;
      }
      default:
        return `${count} məlumat sahəsi yeniləndi`;
    }
  }
}
