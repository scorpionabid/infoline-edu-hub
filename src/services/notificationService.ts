
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/notification';
import { dbNotificationToAppNotification } from '@/types/adapters';

/**
 * İstifadəçi bildirişlərini əldə etmək
 * @param userId İstifadəçi ID
 */
export const fetchNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Verilənlər bazası bildirişlərini tətbiq bildirişlərinə çeviririk
    const notifications: Notification[] = data.map(dbNotificationToAppNotification);

    return notifications;
  } catch (error) {
    console.error('Bildirişlər əldə edilərkən xəta:', error);
    return [];
  }
};

/**
 * Bildirişi oxunmuş kimi işarələmək
 * @param notificationId Bildiriş ID
 * @param userId İstifadəçi ID
 */
export const markNotificationAsRead = async (notificationId: string, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Bildiriş oxunmuş kimi işarələnərkən xəta:', error);
    return false;
  }
};

/**
 * Bütün bildirişləri oxunmuş kimi işarələmək
 * @param userId İstifadəçi ID
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Bütün bildirişlər oxunmuş kimi işarələnərkən xəta:', error);
    return false;
  }
};

/**
 * Bütün bildirişləri silmək (təmizləmək)
 * @param userId İstifadəçi ID
 */
export const clearAllNotifications = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Bildirişlər təmizlənərkən xəta:', error);
    return false;
  }
};

/**
 * Yeni bildiriş yaratmaq
 * @param notification Bildiriş məlumatları
 */
export const createNotification = async (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<Notification | null> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        title: notification.title,
        message: notification.message,
        type: notification.type,
        user_id: notification.userId,
        priority: notification.priority || 'normal',
        is_read: false,
        related_entity_type: notification.type,
        related_entity_id: null,
      }])
      .select()
      .single();

    if (error) throw error;

    return dbNotificationToAppNotification(data);
  } catch (error) {
    console.error('Bildiriş yaradılarkən xəta:', error);
    return null;
  }
};
