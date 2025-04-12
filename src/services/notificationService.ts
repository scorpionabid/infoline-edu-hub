import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/notification';

/**
 * İstifadəçinin bildirişlərini əldə edir
 * @param userId İstifadəçi ID
 * @returns Notification[]
 */
export const fetchNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Bildirişləri əldə edərkən xəta:', error);
      return [];
    }

    return data as Notification[];
  } catch (error) {
    console.error('Bildirişləri əldə edərkən xəta:', error);
    return [];
  }
};

/**
 * Bildirişi oxunmuş kimi işarələyir
 * @param notificationId Bildiriş ID
 * @returns Success boolean
 */
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Bildirişi oxunmuş kimi işarələyərkən xəta:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Bildirişi oxunmuş kimi işarələyərkən xəta:', error);
    return false;
  }
};

/**
 * İstifadəçinin bütün bildirişlərini oxunmuş kimi işarələyir
 * @param userId İstifadəçi ID
 * @returns Success boolean
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);

    if (error) {
      console.error('Bildirişləri oxunmuş kimi işarələyərkən xəta:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Bildirişləri oxunmuş kimi işarələyərkən xəta:', error);
    return false;
  }
};

/**
 * İstifadəçinin bütün bildirişlərini silir
 * @param userId İstifadəçi ID
 * @returns Success boolean
 */
export const clearAllNotifications = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Bildirişləri silərkən xəta:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Bildirişləri silərkən xəta:', error);
    return false;
  }
};

/**
 * Yeni bildiriş yaradır
 * @param notification Bildiriş məlumatları
 * @returns Success boolean
 */
export const createNotification = async (data: {
  title: string;
  message: string;
  type: string;
  userId: string;
  priority: 'normal' | 'high' | 'low';
  related_entity_type?: string;
  related_entity_id?: string;
}): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        title: data.title,
        message: data.message,
        type: data.type,
        user_id: data.userId,
        priority: data.priority,
        related_entity_type: data.related_entity_type,
        related_entity_id: data.related_entity_id,
        is_read: false
      });

    if (error) {
      console.error('Bildiriş yaradarkən xəta:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Bildiriş yaradarkən xəta:', error);
    return false;
  }
};
