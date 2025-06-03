
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AppNotification } from '@/types/notification';
import { toast } from 'sonner';

interface EnhancedNotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  addNotification: (notification: Partial<AppNotification>) => void;
}

const EnhancedNotificationContext = createContext<EnhancedNotificationContextType | undefined>(undefined);

export const useEnhancedNotifications = () => {
  const context = useContext(EnhancedNotificationContext);
  if (!context) {
    throw new Error('useEnhancedNotifications must be used within an EnhancedNotificationProvider');
  }
  return context;
};

export const EnhancedNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Mock notifications for development
  const mockNotifications: AppNotification[] = [
    {
      id: '1',
      title: 'Yeni məlumat daxiletməsi tələb olunur',
      message: 'Azərbaycan Dövlət Universitet Məktəbi üçün məlumatları doldurmanız tələb olunur.',
      type: 'info',
      priority: 'normal',
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedEntityId: '1',
      relatedEntityType: 'school'
    },
    {
      id: '2',
      title: 'Son tarix yaxınlaşır',
      message: 'Məlumat daxiletməsi üçün son tarix 3 gün qalıb.',
      type: 'warning',
      priority: 'high',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      relatedEntityId: '2',
      relatedEntityType: 'deadline'
    }
  ];

  const refreshNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setNotifications(mockNotifications);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('Bütün bildirişlər oxunmuş kimi işarələndi');
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      setNotifications([]);
      toast.success('Bütün bildirişlər silindi');
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Bildiriş silindi');
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  }, []);

  const addNotification = useCallback((notification: Partial<AppNotification>) => {
    const newNotification: AppNotification = {
      id: Date.now().toString(),
      title: notification.title || 'Yeni bildiriş',
      message: notification.message || '',
      type: notification.type || 'info',
      priority: notification.priority || 'normal',
      isRead: false,
      createdAt: new Date().toISOString(),
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    toast.success('Yeni bildiriş əlavə edildi');
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const value: EnhancedNotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    clearAll,
    deleteNotification,
    refreshNotifications,
    addNotification
  };

  return (
    <EnhancedNotificationContext.Provider value={value}>
      {children}
    </EnhancedNotificationContext.Provider>
  );
};

export default EnhancedNotificationProvider;
