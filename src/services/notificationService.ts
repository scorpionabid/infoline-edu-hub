
import { supabase } from '@/integrations/supabase/client';
import { Notification, adaptDbNotificationToApp } from '@/types/notification';

// Bildiriş yaratmaq
export const createNotification = async (
  userId: string,
  type: string,
  title: string,
  message: string,
  priority = 'normal',
  relatedEntityId?: string,
  relatedEntityType?: string
): Promise<{ success: boolean; error?: string; notification?: Notification }> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        priority,
        related_entity_id: relatedEntityId,
        related_entity_type: relatedEntityType,
        is_read: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      notification: adaptDbNotificationToApp(data)
    };
  } catch (error: any) {
    console.error('Bildiriş yaradılarkən xəta:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Bildirişi oxunmuş kimi işarələmək
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

// Bütün bildirişləri oxunmuş kimi işarələmək
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

// Bildirişləri əldə etmək
export const getNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data ? data.map(notification => adaptDbNotificationToApp(notification)) : [];
  } catch (error) {
    console.error('Bildirişləri əldə edərkən xəta:', error);
    return [];
  }
};

// Son tarix xəbərdarlığı bildirişi yaratmaq
export const createDeadlineNotification = async (
  userId: string,
  categoryName: string,
  deadline: string,
  categoryId: string,
  isApproaching = true
): Promise<boolean> => {
  try {
    const title = isApproaching ? 'Son tarix yaxınlaşır' : 'Son tarix keçdi';
    const message = isApproaching
      ? `${categoryName} kateqoriyası üçün son tarix yaxınlaşır: ${deadline}`
      : `${categoryName} kateqoriyası üçün son tarix keçdi: ${deadline}`;
    
    await createNotification(
      userId,
      'deadline',
      title,
      message,
      isApproaching ? 'normal' : 'high',
      categoryId,
      'category'
    );
    
    return true;
  } catch (error) {
    console.error('Son tarix bildirişi yaradılarkən xəta:', error);
    return false;
  }
};

// Təsdiq/rədd bildirişi yaratmaq
export const createApprovalNotification = async (
  userId: string,
  categoryName: string,
  categoryId: string,
  isApproved: boolean,
  rejectionReason?: string
): Promise<boolean> => {
  try {
    const title = isApproved ? 'Məlumatlar təsdiqləndi' : 'Məlumatlar rədd edildi';
    const message = isApproved
      ? `${categoryName} kateqoriyası üçün məlumatlar təsdiqləndi`
      : `${categoryName} kateqoriyası üçün məlumatlar rədd edildi: ${rejectionReason || 'Səbəb göstərilməyib'}`;
    
    await createNotification(
      userId,
      isApproved ? 'success' : 'error',
      title,
      message,
      isApproved ? 'normal' : 'high',
      categoryId,
      'category'
    );
    
    return true;
  } catch (error) {
    console.error('Təsdiq bildirişi yaradılarkən xəta:', error);
    return false;
  }
};
