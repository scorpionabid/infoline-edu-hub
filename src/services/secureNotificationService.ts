
/**
 * Secure Notification Service
 * Enhanced security for notification operations
 */

import { supabase } from '@/integrations/supabase/client';
import { NotificationData } from '@/types/notification';
import { advancedSanitize, validateNotificationContent, checkSecurityRateLimit } from '@/utils/inputValidation';
import { securityLogger, getClientContext } from '@/utils/securityLogger';

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
      // Rate limiting check
      const rateLimitKey = `notification_${notification.user_id}`;
      const rateLimit = checkSecurityRateLimit(rateLimitKey, 20, 300000); // 20 per 5 minutes
      
      if (!rateLimit.allowed) {
        securityLogger.logRateLimit('notification_creation', {
          ...getClientContext(),
          userId: notification.user_id,
          severity: 'high'
        });
        return { success: false, error: 'Too many notification requests' };
      }
      
      // Input validation
      const validation = validateNotificationContent({
        title: notification.title,
        message: notification.message,
        type: notification.type
      });
      
      if (!validation.isValid) {
        securityLogger.logValidationFailure('notification', validation.errors.join(', '), {
          ...getClientContext(),
          userId: notification.user_id
        });
        return { success: false, error: validation.errors.join(', ') };
      }
      
      // Sanitize input
      const sanitizedNotification = {
        ...notification,
        title: advancedSanitize(notification.title, { maxLength: 200, stripWhitespace: true }),
        message: notification.message ? advancedSanitize(notification.message, { maxLength: 1000, stripWhitespace: true }) : undefined
      };
      
      // Create notification
      const { data, error } = await supabase
        .from('notifications')
        .insert(sanitizedNotification)
        .select()
        .single();
      
      if (error) {
        securityLogger.logError(error, {
          ...getClientContext(),
          action: 'create_notification',
          userId: notification.user_id
        });
        return { success: false, error: error.message };
      }
      
      // Log successful creation
      securityLogger.logSecurityEvent('notification_created', {
        ...getClientContext(),
        userId: notification.user_id,
        action: 'create_notification',
        severity: 'low'
      });
      
      return { success: true, data };
      
    } catch (error: any) {
      securityLogger.logError(error, {
        ...getClientContext(),
        action: 'create_notification_error',
        userId: notification.user_id
      });
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
        securityLogger.logError(error, {
          ...getClientContext(),
          action: 'get_notifications',
          userId
        });
        return { success: false, error: error.message };
      }
      
      return { success: true, data: data || [] };
      
    } catch (error: any) {
      securityLogger.logError(error, {
        ...getClientContext(),
        action: 'get_notifications_error',
        userId
      });
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
        securityLogger.logSuspiciousActivity('unauthorized_notification_access', {
          ...getClientContext(),
          userId,
          notificationId
        });
        return { success: false, error: 'Unauthorized access' };
      }
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', userId); // Double verification
      
      if (error) {
        securityLogger.logError(error, {
          ...getClientContext(),
          action: 'mark_notification_read',
          userId
        });
        return { success: false, error: error.message };
      }
      
      return { success: true };
      
    } catch (error: any) {
      securityLogger.logError(error, {
        ...getClientContext(),
        action: 'mark_notification_read_error',
        userId
      });
      return { success: false, error: 'Failed to mark notification as read' };
    }
  }
}

export default SecureNotificationService;
