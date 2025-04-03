
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  user_id: string;
  created_at: string;
  read_status: boolean;
  priority: 'low' | 'medium' | 'high';
  related_element_id?: string;
  related_element_type?: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useLanguage();

  // Bildirişləri gətirmək
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      const unread = (data || []).filter(n => !n.read_status).length;
      setUnreadCount(unread);
    } catch (error: any) {
      console.error('Bildirişləri gətirərkən xəta:', error);
      toast.error(t('errorFetchingNotifications'));
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
        .update({ read_status: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read_status: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error('Bildirişi oxunmuş kimi işarələyərkən xəta:', error);
      toast.error(t('errorMarkingNotification'));
    }
  }, [user, t]);

  // Bütün bildirişləri oxunmuş kimi işarələmək
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_status: true })
        .eq('user_id', user.id)
        .eq('read_status', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, read_status: true })));
      setUnreadCount(0);
      toast.success(t('allNotificationsMarkedAsRead'));
    } catch (error: any) {
      console.error('Bütün bildirişləri oxunmuş kimi işarələyərkən xəta:', error);
      toast.error(t('errorMarkingAllNotifications'));
    }
  }, [user, t]);

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

      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (deletedNotification && !deletedNotification.read_status) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast.success(t('notificationDeleted'));
    } catch (error: any) {
      console.error('Bildirişi silməkdə xəta:', error);
      toast.error(t('errorDeletingNotification'));
    }
  }, [user, t, notifications]);

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
    } catch (error: any) {
      console.error('Bütün bildirişləri silməkdə xəta:', error);
      toast.error(t('errorDeletingAllNotifications'));
    }
  }, [user, t]);

  // Real-time abunəlik
  useEffect(() => {
    if (!user?.id) return;

    // İlk yükləmə
    fetchNotifications();

    // Real-time abunəlik
    const subscription = supabase
      .channel('notification_channel')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          console.log('Bildiriş yeniləmə:', payload);
          // Avtomatik yeniləmə əvəzinə yenidən sorğu edək
          fetchNotifications();
        })
      .subscribe();

    // Təmizləmə
    return () => {
      subscription.unsubscribe();
    };
  }, [user, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
  };
};
