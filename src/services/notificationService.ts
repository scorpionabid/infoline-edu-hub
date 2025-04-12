
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/notifications';
import { toast } from 'sonner';

// Bildirişləri əldə etmək üçün
export const fetchNotifications = async (): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    
    // Supabase formatından bizim tipimizə çevirək
    return (data || []).map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      createdAt: new Date(notification.created_at),
      isRead: notification.is_read,
      type: notification.type,
      priority: notification.priority as 'normal' | 'high' | 'low',
      relatedEntityType: notification.related_entity_type,
      relatedEntityId: notification.related_entity_id
    }));
  } catch (error: any) {
    console.error('Bildirişlər yüklənərkən xəta:', error.message);
    throw new Error('Bildirişlər yüklənərkən xəta baş verdi');
  }
};

// Bildirişi oxunmuş kimi işarələmək üçün
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error: any) {
    console.error('Bildiriş oxundu kimi işarələnərkən xəta:', error.message);
    throw new Error('Bildiriş güncəllənərkən xəta baş verdi');
  }
};

// Bütün bildirişləri oxunmuş kimi işarələmək üçün
export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false);

    if (error) throw error;
  } catch (error: any) {
    console.error('Bütün bildirişlər oxundu kimi işarələnərkən xəta:', error.message);
    throw new Error('Bildirişlər güncəllənərkən xəta baş verdi');
  }
};

// Bildiriş yaratmaq üçün (geri planda istifadə üçün)
export const createNotification = async (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority,
        related_entity_type: notification.relatedEntityType,
        related_entity_id: notification.relatedEntityId,
        is_read: false
      })
      .select('id')
      .single();

    if (error) throw error;
    
    return data.id;
  } catch (error: any) {
    console.error('Bildiriş yaradılarkən xəta:', error.message);
    throw new Error('Bildiriş yaradılarkən xəta baş verdi');
  }
};

// Notification-ın uyğun adını əldə etmək üçün
export const getNotificationTypeLabel = (type: string): string => {
  const types: Record<string, string> = {
    'newCategory': 'Yeni kateqoriya',
    'deadline': 'Son tarix',
    'approvalRequest': 'Təsdiq tələbi',
    'approved': 'Təsdiqləndi',
    'rejected': 'Rədd edildi',
    'systemUpdate': 'Sistem yeniləməsi',
    'reminder': 'Xatırlatma'
  };
  
  return types[type] || type;
};
