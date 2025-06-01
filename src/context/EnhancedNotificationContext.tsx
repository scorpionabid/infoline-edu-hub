import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { AppNotification, adaptDashboardNotificationToApp, adaptNotificationForDatabase } from '@/types/notification';
import { EnhancedNotificationService } from '@/services/notifications/enhancedNotificationService';
import { RealtimeNotificationService, ConnectionStatus } from '@/services/notifications/realtimeService';
import { useToast } from '@/components/ui/use-toast';

// Enhanced Context type definition
interface EnhancedNotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  connectionStatus: ConnectionStatus;
  isLoading: boolean;
  error: Error | null;
  
  // Core notification actions
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  addNotification: (notification: Partial<AppNotification>) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  
  // Enhanced actions
  refreshNotifications: () => Promise<void>;
  getNotificationsByType: (type: string) => AppNotification[];
  getNotificationsByPriority: (priority: string) => AppNotification[];
  
  // Preferences management
  preferences: any;
  updatePreferences: (prefs: Partial<any>) => Promise<void>;
  
  // Analytics
  getAnalytics: () => Promise<any>;
  
  // Connection management
  reconnect: () => Promise<void>;
}

// Create the enhanced notification context
const EnhancedNotificationContext = createContext<EnhancedNotificationContextType>({
  notifications: [],
  unreadCount: 0,
  connectionStatus: { isConnected: false, status: 'DISCONNECTED', reconnectCount: 0 },
  isLoading: false,
  error: null,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  clearAll: async () => {},
  addNotification: async () => {},
  deleteNotification: async () => {},
  refreshNotifications: async () => {},
  getNotificationsByType: () => [],
  getNotificationsByPriority: () => [],
  preferences: {},
  updatePreferences: async () => {},
  getAnalytics: async () => ({}),
  reconnect: async () => {}
});

export const useEnhancedNotifications = () => useContext(EnhancedNotificationContext);

export const EnhancedNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    status: 'DISCONNECTED',
    reconnectCount: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [preferences, setPreferences] = useState<any>({});
  
  const user = useAuthStore(selectUser);
  const { toast } = useToast();
  const realtimeSubscriptionRef = useRef<any>(null);
  
  // Enhanced fetch notifications with better error handling
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100); // Limit to prevent performance issues
      
      if (fetchError) {
        throw new Error(fetchError.message);
      }
      
      // Convert DB notification format to app format
      const appNotifications = data?.map(adaptDashboardNotificationToApp) || [];
      
      setNotifications(appNotifications);
      setUnreadCount(appNotifications.filter(n => !(n.isRead || n.is_read)).length);
      
      // Show toast for new notifications (only on refresh, not initial load)
      if (notifications.length > 0) {
        const newNotifications = appNotifications.filter(n => 
          !notifications.find(existing => existing.id === n.id) && !(n.isRead || n.is_read)
        );
        
        if (newNotifications.length > 0) {
          toast({
            title: `${newNotifications.length} yeni bildiriş`,
            description: newNotifications[0]?.title || 'Yeni bildirişiniz var',
            duration: 3000
          });
        }
      }
      
    } catch (error) {
      console.error('Error fetching notifications:', error);
      const err = error instanceof Error ? error : new Error('Unknown error fetching notifications');
      setError(err);
      
      toast({
        title: 'Bildirişlər yüklənərkən xəta',
        description: err.message,
        variant: 'destructive',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, notifications.length, toast]);
  
  // Fetch user preferences
  const fetchPreferences = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const prefs = await EnhancedNotificationService.getUserPreferences(user.id);
      setPreferences(prefs);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  }, [user?.id]);
  
  // Setup real-time notifications
  const setupRealTime = useCallback(() => {
    if (!user?.id) return;
    
    // Cleanup existing subscription
    if (realtimeSubscriptionRef.current) {
      realtimeSubscriptionRef.current.unsubscribe();
    }
    
    // Setup new subscription
    const subscription = RealtimeNotificationService.setupRealtimeNotifications(
      user.id,
      (notification) => {
        console.log('Real-time notification received:', notification);
        
        // Add new notification to state
        setNotifications(prev => {
          const exists = prev.find(n => n.id === notification.id);
          if (exists) {
            // Update existing notification
            return prev.map(n => n.id === notification.id ? notification : n);
          } else {
            // Add new notification
            return [notification, ...prev];
          }
        });
        
        // Update unread count
        if (!(notification.isRead || notification.is_read)) {
          setUnreadCount(prev => prev + 1);
          
          // Show toast for new notification
          toast({
            title: notification.title,
            description: notification.message,
            duration: 5000
          });
        }
      },
      (status) => {
        setConnectionStatus(status);
        
        if (status.status === 'SUBSCRIBED' && !connectionStatus.isConnected) {
          toast({
            title: 'Bildirişlər bağlandı',
            description: 'Real-vaxt bildirişlər aktiv edildi',
            duration: 3000
          });
        } else if (status.status === 'CLOSED' && connectionStatus.isConnected) {
          toast({
            title: 'Bağlantı kəsildi',
            description: 'Real-vaxt bildirişlər deaktiv edildi',
            variant: 'destructive',
            duration: 5000
          });
        }
      }
    );
    
    realtimeSubscriptionRef.current = subscription;
  }, [user?.id, connectionStatus.isConnected, toast]);
  
  // Initialize on user change
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      fetchPreferences();
      setupRealTime();
    } else {
      // Reset state when user logs out
      setNotifications([]);
      setUnreadCount(0);
      setPreferences({});
      setError(null);
      
      if (realtimeSubscriptionRef.current) {
        realtimeSubscriptionRef.current.unsubscribe();
        realtimeSubscriptionRef.current = null;
      }
    }
    
    return () => {
      if (realtimeSubscriptionRef.current) {
        realtimeSubscriptionRef.current.unsubscribe();
      }
    };
  }, [user?.id, fetchNotifications, fetchPreferences, setupRealTime]);
  
  // Enhanced mark as read with optimistic updates
  const markAsRead = useCallback(async (id: string) => {
    if (!user?.id) return;
    
    try {
      // Optimistic update
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Call enhanced service
      const result = await EnhancedNotificationService.markAsRead(id, user.id);
      
      if (!result.success) {
        // Revert optimistic update on failure
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, isRead: false, is_read: false } : n)
        );
        setUnreadCount(prev => prev + 1);
        
        throw new Error(result.error || 'Failed to mark as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Xəta',
        description: 'Bildiriş oxunmuş kimi qeyd edilə bilmədi',
        variant: 'destructive',
        duration: 3000
      });
    }
  }, [user?.id, toast]);
  
  // Enhanced mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.id || notifications.length === 0) return;
    
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, is_read: true })));
      setUnreadCount(0);
      
      // Call enhanced service
      const result = await EnhancedNotificationService.markAllAsRead(user.id);
      
      if (!result.success) {
        // Revert optimistic update on failure
        await fetchNotifications();
        throw new Error(result.error || 'Failed to mark all as read');
      }
      
      toast({
        title: 'Bütün bildirişlər oxundu',
        description: `${notifications.length} bildiriş oxunmuş kimi qeyd edildi`,
        duration: 3000
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: 'Xəta',
        description: 'Bildirişlər oxunmuş kimi qeyd edilə bilmədi',
        variant: 'destructive',
        duration: 3000
      });
    }
  }, [user?.id, notifications.length, fetchNotifications, toast]);
  
  // Enhanced clear all notifications
  const clearAll = useCallback(async () => {
    if (!user?.id || notifications.length === 0) return;
    
    try {
      const notificationIds = notifications.map(n => n.id);
      
      // Optimistic update
      setNotifications([]);
      setUnreadCount(0);
      
      // Delete all notifications
      const results = await Promise.all(
        notificationIds.map(id => EnhancedNotificationService.deleteNotification(id, user.id))
      );
      
      const failedCount = results.filter(r => !r.success).length;
      
      if (failedCount > 0) {
        // Refresh on partial failure
        await fetchNotifications();
        throw new Error(`${failedCount} notification(s) could not be deleted`);
      }
      
      toast({
        title: 'Bütün bildirişlər silindi',
        description: `${notificationIds.length} bildiriş silindi`,
        duration: 3000
      });
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast({
        title: 'Xəta',
        description: 'Bildirişlər silinərkən xəta baş verdi',
        variant: 'destructive',
        duration: 3000
      });
    }
  }, [user?.id, notifications, fetchNotifications, toast]);
  
  // Enhanced add notification
  const addNotification = useCallback(async (notification: Partial<AppNotification>) => {
    if (!user?.id) return;
    
    try {
      const result = await EnhancedNotificationService.createNotification({
        userId: user.id,
        title: notification.title || 'Notification',
        message: notification.message || '',
        type: notification.type as any || 'info',
        priority: notification.priority as any || 'normal',
        relatedEntityId: notification.relatedEntityId,
        relatedEntityType: notification.relatedEntityType
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create notification');
      }
      
      // The notification will be added via real-time subscription
    } catch (error) {
      console.error('Error adding notification:', error);
      toast({
        title: 'Xəta',
        description: 'Bildiriş yaradıla bilmədi',
        variant: 'destructive',
        duration: 3000
      });
    }
  }, [user?.id, toast]);
  
  // Enhanced delete notification
  const deleteNotification = useCallback(async (id: string) => {
    if (!user?.id) return;
    
    try {
      // Find notification to check if it was unread
      const notification = notifications.find(n => n.id === id);
      const wasUnread = notification && !(notification.isRead || notification.is_read);
      
      // Optimistic update
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      // Call enhanced service
      const result = await EnhancedNotificationService.deleteNotification(id, user.id);
      
      if (!result.success) {
        // Revert optimistic update on failure
        await fetchNotifications();
        throw new Error(result.error || 'Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: 'Xəta',
        description: 'Bildiriş silinə bilmədi',
        variant: 'destructive',
        duration: 3000
      });
    }
  }, [user?.id, notifications, fetchNotifications, toast]);
  
  // Refresh notifications manually
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);
  
  // Get notifications by type
  const getNotificationsByType = useCallback((type: string) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);
  
  // Get notifications by priority
  const getNotificationsByPriority = useCallback((priority: string) => {
    return notifications.filter(n => n.priority === priority);
  }, [notifications]);
  
  // Update user preferences
  const updatePreferences = useCallback(async (prefs: Partial<any>) => {
    if (!user?.id) return;
    
    try {
      await EnhancedNotificationService.updateUserPreferences(user.id, prefs);
      setPreferences(prev => ({ ...prev, ...prefs }));
      
      toast({
        title: 'Tənzimləmələr yadda saxlandı',
        description: 'Bildiriş tənzimləmələriniz yeniləndi',
        duration: 3000
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: 'Xəta',
        description: 'Tənzimləmələr yadda saxlana bilmədi',
        variant: 'destructive',
        duration: 3000
      });
    }
  }, [user?.id, toast]);
  
  // Get analytics
  const getAnalytics = useCallback(async () => {
    if (!user?.id) return {};
    
    try {
      return await EnhancedNotificationService.getNotificationAnalytics(
        user.id,
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        new Date()
      );
    } catch (error) {
      console.error('Error getting analytics:', error);
      return {};
    }
  }, [user?.id]);
  
  // Reconnect real-time
  const reconnect = useCallback(async () => {
    try {
      await RealtimeNotificationService.reconnect();
      setupRealTime();
      
      toast({
        title: 'Yenidən bağlanılır',
        description: 'Real-vaxt bildirişlər yenidən aktivləşdirilir',
        duration: 3000
      });
    } catch (error) {
      console.error('Error reconnecting:', error);
      toast({
        title: 'Bağlantı xətası',
        description: 'Yenidən bağlana bilmədi',
        variant: 'destructive',
        duration: 3000
      });
    }
  }, [setupRealTime, toast]);
  
  // Value object for the context
  const value: EnhancedNotificationContextType = {
    notifications,
    unreadCount,
    connectionStatus,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    clearAll,
    addNotification,
    deleteNotification,
    refreshNotifications,
    getNotificationsByType,
    getNotificationsByPriority,
    preferences,
    updatePreferences,
    getAnalytics,
    reconnect
  };
  
  return (
    <EnhancedNotificationContext.Provider value={value}>
      {children}
    </EnhancedNotificationContext.Provider>
  );
};

export default EnhancedNotificationContext;
