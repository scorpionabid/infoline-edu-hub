
import { useContext } from 'react';
import { NotificationContext, NotificationContextType } from '@/context/NotificationContext';
import { AppNotification, NotificationType } from '@/types/notification';

export { NotificationContextType };

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default useNotifications;
