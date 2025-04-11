
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Notification } from '@/types/notification';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { formatNotifications } from '@/hooks/dashboard/notificationUtils';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt' | 'time'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// LanguageSafe hook - dil kontekstinin mövcudluğunu yoxlamadan istifadə üçün
export const useLanguageSafe = () => {
  const context = useLanguage();
  if (!context) {
    return {
      t: (key: string) => key,
      changeLanguage: () => {},
      language: 'az'
    };
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const { t } = useLanguageSafe();
  
  // Bildirişləri bazadan əldə etmək
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      const formattedNotifications = formatNotifications(data || []);
      setNotifications(formattedNotifications);
      
      // Oxunmamış bildirişlərin sayını hesablayaq
      const unread = formattedNotifications.filter(n => !n.isRead).length;
      setUnreadCount(unread);
      
    } catch (error) {
      console.error('Bildirişlər əldə edilərkən xəta:', error);
    }
  }, [user?.id]);
  
  // İstifadəçi dəyişdikdə bildirişləri yeniləyirik
  useEffect(() => {
    fetchNotifications();
    
    // Supabase real-time abunəliyi əlavə edək 
    if (user?.id) {
      const channel = supabase
        .channel('notifications_changes')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          // Yeni bildiriş əlavə olunduqda bildirişləri yeniləyək
          fetchNotifications();
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id, fetchNotifications]);
  
  // Bildirişi oxunmuş kimi işarələ
  const markAsRead = useCallback(async (id: string) => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Lokal state yeniləyək
      setNotifications(prev => prev.map(notification => 
        notification.id === id ? { ...notification, isRead: true } : notification
      ));
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (error) {
      console.error('Bildiriş oxunmuş kimi işarələnərkən xəta:', error);
    }
  }, [user?.id]);
  
  // Bütün bildirişləri oxunmuş kimi işarələ
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      if (error) throw error;
      
      // Lokal state yeniləyək
      setNotifications(prev => prev.map(notification => ({ ...notification, isRead: true })));
      setUnreadCount(0);
      
    } catch (error) {
      console.error('Bütün bildirişlər oxunmuş kimi işarələnərkən xəta:', error);
    }
  }, [user?.id]);
  
  // Bütün bildirişləri təmizlə
  const clearAll = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      // Bazadan silmək əvəzinə is_read=true qoymaq daha uyğundur
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Lokal state təmizləyək
      setNotifications([]);
      setUnreadCount(0);
      
    } catch (error) {
      console.error('Bildirişlər təmizlənərkən xəta:', error);
    }
  }, [user?.id]);
  
  // Yeni bildiriş əlavə et
  const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt' | 'time'>) => {
    if (!user?.id) return;
    
    try {
      const newNotification = {
        user_id: user.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority || 'normal',
        is_read: false,
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('notifications')
        .insert(newNotification)
        .select('*')
        .single();
      
      if (error) throw error;
      
      // Bildirişləri yenidən əldə et
      fetchNotifications();
      
    } catch (error) {
      console.error('Bildiriş əlavə edilərkən xəta:', error);
    }
  }, [user?.id, fetchNotifications]);
  
  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    addNotification
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
