
/**
 * Notification Preferences Service
 * User notification ayarlarını idarə edən service
 */

import { supabase } from '@/integrations/supabase/client';

export interface UserNotificationPreferences {
  id: string;
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  sms_enabled: boolean;
  deadline_notifications: boolean;
  approval_notifications: boolean;
  system_notifications: boolean;
  data_entry_notifications: boolean;
  daily_digest: boolean;
  weekly_digest: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  timezone: string;
  priority_filter: string[];
  deadline_reminders: '3_1' | '1' | 'none';
  digest_frequency: 'immediate' | 'daily' | 'weekly';
  category_preferences: Record<string, boolean>;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationStats {
  total_received: number;
  total_read: number;
  email_sent: number;
  push_sent: number;
  last_notification_date?: string;
  most_common_type: string;
  read_rate: number;
}

export class NotificationPreferencesService {
  /**
   * Get user notification preferences
   */
  static async getUserPreferences(userId: string): Promise<UserNotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No preferences found, create default
          return this.createDefaultPreferences(userId);
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return null;
    }
  }

  /**
   * Update user notification preferences
   */
  static async updateUserPreferences(
    userId: string, 
    updates: Partial<UserNotificationPreferences>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_notification_preferences')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return false;
    }
  }

  /**
   * Create default preferences for new user
   */
  static async createDefaultPreferences(userId: string): Promise<UserNotificationPreferences> {
    try {
      const defaultPrefs = this.getDefaultPreferences(userId);
      
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .insert(defaultPrefs)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating default preferences:', error);
      throw error;
    }
  }

  /**
   * Get default preferences structure
   */
  static getDefaultPreferences(userId: string): Partial<UserNotificationPreferences> {
    return {
      user_id: userId,
      email_enabled: true,
      push_enabled: true,
      in_app_enabled: true,
      sms_enabled: false,
      deadline_notifications: true,
      approval_notifications: true,
      system_notifications: true,
      data_entry_notifications: true,
      daily_digest: false,
      weekly_digest: false,
      timezone: 'Asia/Baku',
      priority_filter: ['normal', 'high', 'critical'],
      deadline_reminders: '3_1',
      digest_frequency: 'immediate',
      category_preferences: {},
      language: 'az'
    };
  }

  /**
   * Get user notification statistics
   */
  static async getUserNotificationStats(userId: string): Promise<NotificationStats | null> {
    try {
      // Use the database function we created
      const { data, error } = await supabase
        .rpc('get_notification_statistics', { p_user_id: userId });

      if (error) throw error;

      return {
        total_received: data?.total || 0,
        total_read: data?.read || 0,
        email_sent: 0, // TODO: Implement email tracking
        push_sent: 0, // TODO: Implement push tracking
        most_common_type: 'info', // TODO: Calculate from data
        read_rate: data?.read_rate || 0
      };
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      return null;
    }
  }

  /**
   * Send test notification
   */
  static async sendTestNotification(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: 'Test Bildirişi',
          message: 'Bu test bildirişidir. Notification sisteminiz düzgün işləyir! 🎉',
          type: 'info',
          priority: 'normal',
          channel: 'inApp',
          is_read: false
        })
        .select()
        .single();

      if (error) throw error;
      return data !== null;
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    }
  }

  /**
   * Check if user should receive notification based on preferences
   */
  static async shouldSendNotification(
    userId: string,
    notificationType: string,
    channel: string,
    priority: string = 'normal'
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('should_send_notification', {
          p_user_id: userId,
          p_notification_type: notificationType,
          p_channel: channel,
          p_priority: priority
        });

      if (error) throw error;
      return data || true; // Default to allow if function fails
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return true; // Default to allow
    }
  }

  /**
   * Bulk update category preferences
   */
  static async updateCategoryPreferences(
    userId: string,
    categoryPreferences: Record<string, boolean>
  ): Promise<boolean> {
    return this.updateUserPreferences(userId, { category_preferences: categoryPreferences });
  }

  /**
   * Toggle specific notification type
   */
  static async toggleNotificationType(
    userId: string,
    type: 'deadline' | 'approval' | 'system' | 'data_entry',
    enabled: boolean
  ): Promise<boolean> {
    const updateField = `${type}_notifications`;
    return this.updateUserPreferences(userId, { [updateField]: enabled });
  }

  /**
   * Update quiet hours
   */
  static async updateQuietHours(
    userId: string,
    startTime?: string,
    endTime?: string
  ): Promise<boolean> {
    return this.updateUserPreferences(userId, {
      quiet_hours_start: startTime,
      quiet_hours_end: endTime
    });
  }

  /**
   * Export user preferences for backup
   */
  static async exportPreferences(userId: string): Promise<UserNotificationPreferences | null> {
    return this.getUserPreferences(userId);
  }

  /**
   * Import user preferences from backup
   */
  static async importPreferences(
    userId: string,
    preferences: Partial<UserNotificationPreferences>
  ): Promise<boolean> {
    // Remove system fields
    const { id, user_id, created_at, updated_at, ...importData } = preferences;
    return this.updateUserPreferences(userId, importData);
  }
}

export default NotificationPreferencesService;
