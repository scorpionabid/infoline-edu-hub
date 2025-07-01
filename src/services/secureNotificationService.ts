
/**
 * Secure Notification Service
 * Enhanced security for notification operations
 */

import { supabase } from '@/integrations/supabase/client';

// Define NotificationData locally since it's not exported from types
export interface NotificationData {
  id?: string;
  user_id: string;
  title: string;
  message?: string;
  type: string;
  priority?: string;
  is_read?: boolean;
  created_at?: string;
}


export class SecureNotificationService {
  
  /**
   * Create notification with enhanced security
   */
  static async createNotification(notification: Omit<NotificationData, 'id' | 'created_at'>): Promise<{
    success: boolean;
    data?: NotificationData;
    error?: string;
  }> {
    try {
      // Basic validation
      if (!notification.user_id || !notification.title) {
        return { success: false, error: 'Missing required fields' };
      }
      
      // Sanitize input - basic implementation
      const sanitizedNotification = {
        ...notification,
        title: notification.title.substring(0, 200).trim(),
        message: notification.message ? notification.message.substring(0, 1000).trim() : undefined
      };
      
      // Create notification
      const { data, error } = await supabase
        .from('notifications')
        .insert(sanitizedNotification)
        .select()
        .single();
      
      if (error) {
        console.error('Database error:', error);
        return { success: false, error: error.message };
      }
      
      console.log('Notification created successfully:', data);
      return { success: true, data };
      
    } catch (error: any) {
      console.error('Create notification error:', error);
      return { success: false, error: 'Failed to create notification' };
    }
  }
  
  /**
   * Get notifications with security checks
   */
  static async getUserNotifications(userId: string, limit: number = 50): Promise<{
    success: boolean;
    data?: NotificationData[];
    error?: string;
  }> {
    try {
      // Input validation
      if (!userId || typeof userId !== 'string') {
        return { success: false, error: 'Invalid user ID' };
      }
      
      if (limit > 100) {
        limit = 100; // Maximum limit for security
      }
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Get notifications error:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, data: data || [] };
      
    } catch (error: any) {
      console.error('Get notifications error:', error);
      return { success: false, error: 'Failed to fetch notifications' };
    }
  }
  
  /**
   * Mark notification as read with security validation
   */
  static async markAsRead(notificationId: string, userId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Input validation
      if (!notificationId || !userId) {
        return { success: false, error: 'Invalid parameters' };
      }
      
      // Verify ownership before updating
      const { data: notification, error: fetchError } = await supabase
        .from('notifications')
        .select('user_id')
        .eq('id', notificationId)
        .single();
      
      if (fetchError || !notification) {
        return { success: false, error: 'Notification not found' };
      }
      
      if (notification.user_id !== userId) {
        console.log('Unauthorized notification access attempt:', { userId, notificationId });
        return { success: false, error: 'Unauthorized access' };
      }
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', userId); // Double verification
      
      if (error) {
        console.error('Mark notification read error:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true };
      
    } catch (error: any) {
      console.error('Mark notification read error:', error);
      return { success: false, error: 'Failed to mark notification as read' };
    }
  }
}

export default SecureNotificationService;
