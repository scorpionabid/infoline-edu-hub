
import React, { createContext, useContext, ReactNode } from 'react';
import { useNotifications, UseNotificationsResult } from '@/hooks/notifications/useNotifications';

const NotificationContext = createContext<UseNotificationsResult | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const notificationData = useNotifications();

  return (
    <NotificationContext.Provider value={notificationData}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = (): UseNotificationsResult => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
};

export default NotificationProvider;
