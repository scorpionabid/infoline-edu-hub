
import { supabase } from "@/integrations/supabase/client";
import { Notification, NotificationType, NotificationPriority, adaptDbNotificationToApp } from "@/types/notification";

/**
 * Bildirişləri əldə etmək
 * @param userId İstifadəçi ID-si
 */
export const getNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    if (!userId) {
      console.warn("Bildirişləri əldə etmək üçün userId təqdim edilməyib");
      return [];
    }
    
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Bildirişləri əldə edərkən xəta:", error);
      throw error;
    }

    return (notifications || []).map(notification => adaptDbNotificationToApp(notification));
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
    if (!notificationId || !userId) {
      console.warn("Bildirişi oxunmuş kimi işarələmək üçün məlumatlar tam deyil");
      return false;
    }
    
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
    if (!userId) {
      console.warn("Bildirişləri oxunmuş kimi işarələmək üçün userId təqdim edilməyib");
      return false;
    }
    
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
 * Bütün bildirişləri təmizləmək - bu funksiya simulyasiya edilir
 * @param userId İstifadəçi ID-si
 */
export const clearAllNotifications = async (userId: string): Promise<boolean> => {
  try {
    return await markAllNotificationsAsRead(userId);
    
    // Alternativ olaraq, bildirişləri silmək istəsəydik:
    /*
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error("Bildirişləri təmizləyərkən xəta:", error);
      throw error;
    }
    */
  } catch (error: any) {
    console.error("Bildirişləri təmizləmə xətası:", error);
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
    if (!userId) {
      console.warn("Bildiriş yaratmaq üçün userId təqdim edilməyib");
      return null;
    }
    
    // Verilənlər bazası formatında notification
    const notificationData = {
      title: notification.title,
      message: notification.message,
      type: notification.type as string,
      priority: notification.priority as string,
      related_entity_id: notification.relatedId,
      related_entity_type: notification.relatedType,
      user_id: userId,
      is_read: false
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

    if (data) {
      return adaptDbNotificationToApp(data);
    }

    return null;
  } catch (error: any) {
    console.error("Bildiriş yaratma xətası:", error);
    return null;
  }
};

export const fetchNotifications = getNotifications;
