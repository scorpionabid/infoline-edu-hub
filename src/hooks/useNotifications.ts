
import { useContext } from 'react';
import { NotificationContext } from '@/context/NotificationContext';
import { AppNotification, NotificationType } from '@/types/notification';

export type NotificationContextType = {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  error: Error | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  addNotification: (notification: Partial<AppNotification>) => Promise<void>;
  refreshNotifications: () => Promise<void>;
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default useNotifications;
