
import { supabase } from '@/integrations/supabase/client';
import { Notification, NotificationType, NotificationPriority } from '@/types/notification';
import { toast } from 'sonner';

// Bildirişləri əldə etmək üçün
export const fetchNotifications = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      title: item.title,
      message: item.message,
      type: item.type as NotificationType,
      priority: item.priority as NotificationPriority,
      isRead: item.is_read,
      createdAt: item.created_at,
      userId: item.user_id,
      relatedEntityType: item.related_entity_type,
      relatedEntityId: item.related_entity_id
    })) as Notification[];
  } catch (error) {
    console.error('Bildirişlər yüklənərkən xəta:', error);
    return [];
  }
};

// Bildirişi oxunmuş kimi işarələmək üçün
export const markNotificationAsRead = async (id: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Bildiriş oxunmuş kimi işarələnərkən xəta:', error);
    return false;
  }
};

// Bildirişi silmək üçün
export const deleteNotification = async (id: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Bildiriş silinərkən xəta:', error);
    return false;
  }
};

// Bütün bildirişləri silmək üçün
export const clearAllNotifications = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Bütün bildirişlər silinərkən xəta:', error);
    return false;
  }
};

// Yeni bildiriş göndərmək üçün
export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: NotificationType,
  priority: NotificationPriority = 'normal',
  relatedEntityType?: string,
  relatedEntityId?: string
) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        title,
        message,
        type,
        priority,
        related_entity_type: relatedEntityType,
        related_entity_id: relatedEntityId,
        is_read: false,
        user_id: userId // userId əlavə edildi
      });
      
    if (error) throw error;
    
    toast.success('Bildiriş göndərildi');
    return true;
  } catch (error) {
    console.error('Bildiriş yaradılarkən xəta:', error);
    toast.error('Bildiriş göndərilə bilmədi');
    return false;
  }
};
