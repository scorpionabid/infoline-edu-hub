
import { useState, useEffect } from 'react';

export interface UseNotificationsResult {
  notifications: any[];
  isLoading: boolean;
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

export const useNotifications = (): UseNotificationsResult => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, is_read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
  };

  return {
    notifications,
    isLoading,
    unreadCount: notifications.filter(n => !n.is_read).length,
    markAsRead,
    markAllAsRead
  };
};
