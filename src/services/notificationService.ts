
import { supabase } from '@/integrations/supabase/client';
import { Notification, adaptDbNotificationToApp } from '@/types/notification';

// Bildiriş yaratmaq
export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: string = 'info',
  priority: string = 'normal',
  relatedEntityType?: string,
  relatedEntityId?: string
): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: userId,
          title,
          message,
          type,
          priority,
          is_read: false,
          related_entity_id: relatedEntityId,
          related_entity_type: relatedEntityType,
          created_at: new Date().toISOString()
        }
      ])
      .select('*')
      .single();
    
    if (error) {
      console.error('Bildiriş yaratma xətası:', error);
      throw error;
    }
    
    return adaptDbNotificationToApp(data);
  } catch (error) {
    console.error('Bildiriş yaratma xətası:', error);
    throw error;
  }
};

// İstifadəçi üçün bildirişləri əldə etmək
export const getUserNotifications = async (userId: string, limit: number = 10): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Bildirişləri əldə etmə xətası:', error);
      throw error;
    }
    
    return data.map(adaptDbNotificationToApp);
  } catch (error) {
    console.error('Bildirişləri əldə etmə xətası:', error);
    throw error;
  }
};

// Bildirişi oxunmuş kimi işarələmək
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    
    if (error) {
      console.error('Bildirişi oxunmuş kimi işarələmə xətası:', error);
      throw error;
    }
  } catch (error) {
    console.error('Bildirişi oxunmuş kimi işarələmə xətası:', error);
    throw error;
  }
};

// Bildirişi silmək
export const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);
    
    if (error) {
      console.error('Bildirişi silmə xətası:', error);
      throw error;
    }
  } catch (error) {
    console.error('Bildirişi silmə xətası:', error);
    throw error;
  }
};

// Bütün bildirişləri oxunmuş kimi işarələmək
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    
    if (error) {
      console.error('Bildirişləri oxunmuş kimi işarələmə xətası:', error);
      throw error;
    }
  } catch (error) {
    console.error('Bildirişləri oxunmuş kimi işarələmə xətası:', error);
    throw error;
  }
};

// Təsdiq işlemi hakkında bildirim oluşturma
export const createApprovalNotification = async (
  userId: string,
  categoryName: string,
  categoryId: string,
  isApproved: boolean,
  rejectionReason?: string
): Promise<any> => {
  const title = isApproved 
    ? 'Məlumatlar təsdiqləndi'
    : 'Məlumatlar rədd edildi';
  
  const message = isApproved
    ? `${categoryName} kateqoriyası üçün daxil etdiyiniz məlumatlar təsdiqləndi.`
    : `${categoryName} kateqoriyası üçün daxil etdiyiniz məlumatlar rədd edildi. ${rejectionReason ? 'Səbəb: ' + rejectionReason : ''}`;
  
  return createNotification(
    userId,
    title,
    message,
    isApproved ? 'success' : 'error',
    'high',
    'category',
    categoryId
  );
};
