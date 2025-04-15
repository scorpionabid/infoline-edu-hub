
import { useState, useEffect } from 'react';
import { Notification, NotificationType, NotificationPriority, adaptDbNotificationToApp } from '@/types/notification';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw new Error(error.message);
      
      const formattedNotifications = data.map((notification) => adaptDbNotificationToApp(notification));
      
      setNotifications(formattedNotifications);
    } catch (err: any) {
      console.error('Bildirişləri əldə etmə xətası:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Bildirişləri real-vaxt rejimində dinlə
      const subscription = supabase
        .channel('notifications-channel')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          // Yeni bildiriş gəldikdə, onu əlavə et
          const newNotification = adaptDbNotificationToApp(payload.new);
          setNotifications(prev => [newNotification, ...prev]);
          
          // Bildiriş göstər
          toast({
            title: newNotification.title,
            description: newNotification.message
          });
        })
        .subscribe();
      
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, toast]);

  // Bildirişi oxunmuş kimi işarələ
  const markAsRead = async (notificationId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);
      
      if (error) throw new Error(error.message);
      
      // İnterfeysi yenilə
      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true } 
          : notification
      ));
    } catch (err: any) {
      console.error('Bildirişi oxunmuş kimi işarələmə xətası:', err);
    }
  };

  // Bütün bildirişləri oxunmuş kimi işarələ
  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id);
      
      if (error) throw new Error(error.message);
      
      // İnterfeysi yenilə
      setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
    } catch (err: any) {
      console.error('Bildirişləri oxunmuş kimi işarələmə xətası:', err);
    }
  };

  // Yeni bildiriş əlavə et
  const addNotification = async (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    if (!user) return null;
    
    try {
      const notificationData = {
        user_id: user.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority,
        related_entity_id: notification.relatedId,
        related_entity_type: notification.relatedType,
        is_read: false,
      };
      
      const { data, error } = await supabase
        .from('notifications')
        .insert([notificationData])
        .select();
      
      if (error) throw new Error(error.message);
      
      const newNotification = adaptDbNotificationToApp(data?.[0]);
      setNotifications(prev => [newNotification, ...prev]);
      
      return newNotification;
    } catch (err: any) {
      console.error('Bildiriş əlavə etmə xətası:', err);
      return null;
    }
  };

  // Bütün bildirişləri təmizlə
  const clearAll = async () => {
    if (!user) return;
    
    try {
      // Bu funksionallıq tam həyata keçirilməyib, hələlik oxunmuş kimi işarələyəcəyik
      await markAllAsRead();
      toast({
        title: 'Bütün bildirişlər oxundu',
        description: 'Bildirişlər oxunmuş kimi işarələndi'
      });
    } catch (err: any) {
      console.error('Bildirişləri təmizləmə xətası:', err);
    }
  };

  // Oxunmamış bildirişlərin sayı
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    addNotification,
    fetchNotifications,
    unreadCount,
    clearAll
  };
};

export default useNotifications;
