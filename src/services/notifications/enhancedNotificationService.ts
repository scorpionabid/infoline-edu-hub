import { supabase } from '@/integrations/supabase/client';
import { AppNotification, NotificationType, NotificationPriority } from '@/types/notification';

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  relatedEntityId?: string;
  relatedEntityType?: string;
  templateId?: string;
  templateData?: Record<string, any>;
  scheduledFor?: Date;
}

export interface BulkNotificationParams {
  userIds: string[];
  title: string;
  message: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  relatedEntityId?: string;
  relatedEntityType?: string;
  templateId?: string;
  templateData?: Record<string, any>;
}

export interface ScheduledNotification {
  userId: string;
  title: string;
  message: string;
  scheduledFor: Date;
  type?: NotificationType;
  priority?: NotificationPriority;
  templateId?: string;
  templateData?: Record<string, any>;
}

export interface EmailNotificationParams {
  userIds: string[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  templateId?: string;
  templateData?: Record<string, any>;
}

export interface NotificationResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface BulkResult {
  success: boolean;
  successCount: number;
  failureCount: number;
  errors: string[];
}

export interface ScheduleResult {
  success: boolean;
  scheduleId?: string;
  error?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface TemplateData {
  [key: string]: any;
}

/**
 * Enhanced Notification Service with advanced features
 * Provides template-based notifications, bulk operations, scheduling, and email integration
 */
export class EnhancedNotificationService {
  
  /**
   * Create a single notification with advanced options
   */
  static async createNotification(params: CreateNotificationParams): Promise<NotificationResult> {
    try {
      const {
        userId,
        title,
        message,
        type = 'info',
        priority = 'normal',
        relatedEntityId,
        relatedEntityType,
        templateId,
        templateData,
        scheduledFor
      } = params;

      // If scheduled for future, create scheduled notification
      if (scheduledFor && scheduledFor > new Date()) {
        return await this.scheduleNotification({
          userId,
          title,
          message,
          scheduledFor,
          type,
          priority,
          templateId,
          templateData
        });
      }

      const notificationData = {
        user_id: userId,
        title,
        message,
        type,
        priority,
        related_entity_id: relatedEntityId,
        related_entity_type: relatedEntityType,
        template_id: templateId,
        template_data: templateData,
        is_read: false,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        return { success: false, error: error.message };
      }

      // Trigger real-time update
      await this.triggerRealTimeUpdate(userId, data);

      return { success: true, data };
    } catch (error) {
      console.error('Error in createNotification:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Create multiple notifications in bulk
   */
  static async createBulkNotifications(notifications: BulkNotificationParams[]): Promise<BulkResult> {
    let successCount = 0;
    let failureCount = 0;
    const errors: string[] = [];

    try {
      // Process notifications in batches to avoid overwhelming the database
      const batchSize = 50;
      const batches = [];
      
      for (let i = 0; i < notifications.length; i += batchSize) {
        batches.push(notifications.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        const insertData = [];
        
        for (const notification of batch) {
          for (const userId of notification.userIds) {
            insertData.push({
              user_id: userId,
              title: notification.title,
              message: notification.message,
              type: notification.type || 'info',
              priority: notification.priority || 'normal',
              related_entity_id: notification.relatedEntityId,
              related_entity_type: notification.relatedEntityType,
              template_id: notification.templateId,
              template_data: notification.templateData,
              is_read: false,
              created_at: new Date().toISOString()
            });
          }
        }

        const { data, error } = await supabase
          .from('notifications')
          .insert(insertData)
          .select();

        if (error) {
          failureCount += insertData.length;
          errors.push(`Batch error: ${error.message}`);
        } else {
          successCount += insertData.length;
          
          // Trigger real-time updates for affected users
          const userIds = [...new Set(insertData.map(item => item.user_id))];
          await this.triggerBulkRealTimeUpdate(userIds);
        }
      }

      return {
        success: successCount > 0,
        successCount,
        failureCount,
        errors
      };
    } catch (error) {
      console.error('Error in createBulkNotifications:', error);
      return {
        success: false,
        successCount,
        failureCount: notifications.reduce((acc, n) => acc + n.userIds.length, 0),
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Create notification from template
   */
  static async createFromTemplate(
    templateId: string, 
    data: TemplateData, 
    userIds: string[]
  ): Promise<NotificationResult> {
    try {
      // Get template from database
      const { data: template, error: templateError } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('id', templateId)
        .eq('is_active', true)
        .single();

      if (templateError || !template) {
        return { 
          success: false, 
          error: `Template not found or inactive: ${templateId}` 
        };
      }

      // Render template with data
      const renderedTitle = this.renderTemplate(template.title_template, data);
      const renderedMessage = this.renderTemplate(template.message_template, data);

      // Create bulk notifications
      const bulkParams: BulkNotificationParams[] = [{
        userIds,
        title: renderedTitle,
        message: renderedMessage,
        type: template.type as NotificationType,
        priority: template.priority as NotificationPriority,
        templateId,
        templateData: data
      }];

      const result = await this.createBulkNotifications(bulkParams);
      
      return {
        success: result.success,
        data: result,
        error: result.errors.length > 0 ? result.errors.join(', ') : undefined
      };
    } catch (error) {
      console.error('Error in createFromTemplate:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Schedule a notification for future delivery
   */
  static async scheduleNotification(notification: ScheduledNotification): Promise<ScheduleResult> {
    try {
      const scheduleData = {
        template_id: notification.templateId,
        scheduled_for: notification.scheduledFor.toISOString(),
        recipients: JSON.stringify([notification.userId]),
        template_data: notification.templateData,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('scheduled_notifications')
        .insert(scheduleData)
        .select()
        .single();

      if (error) {
        console.error('Error scheduling notification:', error);
        return { success: false, error: error.message };
      }

      return { success: true, scheduleId: data.id };
    } catch (error) {
      console.error('Error in scheduleNotification:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Send email notification (calls Edge Function)
   */
  static async sendEmailNotification(params: EmailNotificationParams): Promise<EmailResult> {
    try {
      const { data, error } = await supabase.functions.invoke('send-notification-email', {
        body: {
          userIds: params.userIds,
          subject: params.subject,
          htmlContent: params.htmlContent,
          textContent: params.textContent,
          templateId: params.templateId,
          templateData: params.templateData
        }
      });

      if (error) {
        console.error('Error sending email notification:', error);
        return { success: false, error: error.message };
      }

      return { success: true, messageId: data?.messageId };
    } catch (error) {
      console.error('Error in sendEmailNotification:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get user notification preferences
   */
  static async getUserPreferences(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      // Return default preferences if none exist
      return data || {
        user_id: userId,
        email_enabled: true,
        push_enabled: true,
        deadline_reminders: '3_1',
        category_preferences: {},
        digest_frequency: 'daily'
      };
    } catch (error) {
      console.error('Error getting user preferences:', error);
      throw error;
    }
  }

  /**
   * Update user notification preferences
   */
  static async updateUserPreferences(userId: string, preferences: Partial<any>) {
    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  /**
   * Render template with data substitution
   */
  private static renderTemplate(template: string, data: TemplateData): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? String(data[key]) : match;
    });
  }

  /**
   * Trigger real-time update for a single user
   */
  private static async triggerRealTimeUpdate(userId: string, notification: any) {
    try {
      // The real-time update will be automatically triggered by Supabase
      // when the notification is inserted into the database
      console.log(`Real-time update triggered for user ${userId}`);
    } catch (error) {
      console.error('Error triggering real-time update:', error);
    }
  }

  /**
   * Trigger real-time updates for multiple users
   */
  private static async triggerBulkRealTimeUpdate(userIds: string[]) {
    try {
      // The real-time updates will be automatically triggered by Supabase
      console.log(`Bulk real-time update triggered for ${userIds.length} users`);
    } catch (error) {
      console.error('Error triggering bulk real-time update:', error);
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string): Promise<NotificationResult> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<NotificationResult> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId: string, userId: string): Promise<NotificationResult> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting notification:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get notification analytics
   */
  static async getNotificationAnalytics(userId?: string, startDate?: Date, endDate?: Date) {
    try {
      let query = supabase
        .from('notifications')
        .select('type, priority, is_read, created_at');

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Process analytics
      const analytics = {
        total: data.length,
        unread: data.filter(n => !n.is_read).length,
        byType: {} as Record<string, number>,
        byPriority: {} as Record<string, number>,
        readRate: data.length > 0 ? (data.filter(n => n.is_read).length / data.length) * 100 : 0
      };

      // Count by type
      data.forEach(notification => {
        analytics.byType[notification.type] = (analytics.byType[notification.type] || 0) + 1;
        analytics.byPriority[notification.priority] = (analytics.byPriority[notification.priority] || 0) + 1;
      });

      return analytics;
    } catch (error) {
      console.error('Error getting notification analytics:', error);
      throw error;
    }
  }
}

export default EnhancedNotificationService;
