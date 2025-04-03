
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification } from '@/types/notification';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  isLoading: boolean;
  error: Error | null;
  refreshNotifications: () => Promise<void>;
  clearAll: () => void; // clearAll funksiyası əlavə edildi
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
  isLoading: false,
  error: null,
  refreshNotifications: async () => {},
  clearAll: () => {}, // clearAll funksiyası əlavə edildi
});

export const useNotificationContext = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    isLoading, 
    error, 
    refreshNotifications 
  } = useNotifications();

  const clearAll = () => {
    // Bu funksiya provayderdə qeyd edilib
    console.log("Bütün bildirimlər silinir");
    // Burada bütün bildirişləri silmək üçün əlavə kodlar əlavə edilə bilər
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      markAsRead, 
      markAllAsRead, 
      isLoading, 
      error, 
      refreshNotifications,
      clearAll // clearAll funksiyası əlavə edildi 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
