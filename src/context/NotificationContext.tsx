
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { AppNotification } from '@/types/notification';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  description?: string;
  isRead: boolean;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  addNotification: (type: NotificationType, message: string, description?: string) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Add notification
  const addNotification = useCallback((type: NotificationType, message: string, description?: string) => {
    const id = Date.now().toString();
    const newNotification: AppNotification = { 
      id, 
      type, 
      message, 
      title: message,
      description, 
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    
    setNotifications((prev) => [...prev, newNotification]);
    
    toast({
      title: message,
      description: description,
      variant: type === 'error' ? 'destructive' : 'default'
    });
    
    return id;
  }, []);

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true } 
          : notification
      )
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        addNotification,
        removeNotification,
        clearNotifications,
        markAsRead,
        markAllAsRead,
        clearAll
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
