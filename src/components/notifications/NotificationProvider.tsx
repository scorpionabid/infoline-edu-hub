import React, { createContext, useContext, ReactNode } from 'react';
import { useNotifications } from '@/hooks/notifications/useNotifications';
import { useAuth } from '@/hooks/auth/useAuth';
import type { UseNotificationsResult } from '@/types/notifications';

const NotificationContext = createContext<UseNotificationsResult | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const notificationData = useNotifications();

  // Only provide notification context if user is authenticated
  if (!user) {
    // Return default empty state for unauthenticated users
    const emptyNotificationData: UseNotificationsResult = {
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,
      markAsRead: async () => {},
      markAllAsRead: async () => {},
      removeNotification: async () => {},
      clearAllNotifications: async () => {},
      refetch: async () => {}
    };

    return (
      <NotificationContext.Provider value={emptyNotificationData}>
        {children}
      </NotificationContext.Provider>
    );
  }

  return (
    <NotificationContext.Provider value={notificationData}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = (): UseNotificationsResult => {
  const context = useContext(NotificationContext);
  if (!context) {
    // Fallback for cases where provider is not available
    console.warn('[useNotificationContext] NotificationProvider not found, returning empty state');
    return {
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,
      markAsRead: async () => {},
      markAllAsRead: async () => {},
      removeNotification: async () => {},
      clearAllNotifications: async () => {},
      refetch: async () => {}
    };
  }
  return context;
};

export default NotificationProvider;