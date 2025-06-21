
import { useState, useEffect } from 'react';
import { AppNotification } from '@/types/notification';

export interface UseNotificationsResult {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotifications = (userId?: string): UseNotificationsResult => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, is_read: true }))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  useEffect(() => {
    // Mock data for now
    if (userId) {
      setIsLoading(true);
      setTimeout(() => {
        setNotifications([]);
        setIsLoading(false);
      }, 500);
    }
  }, [userId]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    clearAll
  };
};
