
import { supabase } from '@/integrations/supabase/client';
import { NotificationType } from '@/types/notification';

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: NotificationType = 'info',
  relatedEntityId?: string,
  relatedEntityType?: string
) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        read: false,
        related_entity_id: relatedEntityId,
        related_entity_type: relatedEntityType
      });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const createDeadlineNotification = async (
  title: string,
  message: string,
  categoryId: string
) => {
  try {
    return await createNotification(
      'system', // This will be replaced with actual user ID later
      title,
      message,
      'deadline',
      categoryId,
      'category'
    );
  } catch (error) {
    console.error('Error creating deadline notification:', error);
    throw error;
  }
};

export const createApprovalNotification = async (
  userId: string,
  categoryName: string,
  categoryId: string,
  isApproved: boolean,
  rejectionReason?: string
) => {
  try {
    const title = isApproved 
      ? `"${categoryName}" məlumatları təsdiqləndi`
      : `"${categoryName}" məlumatları rədd edildi`;
    
    const message = isApproved
      ? `"${categoryName}" kateqoriyası üçün təqdim etdiyiniz məlumatlar təsdiqləndi.`
      : `"${categoryName}" kateqoriyası üçün təqdim etdiyiniz məlumatlar rədd edildi. Səbəb: ${rejectionReason || 'Səbəb qeyd edilməyib.'}`;
    
    return await createNotification(
      userId,
      title,
      message,
      'approval',
      categoryId,
      'category'
    );
  } catch (error) {
    console.error('Error creating approval notification:', error);
    throw error;
  }
};

export const getUserNotifications = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Alias for getUserNotifications for backward compatibility
export const getNotifications = getUserNotifications;
