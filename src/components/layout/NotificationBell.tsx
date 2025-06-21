
import React from 'react';
import NotificationControl from '@/components/notifications/NotificationControl';
import { useNotificationContext } from '@/components/notifications/NotificationProvider';

export const NotificationBell: React.FC = () => {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    clearAll
  } = useNotificationContext();

  return (
    <NotificationControl
      notifications={notifications}
      onMarkAsRead={markAsRead}
      onMarkAllAsRead={markAllAsRead}
      onClearAll={clearAll}
    />
  );
};

export default NotificationBell;
