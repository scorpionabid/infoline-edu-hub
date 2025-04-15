
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Notification, NotificationType } from '@/types/notification';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  // Bildirişləri əldə etmək
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (notificationsError) throw notificationsError;
      
      if (notificationsData) {
        const formattedNotifications: Notification[] = notificationsData.map(notification => ({
          id: notification.id,
          title: notification.title,
          message: notification.message,
          createdAt: notification.created_at,
          isRead: notification.is_read,
          type: notification.type as NotificationType,
          priority: notification.priority || 'normal',
          userId: notification.user_id,
          relatedId: notification.related_entity_id,
          relatedType: notification.related_entity_type,
          time: format(new Date(notification.created_at), 'HH:mm'),
          date: format(new Date(notification.created_at), 'yyyy-MM-dd')
        }));
        
        setNotifications(formattedNotifications);
      }
    } catch (err: any) {
      console.error('Bildirişləri əldə edərkən xəta:', err);
      setError(err);
      
      // Əgər bildirişlər əldə edilə bilməzsə, demo bildirişlər göstərmək
      const demoNotifications: Notification[] = [
        {
          id: '1',
          title: 'Yeni kateqoriya əlavə edildi',
          message: 'Müəllim məlumatları kateqoriyası əlavə edildi. Zəhmət olmasa yoxlayın.',
          type: 'category',
          userId: user?.id || '',
          isRead: false,
          priority: 'normal',
          createdAt: new Date().toISOString(),
          time: format(new Date(), 'HH:mm'),
          date: format(new Date(), 'yyyy-MM-dd')
        },
        {
          id: '2',
          title: 'Son tarix yaxınlaşır',
          message: 'Şagird məlumatları kateqoriyası üçün son tarix 3 gün qalır.',
          type: 'deadline',
          userId: user?.id || '',
          isRead: true,
          priority: 'high',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          time: format(new Date(Date.now() - 86400000), 'HH:mm'),
          date: format(new Date(Date.now() - 86400000), 'yyyy-MM-dd')
        }
      ];
      
      setNotifications(demoNotifications);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Bildirişi oxunmuş kimi işarələmək
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;
    
    try {
      // UI-də bildirişi oxunmuş kimi işarələ
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      // Serverdə bildirişi oxunmuş kimi işarələ
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
    } catch (err) {
      console.error('Bildirişi oxunmuş kimi işarələyərkən xəta:', err);
      toast.error('Bildirişi oxunmuş kimi işarələyərkən xəta baş verdi');
      
      // Xəta zamanı əvvəlki vəziyyətə qaytar
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  // Bütün bildirişləri oxunmuş kimi işarələmək
  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    
    try {
      // UI-də bütün bildirişləri oxunmuş kimi işarələ
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      // Serverdə bütün bildirişləri oxunmuş kimi işarələ
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
        
      if (error) throw error;
      
      toast.success('Bütün bildirişlər oxunmuş kimi işarələndi');
    } catch (err) {
      console.error('Bütün bildirişləri oxunmuş kimi işarələyərkən xəta:', err);
      toast.error('Bildirişləri yeniləyərkən xəta baş verdi');
      
      // Xəta zamanı əvvəlki vəziyyətə qaytar
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  // Bildiriş əlavə etmək
  const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          title: notification.title,
          message: notification.message,
          type: notification.type,
          user_id: notification.userId,
          is_read: false,
          priority: notification.priority,
          related_entity_id: notification.relatedId,
          related_entity_type: notification.relatedType,
          created_at: new Date().toISOString()
        }])
        .select();
        
      if (error) throw error;
      
      // Yeni bildirişi siyahıya əlavə et
      if (data && data.length > 0) {
        const newNotification: Notification = {
          id: data[0].id,
          title: data[0].title,
          message: data[0].message,
          type: data[0].type as NotificationType,
          userId: data[0].user_id,
          isRead: false,
          priority: data[0].priority,
          createdAt: data[0].created_at,
          relatedId: data[0].related_entity_id,
          relatedType: data[0].related_entity_type,
          time: format(new Date(data[0].created_at), 'HH:mm'),
          date: format(new Date(data[0].created_at), 'yyyy-MM-dd')
        };
        
        setNotifications(prev => [newNotification, ...prev]);
      }
      
    } catch (err) {
      console.error('Bildiriş əlavə edərkən xəta:', err);
    }
  }, [user]);

  // İlkin yükləmə
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    addNotification,
    fetchNotifications,
    unreadCount: notifications.filter(n => !n.isRead).length
  };
};
