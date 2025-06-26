
/**
 * İnfoLine Notification System - Legacy Service Compatibility Layer
 * DEPRECATED: Use notificationManager from @/notifications instead
 * Bu fayl backward compatibility üçün saxlanılır
 */

import { supabase } from '@/integrations/supabase/client';

// Simple notification type for backward compatibility
export type NotificationType = 'info' | 'warning' | 'success' | 'error' | 'deadline' | 'approval';

/**
 * @deprecated Use notificationManager.createNotification instead
 */
export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: NotificationType = 'info',
  relatedEntityId?: string,
  relatedEntityType?: string
) => {
  console.warn(`
[DEPRECATED] createNotification from services/notificationService is deprecated.

Please migrate to the new notification system:
- Import: import { notificationManager } from '@/notifications'
- Usage: notificationManager.createNotification(userId, title, message, type, options)
  `);

  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        related_entity_id: relatedEntityId,
        related_entity_type: relatedEntityType,
        is_read: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * @deprecated Use the new notification system instead
 */
export const createDeadlineNotification = async (
  title: string,
  message: string,
  categoryId: string
) => {
  console.warn(`[DEPRECATED] createDeadlineNotification is deprecated. Use the new notification system.`);
  
  return {
    title,
    message,
    type: 'deadline' as const,
    relatedEntityId: categoryId,
    relatedEntityType: 'category',
    migrationNote: 'This function needs userId. Use the new notification system instead.'
  };
};

/**
 * @deprecated Use the new notification system instead
 */
export const createApprovalNotification = async (
  userId: string,
  categoryName: string,
  categoryId: string,
  isApproved: boolean,
  rejectionReason?: string
) => {
  console.warn(`[DEPRECATED] createApprovalNotification is deprecated.`);

  try {
    const title = isApproved ? 'Məlumatlarınız təsdiqləndi' : 'Məlumatlarınız rədd edildi';
    const message = isApproved 
      ? `${categoryName} kateqoriyası üzrə məlumatlarınız təsdiqləndi.`
      : `${categoryName} kateqoriyası üzrə məlumatlarınız rədd edildi. Səbəb: ${rejectionReason || 'Məlum deyil'}`;

    return await createNotification(userId, title, message, isApproved ? 'success' : 'error', categoryId, 'category');
  } catch (error) {
    console.error('Error creating approval notification:', error);
    throw error;
  }
};

/**
 * @deprecated Use the new notification system instead
 */
export const getUserNotifications = async (userId: string) => {
  console.warn(`[DEPRECATED] getUserNotifications is deprecated.`);

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * @deprecated Alias for getUserNotifications
 */
export const getNotifications = getUserNotifications;

export default {
  createNotification,
  createDeadlineNotification,
  createApprovalNotification,
  getUserNotifications,
  getNotifications
};
