
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Notification, NotificationType, NotificationEntityType } from '@/types/notification';
import { useAuth } from '@/context/AuthContext';
import { formatTimeFromNow } from '@/utils/formatTimeFromNow';

export const useNotificationsData = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Bildirişləri əldə et
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);
      
      if (error) throw error;
      
      // Məlumatları uyğunlaşdırın
      const adaptedNotifications: Notification[] = data.map(item => ({
        id: item.id,
        type: item.type as NotificationType,
        title: item.title,
        message: item.message || '',
        priority: item.priority || 'normal',
        userId: item.user_id,
        createdAt: item.created_at,
        isRead: item.is_read || false,
        time: formatTimeFromNow(item.created_at),
        relatedEntityId: item.related_entity_id || '',
        relatedEntityType: item.related_entity_type as NotificationEntityType || 'system',
      }));
      
      setNotifications(adaptedNotifications);
      
      // Oxunmamış bildirişləri hesablayın
      const unreadNotifications = data.filter(item => !item.is_read);
      setUnreadCount(unreadNotifications.length);
      
    } catch (err) {
      console.error('Bildirişlər alınarkən xəta baş verdi:', err);
      setError(err instanceof Error ? err : new Error('Bildirişlər alınarkən xəta baş verdi'));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);
  
  // Oxunmamış bildiriş sayını alın
  const getUnreadCount = useCallback(async () => {
    if (!user?.id) return 0;
    
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      if (error) throw error;
      
      setUnreadCount(count || 0);
      return count || 0;
      
    } catch (err) {
      console.error('Oxunmamış bildirişlər sayılarkən xəta baş verdi:', err);
      return 0;
    }
  }, [user?.id]);
  
  // Bildirişi oxundu kimi işarələyin
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
      
      // Lokalda bildiriş statusunu yeniləyin
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
      
      // Oxunmamış sayını yeniləyin
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (err) {
      console.error('Bildirişi oxundu kimi işarələyərkən xəta baş verdi:', err);
    }
  }, []);
  
  // Bütün bildirişləri oxundu kimi işarələyin
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      if (error) throw error;
      
      // Lokalda bildiriş statuslarını yeniləyin
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      // Oxunmamış sayını sıfırlayın
      setUnreadCount(0);
      
    } catch (err) {
      console.error('Bütün bildirişləri oxundu kimi işarələyərkən xəta baş verdi:', err);
    }
  }, [user?.id]);
  
  // Bütün bildirişləri silin
  const clearAllNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      // Bildirişləri silinməmiş kimi işarələ (real silmə əvəzinə)
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Lokalda bildirişləri təmizləyin
      setNotifications([]);
      setUnreadCount(0);
      
    } catch (err) {
      console.error('Bildirişlər təmizlənərkən xəta baş verdi:', err);
    }
  }, [user?.id]);
  
  // Yeni bildiriş yaratma
  const createNotification = useCallback(async (notification: Omit<Notification, 'id' | 'createdAt' | 'time' | 'isRead'>) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          type: notification.type,
          title: notification.title,
          message: notification.message,
          priority: notification.priority || 'normal',
          user_id: notification.userId,
          is_read: false,
          related_entity_id: notification.relatedEntityId,
          related_entity_type: notification.relatedEntityType || 'system'
        });
      
      if (error) throw error;
      
      // Bildirişləri yeniləyin
      await fetchNotifications();
      
    } catch (err) {
      console.error('Bildiriş yaradılarkən xəta baş verdi:', err);
    }
  }, [fetchNotifications]);

  // İlk yükləmədə bildirişləri alın
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    createNotification,
    getUnreadCount
  };
};

export default useNotificationsData;
