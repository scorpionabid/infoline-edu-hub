
import React, { createContext, useContext, ReactNode } from 'react';
import { useEnhancedNotifications } from '@/hooks/notifications/useEnhancedNotifications';

interface EnhancedNotificationContextType {
  notifications: any[];
  unreadCount: number;
  isLoading: boolean;
  error: any;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  refreshNotifications: () => void;
}

const EnhancedNotificationContext = createContext<EnhancedNotificationContextType | undefined>(undefined);

export const EnhancedNotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const notificationData = useEnhancedNotifications();

  return (
    <EnhancedNotificationContext.Provider value={notificationData}>
      {children}
    </EnhancedNotificationContext.Provider>
  );
};

export const useEnhancedNotifications = () => {
  const context = useContext(EnhancedNotificationContext);
  if (!context) {
    // Return default values if context is not available
    return {
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,
      markAsRead: () => {},
      markAllAsRead: () => {},
      clearAll: () => {},
      refreshNotifications: () => {}
    };
  }
  return context;
};
