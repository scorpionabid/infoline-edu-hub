import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification, NotificationType } from '@/types/notification';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  loading: boolean;
  error: Error | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      const formattedNotifications = data.map(notification => ({
        id: notification.id,
        type: notification.type as NotificationType,
        title: notification.title,
        message: notification.message,
        createdAt: notification.created_at,
        time: new Date(notification.created_at).toLocaleTimeString(),
        isRead: notification.is_read,
        userId: notification.user_id,
        priority: notification.priority,
        read_status: notification.is_read,
        relatedEntityId: notification.related_entity_id,
        relatedEntityType: notification.related_entity_type
      }));
      
      setNotifications(formattedNotifications);
      setUnreadCount(formattedNotifications.filter(n => !n.isRead).length);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err);
      toast.error('Bildirişlər yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true,
          read_status: true
        })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, isRead: true, read_status: true } 
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      toast.error('Bildiriş oxundu olaraq işarələnərkən xəta baş verdi');
    }
  };

  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true,
          read_status: true
        })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true, read_status: true }))
      );
      
      setUnreadCount(0);
      toast.success('Bütün bildirişlər oxundu olaraq işarələndi');
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
      toast.error('Bildirişlər oxundu olaraq işarələnərkən xəta baş verdi');
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Real-time notification subscription
      const notificationSubscription = supabase
        .channel('public:notifications')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          }, 
          payload => {
            const newNotification = {
              id: payload.new.id,
              type: payload.new.type as NotificationType,
              title: payload.new.title,
              message: payload.new.message,
              createdAt: payload.new.created_at,
              time: new Date(payload.new.created_at).toLocaleTimeString(),
              isRead: false,
              userId: payload.new.user_id,
              priority: payload.new.priority,
              read_status: false,
              relatedEntityId: payload.new.related_entity_id,
              relatedEntityType: payload.new.related_entity_type
            };
            
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            toast.info(newNotification.title, {
              description: newNotification.message,
              action: {
                label: 'Göstər',
                onClick: () => markAsRead(newNotification.id)
              }
            });
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(notificationSubscription);
      };
    }
  }, [user]);

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    loading,
    error
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
