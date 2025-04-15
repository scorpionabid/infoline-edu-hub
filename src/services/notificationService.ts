import { supabase } from "@/integrations/supabase/client";
import { Notification } from "@/types/notification";

/**
 * Bildirişləri əldə etmək
 * @param userId İstifadəçi ID-si
 */
export const getNotifications = async (userId: string): Promise<Notification[]> => {
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
      ...notification,
      user_id: userId
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

    return data || null;
  } catch (error: any) {
    console.error("Bildiriş yaratma xətası:", error);
    return null;
  }
};
