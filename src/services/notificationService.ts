
import { supabase } from "@/integrations/supabase/client";
import { Notification } from "@/types/notification";

/**
 * Bildirişləri əldə etmək
 * @param userId İstifadəçi ID-si
 */
export const getNotifications = async (userId: string): Promise<any[]> => {
  try {
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Bildirişləri əldə edərkən xəta:", error);
      throw error;
    }

    return notifications || [];
  } catch (error: any) {
    console.error("Bildirişləri əldə etmə xətası:", error);
    return [];
  }
};

/**
 * Bildirişi oxunmuş kimi işarələmək
 * @param notificationId Bildiriş ID-si
 * @param userId İstifadəçi ID-si
 */
export const markNotificationAsRead = async (notificationId: string, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) {
      console.error("Bildirişi oxunmuş kimi işarələyərkən xəta:", error);
      throw error;
    }

    return true;
  } catch (error: any) {
    console.error("Bildirişi oxunmuş kimi işarələmə xətası:", error);
    return false;
  }
};

/**
 * Bütün bildirişləri oxunmuş kimi işarələmək
 * @param userId İstifadəçi ID-si
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);

    if (error) {
      console.error("Bütün bildirişləri oxunmuş kimi işarələyərkən xəta:", error);
      throw error;
    }

    return true;
  } catch (error: any) {
    console.error("Bütün bildirişləri oxunmuş kimi işarələmə xətası:", error);
    return false;
  }
};

/**
 * Yeni bildiriş yaratmaq
 * @param notification Bildiriş məlumatları
 * @param userId İstifadəçi ID-si
 */
export const createNotification = async (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>, userId: string): Promise<Notification | null> => {
  try {
    // Mark notification as created by specified user
    const notificationData = {
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority || 'normal',
      related_entity_id: notification.relatedId,
      related_entity_type: notification.relatedType,
      user_id: userId,
      is_read: false,
      time: notification.time,
      date: notification.date
    };

    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();

    if (error) {
      console.error("Bildiriş yaradılarkən xəta:", error);
      throw error;
    }

    // Format the response as a Notification type
    if (data) {
      return {
        id: data.id,
        title: data.title,
        message: data.message,
        type: data.type,
        priority: data.priority,
        userId: data.user_id,
        isRead: data.is_read,
        createdAt: data.created_at,
        relatedId: data.related_entity_id,
        relatedType: data.related_entity_type,
        time: data.time || new Date().toTimeString().slice(0, 5),
        date: data.date || new Date().toISOString().slice(0, 10)
      };
    }

    return null;
  } catch (error: any) {
    console.error("Bildiriş yaratma xətası:", error);
    return null;
  }
};
