
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/notification';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

// Supabase-dən gələn bildiriş obyektini adaptasiya etmək üçün funksiya
const adaptNotification = (item: any): Notification => ({
  id: item.id,
  type: item.type,
  title: item.title,
  message: item.message,
  priority: item.priority || 'normal',
  userId: item.user_id,
  createdAt: item.created_at,
  isRead: item.is_read,
  time: item.created_at,
  read_status: item.is_read, // is_read və read_status hər ikisini əlavə edirik geriyə uyğunluq üçün
  relatedEntityId: item.related_entity_id || '',
  relatedEntityType: item.related_entity_type || ''
});

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { t } = useLanguage();
  const { user } = useAuth();

  // Bildirişləri gətirmək
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (error) throw error;
      
      // Supabase-dən gələn bildirişləri adaptasiya et
      const adaptedNotifications = data.map(item => adaptNotification(item));
      
      setNotifications(adaptedNotifications);
      const unread = adaptedNotifications.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err: any) {
      console.error('Bildirişləri gətirərkən xəta:', err);
      setError(err);
      toast.error(t('errorLoadingNotifications'));
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  // Bildirişi oxunmuş kimi işarələmək
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true,
        })
        .eq('id', notificationId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Lokal vəziyyəti yenilə
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true, read_status: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Bildirişi oxunmuş kimi işarələyərkən xəta:', err);
      setError(err);
      toast.error(t('errorMarkingNotification'));
    }
  }, [user, t]);
  
  // Bütün bildirişləri oxunmuş kimi işarələmək
  const markAllAsRead = useCallback(async () => {
    if (!user?.id || unreadCount === 0) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
        
      if (error) throw error;
      
      // Lokal vəziyyəti yenilə
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read_status: true })));
      setUnreadCount(0);
      toast.success(t('allNotificationsRead'));
    } catch (err: any) {
      console.error('Bütün bildirişləri oxunmuş kimi işarələyərkən xəta:', err);
      setError(err);
      toast.error(t('errorMarkingAllNotifications'));
    }
  }, [user, unreadCount, t]);
  
  // Bildirişi silmək
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Əgər silinən bildiriş oxunmamış idisə, oxunmamış sayını azalt
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast.success(t('notificationDeleted'));
    } catch (err: any) {
      console.error('Bildirişi silməkdə xəta:', err);
      setError(err);
      toast.error(t('errorDeletingNotification'));
    }
  }, [user, notifications, t]);
  
  // Bütün bildirişləri silmək
  const deleteAllNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setNotifications([]);
      setUnreadCount(0);
      toast.success(t('allNotificationsDeleted'));
    } catch (err: any) {
      console.error('Bütün bildirişləri silməkdə xəta:', err);
      setError(err);
      toast.error(t('errorDeletingAllNotifications'));
    }
  }, [user, t]);
  
  // İstifadəçi dəyişdikdə bildirişləri yenilə
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, fetchNotifications]);
  
  // Real-time bildirişlər üçün abunəlik
  useEffect(() => {
    if (!user?.id) return;
    
    const subscription = supabase
      .channel('notification_updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, 
        () => {
          fetchNotifications();
        })
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [user, fetchNotifications]);
  
  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refreshNotifications: fetchNotifications,
    clearAll: deleteAllNotifications,
    isLoading: loading
  };
};

export default useNotifications;
