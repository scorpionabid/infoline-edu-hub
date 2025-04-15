
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Notification, NotificationPriority, NotificationType } from '@/types/notification';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, createNotification } from '@/services/notificationService';
import { format, parseISO } from 'date-fns';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await getNotifications(user.id);
      
      // Əmin olaq ki, bütün notification-lar düzgün formata malikdir
      const formattedNotifications = data.map(notification => {
        // API-dən gələn bildirişləri Notification tipinə uyğunlaşdırırıq
        return {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          createdAt: notification.created_at || new Date().toISOString(),
          isRead: notification.is_read || false,
          type: notification.type as NotificationType,
          priority: (notification.priority || 'normal') as NotificationPriority,
          userId: notification.user_id || user.id,
          relatedId: notification.related_entity_id,
          relatedType: notification.related_entity_type,
          // Əgər date və time yoxdursa, createdAt-dan çıxarırıq
          date: notification.date || format(parseISO(notification.created_at || new Date().toISOString()), 'yyyy-MM-dd'),
          time: notification.time || format(parseISO(notification.created_at || new Date().toISOString()), 'HH:mm')
        } as Notification;
      });
      
      setNotifications(formattedNotifications);
      setError(null);
    } catch (err: any) {
      console.error('Bildirişləri əldə edərkən xəta:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [user, fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;

    try {
      const success = await markNotificationAsRead(notificationId, user.id);
      
      if (success) {
        setNotifications(prev => prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true } 
            : notification
        ));
      }
    } catch (err) {
      console.error('Bildirişi oxunmuş kimi işarələmə xətası:', err);
    }
  }, [user]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      const success = await markAllNotificationsAsRead(user.id);
      
      if (success) {
        setNotifications(prev => prev.map(notification => ({ ...notification, isRead: true })));
      }
    } catch (err) {
      console.error('Bütün bildirişləri oxunmuş kimi işarələmə xətası:', err);
    }
  }, [user]);

  const clearAll = useCallback(async () => {
    // Bu metod serverə məlumat göndərmək yerinə, sadəcə client tərəfdə bildirişləri silir
    // (Real API tərəfindən təmin edilmədikdə)
    setNotifications([]);
    
    // Burada bildirişləri silmək üçün serverə sorğu göndərilə bilər
    // TODO: Bildirişləri silmək üçün API metodu əlavə etmək
    
    toast.success('Bütün bildirişlər silindi');
    
    return Promise.resolve();
  }, []);

  const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    if (!user) return null;

    try {
      const now = new Date();
      
      // API-yə bildiriş yaratmaq üçün sorğu göndəririk
      const createdNotification = await createNotification(
        {
          title: notification.title,
          message: notification.message,
          type: notification.type,
          priority: notification.priority || 'normal' as NotificationPriority,
          userId: user.id,
          relatedId: notification.relatedId,
          relatedType: notification.relatedType,
          time: notification.time || format(now, 'HH:mm'),
          date: notification.date || format(now, 'yyyy-MM-dd')
        }, 
        user.id
      );
      
      if (createdNotification) {
        setNotifications(prev => [createdNotification, ...prev]);
        return createdNotification;
      }
      
      return null;
    } catch (err) {
      console.error('Bildiriş yaratma xətası:', err);
      return null;
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearAll,
    addNotification,
    unreadCount
  };
};
