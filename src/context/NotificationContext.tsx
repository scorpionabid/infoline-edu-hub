
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Notification, NotificationType, NotificationPriority } from '@/types/notification';
import { useAuth } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (
    type: NotificationType,
    title: string,
    message: string,
    priority?: NotificationPriority,
    relatedEntityId?: string,
    relatedEntityType?: 'category' | 'column' | 'data' | 'user' | 'school'
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  // Əsas state-lər
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // AuthContext-dən istifadəçi məlumatlarını əldə edək
  const { user } = useAuth();
  
  // Yüklənən zaman bildirişləri localStorage-dən oxuyaq
  useEffect(() => {
    if (user) {
      try {
        const savedNotifications = localStorage.getItem(`notifications-${user.id}`);
        if (savedNotifications) {
          setNotifications(JSON.parse(savedNotifications));
        }
      } catch (e) {
        console.error('Failed to parse notifications:', e);
      }
    }
  }, [user]);
  
  // Bildirişlər dəyişəndə localStorage-ə yazaq
  useEffect(() => {
    if (user) {
      localStorage.setItem(`notifications-${user.id}`, JSON.stringify(notifications));
    }
  }, [notifications, user]);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  const addNotification = (
    type: NotificationType,
    title: string,
    message: string,
    priority: NotificationPriority = 'normal',
    relatedEntityId?: string,
    relatedEntityType?: 'category' | 'column' | 'data' | 'user' | 'school'
  ) => {
    if (!user) return;
    
    const createdAt = new Date().toISOString();
    
    const newNotification: Notification = {
      id: uuidv4(),
      type,
      title,
      message,
      userId: user.id,
      isRead: false,
      createdAt,
      time: createdAt, // time xüsusiyyətini əlavə edirik
      priority,
      relatedEntityId,
      relatedEntityType
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };
  
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };
  
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };
  
  const clearAll = () => {
    setNotifications([]);
  };
  
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };
  
  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        removeNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
