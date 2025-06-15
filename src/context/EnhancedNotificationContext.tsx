
import React, { createContext, useContext, ReactNode } from 'react';
import {
  AppNotification,
  NotificationFilters,
  NotificationStats
} from '@/types/notification';
import { useEnhancedNotifications } from '@/hooks/notifications/useEnhancedNotifications';

interface EnhancedNotificationContextProps {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const EnhancedNotificationContext = createContext<EnhancedNotificationContextProps | undefined>(undefined);

export const useEnhancedNotificationContext = () => {
  const context = useContext(EnhancedNotificationContext);
  if (!context) {
    throw new Error('useEnhancedNotificationContext must be used within EnhancedNotificationProvider');
  }
  return context;
};

interface EnhancedNotificationProviderProps {
  children: ReactNode;
}

export const EnhancedNotificationProvider: React.FC<EnhancedNotificationProviderProps> = ({ children }) => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch
  } = useEnhancedNotifications();

  return (
    <EnhancedNotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refetch
      }}
    >
      {children}
    </EnhancedNotificationContext.Provider>
  );
};
