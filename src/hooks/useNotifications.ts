
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Notification } from '@/types/notifications';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      const formattedNotifications: Notification[] = data.map(notification => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        createdAt: new Date(notification.created_at),
        isRead: notification.is_read,
        type: notification.type,
        priority: notification.priority || 'normal',
        relatedEntityType: notification.related_entity_type,
        relatedEntityId: notification.related_entity_id
      }));
      
      setNotifications(formattedNotifications);
      
      // Oxunmamış bildirişlərin sayını hesablayırıq
      const unread = formattedNotifications.filter(notification => !notification.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Bildirişlər əldə edilərkən xəta:', error);
      toast.error('Bildirişlər əldə edilərkən xəta');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);
  
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
      
      // Bildirişləri yeniləyirik
      setNotifications(prev => prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true } 
          : notification
      ));
      
      // Oxunmamış bildirişlərin sayını azaldırıq
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Bildiriş oxundu kimi işarələnərkən xəta:', error);
      toast.error('Bildiriş oxundu kimi işarələnərkən xəta');
    }
  }, []);
  
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      if (error) throw error;
      
      // Bütün bildirişləri oxunmuş kimi işarələyirik
      setNotifications(prev => prev.map(notification => ({ ...notification, isRead: true })));
      setUnreadCount(0);
      
      toast.success('Bütün bildirişlər oxundu');
    } catch (error) {
      console.error('Bütün bildirişlər oxundu kimi işarələnərkən xəta:', error);
      toast.error('Bütün bildirişlər oxundu kimi işarələnərkən xəta');
    }
  }, [user?.id]);
  
  const clearAll = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Bütün bildirişləri təmizləyirik
      setNotifications([]);
      setUnreadCount(0);
      
      toast.success('Bütün bildirişlər təmizləndi');
    } catch (error) {
      console.error('Bildirişlər təmizlənərkən xəta:', error);
      toast.error('Bildirişlər təmizlənərkən xəta');
    }
  }, [user?.id]);
  
  // İlk dəfə bildirişləri əldə edirik
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id, fetchNotifications]);
  
  // Realtime bildirişlər üçün kanalı dinləyirik
  useEffect(() => {
    if (!user?.id) return;
    
    // Realtime kanal yaradırıq
    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        const newNotification = payload.new as any;
        
        // Yeni bildirişi əlavə edirik
        const formattedNotification: Notification = {
          id: newNotification.id,
          title: newNotification.title,
          message: newNotification.message,
          createdAt: new Date(newNotification.created_at),
          isRead: newNotification.is_read,
          type: newNotification.type,
          priority: newNotification.priority || 'normal',
          relatedEntityType: newNotification.related_entity_type,
          relatedEntityId: newNotification.related_entity_id
        };
        
        setNotifications(prev => [formattedNotification, ...prev].slice(0, 20));
        setUnreadCount(prev => prev + 1);
        
        // Yüksək prioritetli bildirişlər üçün toast göstəririk
        if (newNotification.priority === 'high') {
          toast.info(newNotification.title, {
            description: newNotification.message
          });
        }
      })
      .subscribe();
    
    // Təmizləmə
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);
  
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
