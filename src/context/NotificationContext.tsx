
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNotificationsData } from '@/hooks/useNotificationsData';
import { Notification } from '@/types/notification';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  isLoading: boolean; // Alias for loading
  error: Error | null; // Added error field
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
  clearAll: () => Promise<void>; // Alias for deleteAllNotifications
  refreshNotifications: () => Promise<void>; // Alias for fetchNotifications
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotificationsData();

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      isLoading: loading, // Alias for consistency
      error, // Added error field
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      deleteAllNotifications,
      clearAll: deleteAllNotifications, // Alias function
      refreshNotifications: fetchNotifications, // Alias function
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Re-exporting for easier import
export default NotificationProvider;
