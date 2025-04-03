
// Mövcud kontekstin başlanğıcını saxlayırıq
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification, NotificationType } from '@/types/notification';
import { mockNotifications, getMockNotifications } from '@/data/mock/mockNotifications';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  fetchNotifications: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  clearAll: async () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  // Bildiriş sayını hesablayır
  const unreadCount = React.useMemo(() => {
    return notifications.filter(notification => !notification.isRead).length;
  }, [notifications]);

  // Bildirişləri yükləmə funksiyası
  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      // Supabase'dən bildirişləri əldə et
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Format bildirişləri
      const formattedNotifications = (data || []).map(item => ({
        id: item.id,
        type: item.type as NotificationType,
        title: item.title,
        message: item.message,
        createdAt: item.created_at,
        time: new Date(item.created_at).toLocaleTimeString(),
        isRead: item.is_read,
        userId: item.user_id,
        priority: item.priority,
        read_status: item.is_read,
        relatedEntityId: item.related_entity_id,
        relatedEntityType: item.related_entity_type
      }));
      
      setNotifications(formattedNotifications as Notification[]);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Mock data ilə doldurulan zaman
      const mockData = getMockNotifications();
      setNotifications(mockData);
    }
  };

  // Bildirişi oxunmuş kimi işarələmək
  const markAsRead = async (id: string) => {
    try {
      // Supabase-də yenilə
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_status: true })
        .eq('id', id);
      
      if (error) throw error;
      
      // Lokal state yenilə
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, isRead: true, read_status: true } : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Bütün bildirişləri oxunmuş kimi işarələmək
  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;
    
    try {
      // Supabase-də yenilə
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_status: true })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Lokal state yenilə
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true, read_status: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };
  
  // Bütün bildirişləri təmizləmək
  const clearAll = async () => {
    if (!user || notifications.length === 0) return;
    
    try {
      // Arxivləşdirmə və ya silmə əməliyyatı üçün Supabase-i istifadə edə bilərsiniz
      // Burada sadəcə state'i təmizləyirik
      setNotifications([]);
      
      // Faktiki silmə əməliyyatını backenddə həyata keçirmək üçün:
      // await supabase.from('notifications').delete().eq('user_id', user.id);
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
    }
  };

  // İlk dəfə komponent render olunduqda bildirişləri yüklə
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  return (
    <NotificationContext.Provider 
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        clearAll
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
