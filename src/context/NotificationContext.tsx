
import React, { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  description?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (type: NotificationType, message: string, description?: string) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (type: NotificationType, message: string, description?: string) => {
    const id = Date.now().toString();
    const newNotification = { id, type, message, description };
    
    setNotifications((prev) => [...prev, newNotification]);
    
    // Also show a toast for immediate feedback
    switch (type) {
      case 'success':
        toast.success(message, { description });
        break;
      case 'error':
        toast.error(message, { description });
        break;
      case 'warning':
        toast.warning(message, { description });
        break;
      case 'info':
      default:
        toast.info(message, { description });
    }
    
    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
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
