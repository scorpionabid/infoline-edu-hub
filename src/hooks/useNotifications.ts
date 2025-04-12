
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/notifications';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Supabase formatından bizim tipimizə çevirək
      const formattedNotifications: Notification[] = (data || []).map(notification => ({
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

      setNotifications(formattedNotifications);
      
      // Oxunmamış bildirişləri say
      const unread = formattedNotifications.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error: any) {
      console.error('Bildirişlər yüklənərkən xəta:', error.message);
      toast.error('Bildirişlər yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Lokal state-i yenilə
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
      
      // Oxunmamış bildirişləri yenidən say
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error('Bildiriş oxundu kimi işarələnərkən xəta:', error.message);
      toast.error('Bildiriş güncəllənərkən xəta baş verdi');
    }
  }, [user]);

  const markAllAsRead = useCallback(async () => {
    if (!user || notifications.length === 0) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      
      // Lokal state-i yenilə
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      // Oxunmamış bildirişləri sıfırla
      setUnreadCount(0);
      
      toast.success('Bütün bildirişlər oxundu kimi işarələndi');
    } catch (error: any) {
      console.error('Bütün bildirişlər oxundu kimi işarələnərkən xəta:', error.message);
      toast.error('Bildirişlər güncəllənərkən xəta baş verdi');
    }
  }, [user, notifications]);

  const clearAll = useCallback(async () => {
    if (!user || notifications.length === 0) return;
    
    try {
      // Supabase-də silmə məntiqi burada olacaq
      // Bu funksiya gələcəkdə implementasiya edilə bilər
      // API çağırışı deyil, sadəcə UI-dan silmək üçün:
      setNotifications([]);
      setUnreadCount(0);
      
      toast.success('Bütün bildirişlər silindi');
    } catch (error: any) {
      console.error('Bildirişlər silinərkən xəta:', error.message);
      toast.error('Bildirişlər silinərkən xəta baş verdi');
    }
  }, [user, notifications]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  // Real-time bildirişlər üçün Supabase kanalı yaradaq
  useEffect(() => {
    if (!user) return;
    
    // Insert bildirişlərini dinləyək
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Yeni bildiriş:', payload);
          const newNotification = payload.new as any;
          
          // Yeni bildirişi formatlaşdıraq
          const formattedNotification: Notification = {
            id: newNotification.id,
            title: newNotification.title,
            message: newNotification.message,
            createdAt: new Date(newNotification.created_at),
            isRead: newNotification.is_read,
            type: newNotification.type,
            priority: newNotification.priority as 'normal' | 'high' | 'low',
            relatedEntityType: newNotification.related_entity_type,
            relatedEntityId: newNotification.related_entity_id
          };
          
          // Bildirişlər siyahısına əlavə et
          setNotifications(prev => [formattedNotification, ...prev]);
          
          // Oxunmamış bildirişləri say
          if (!formattedNotification.isRead) {
            setUnreadCount(prev => prev + 1);
          }
          
          // Bildiriş göstər
          toast.info(formattedNotification.title, {
            description: formattedNotification.message
          });
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearAll
  };
};
