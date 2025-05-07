import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { NotificationType, adaptDashboardNotificationToApp } from '@/types/notification';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  // Bildirişləri əldə et
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (supabaseError) throw supabaseError;
      
      if (data) {
        // Bildirişləri tətbiq formatına çevir
        const appNotifications = data.map(notification => adaptDashboardNotificationToApp(notification));
        
        setNotifications(appNotifications);
        
        // Oxunmamış bildiriş sayını hesabla
        const unread = appNotifications.filter(notification => !notification.isRead).length;
        setUnreadCount(unread);
      }
    } catch (err: any) {
      console.error('Bildirişləri əldə edərkən xəta:', err);
      setError(err);
      toast({
        title: t('error'),
        description: t('errorFetchingNotifications'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, t, toast]);
  
  // Komponent yükləndikdə bildirişləri əldə et
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);
  
  // Bildirişi oxunmuş kimi işarələ
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;
    
    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);
      
      if (updateError) throw updateError;
      
      // Bildirişi yerli olaraq yenilə
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
      
      // Oxunmamış sayını azalt
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (err: any) {
      console.error('Bildirişi oxunmuş kimi işarələrkən xəta:', err);
      toast({
        title: t('error'),
        description: t('errorMarkingNotificationAsRead'),
        variant: 'destructive',
      });
    }
  }, [user, t, toast]);
  
  // Bütün bildirişləri oxunmuş kimi işarələ
  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    
    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      if (updateError) throw updateError;
      
      // Bütün bildirişləri yerli olaraq yenilə
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      // Oxunmamış sayını sıfırla
      setUnreadCount(0);
      
    } catch (err: any) {
      console.error('Bütün bildirişləri oxunmuş kimi işarələrkən xəta:', err);
      toast({
        title: t('error'),
        description: t('errorMarkingAllNotificationsAsRead'),
        variant: 'destructive',
      });
    }
  }, [user, t, toast]);
  
  // Yeni bildiriş əlavə et
  const addNotification = useCallback(async (notification: Omit<NotificationType, "id" | "createdAt" | "isRead">) => {
    if (!user) return;
    
    try {
      const newNotification = {
        user_id: user.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority,
        is_read: false,
        related_entity_id: notification.relatedEntityId,
        related_entity_type: notification.relatedEntityType,
        created_at: new Date().toISOString()
      };
      
      const { data, error: insertError } = await supabase
        .from('notifications')
        .insert(newNotification)
        .select();
      
      if (insertError) throw insertError;
      
      if (data && data.length > 0) {
        // Yeni bildirişi yerli olara əlavə et
        const appNotification = adaptDashboardNotificationToApp(data[0]);
        
        setNotifications(prev => [appNotification, ...prev]);
        
        // Oxunmamış sayını artır
        setUnreadCount(prev => prev + 1);
        
        return appNotification;
      }
    } catch (err: any) {
      console.error('Bildiriş əlavə edərkən xəta:', err);
      toast({
        title: t('error'),
        description: t('errorAddingNotification'),
        variant: 'destructive',
      });
    }
  }, [user, t, toast]);
  
  // Bildirişləri təmizlə
  const clearAll = useCallback(async () => {
    if (!user) return;
    
    try {
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);
      
      if (deleteError) throw deleteError;
      
      // Bildirişləri yerli olaraq təmizlə
      setNotifications([]);
      setUnreadCount(0);
      
    } catch (err: any) {
      console.error('Bildirişləri təmizlərkən xəta:', err);
      toast({
        title: t('error'),
        description: t('errorClearingNotifications'),
        variant: 'destructive',
      });
    }
  }, [user, t, toast]);
  
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
