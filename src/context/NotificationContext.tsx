
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Notification, NotificationType } from '@/types/notification';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

// Context interface
interface NotificationContextProps {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => string;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  clearAll: () => void; // clearAllNotifications için alias
}

// Default context values
const defaultContext: NotificationContextProps = {
  notifications: [],
  unreadCount: 0,
  addNotification: () => '',
  markAsRead: () => {},
  markAllAsRead: () => {},
  removeNotification: () => {},
  clearAllNotifications: () => {},
  clearAll: () => {} // clearAllNotifications için alias
};

// Create context
const NotificationContext = createContext<NotificationContextProps>(defaultContext);

// Provider component
interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();
  
  const unreadCount = notifications.filter(notification => !notification.isRead).length;
  
  // Fetch notifications from Supabase when user changes
  useEffect(() => {
    const fetchNotifications = async () => {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          
          if (data) {
            const formattedNotifications: Notification[] = data.map(item => ({
              id: item.id,
              userId: item.user_id,
              title: item.title,
              message: item.message || '',
              type: item.type as NotificationType,
              createdAt: item.created_at,
              isRead: item.is_read,
              priority: (item.priority || 'normal') as 'low' | 'normal' | 'high' | 'urgent'
            }));
            
            setNotifications(formattedNotifications);
          }
        } catch (error: any) {
          console.error('Error fetching notifications:', error);
        }
      }
    };
    
    fetchNotifications();
  }, [user]);
  
  // Add a new notification
  const addNotification = (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const newNotification: Notification = {
      id,
      userId: user?.id,
      title: notification.title,
      message: notification.message || '',
      type: notification.type,
      createdAt: now,
      isRead: false,
      priority: notification.priority || 'normal'
    };
    
    // Add to local state
    setNotifications(prev => [newNotification, ...prev]);
    
    // Save to Supabase if user is logged in
    if (user?.id) {
      (async () => {
        try {
          const { error } = await supabase
            .from('notifications')
            .insert({
              id: newNotification.id,
              user_id: user.id,
              title: newNotification.title,
              message: newNotification.message,
              type: newNotification.type,
              is_read: false,
              priority: newNotification.priority,
              created_at: now
            });
          
          if (error) throw error;
        } catch (error: any) {
          console.error('Error saving notification:', error);
        }
      })();
    }
    
    return id;
  };
  
  // Mark a notification as read
  const markAsRead = async (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
    
    if (user?.id) {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', id)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } catch (error: any) {
        console.error('Error marking notification as read:', error);
      }
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
    
    if (user?.id) {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', user.id)
          .is('is_read', false);
        
        if (error) throw error;
      } catch (error: any) {
        console.error('Error marking all notifications as read:', error);
      }
    }
  };
  
  // Remove a notification
  const removeNotification = async (id: string) => {
    setNotifications(prev => 
      prev.filter(notif => notif.id !== id)
    );
    
    if (user?.id) {
      try {
        const { error } = await supabase
          .from('notifications')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } catch (error: any) {
        console.error('Error removing notification:', error);
      }
    }
  };
  
  // Clear all notifications
  const clearAllNotifications = async () => {
    setNotifications([]);
    
    if (user?.id) {
      try {
        const { error } = await supabase
          .from('notifications')
          .delete()
          .eq('user_id', user.id);
        
        if (error) throw error;
      } catch (error: any) {
        console.error('Error clearing notifications:', error);
        toast.error('Bildirişləri təmizləyərkən xəta baş verdi');
      }
    }
  };
  
  // clearAll alias for clearAllNotifications
  const clearAll = clearAllNotifications;
  
  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAllNotifications,
        clearAll
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
