
import React, { createContext, useContext, ReactNode } from 'react';
import { useNotifications as useNotificationsHook } from '@/hooks/useNotifications';
import { Notification } from '@/types/notification';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: Error | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  addNotification?: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => Promise<Notification | null>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const notificationsData = useNotificationsHook();
  
  return (
    <NotificationContext.Provider value={notificationsData}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
